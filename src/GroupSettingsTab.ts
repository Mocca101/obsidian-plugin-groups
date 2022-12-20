import {App, PluginSettingTab, Setting, TextComponent} from "obsidian";
import PluginGroupsMain from "../main";
import PluginGroupEditModal from "./PluginGroupEditModal";
import {generateGroupID} from "./Utilities";
import {PluginGroup} from "./PluginGroup";

export default class GroupSettingsTab extends PluginSettingTab {
	plugin: PluginGroupsMain;

	newGroupName: string;

	groupNameField: TextComponent;

	constructor(app: App, plugin: PluginGroupsMain) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {

		const {containerEl} = this;

		containerEl.empty();

		const generalParent = containerEl.createEl('h5', {text: 'General'});

		new Setting(generalParent)
			.setName('Generate Commands for Groups')
			.addToggle(tgl => {
				tgl.setValue(this.plugin.settings.generateCommands);
				tgl.onChange(value => this.plugin.settings.generateCommands = value);
			})

		const groupParent = containerEl.createEl('h5', {text: 'Groups'});

		let addBtnEl: HTMLButtonElement;

		new Setting(groupParent)
			.setName('Add Group')
			.addText(text => {
				this.groupNameField = text;
				this.groupNameField.setPlaceholder('Enter group name...');
				this.groupNameField.setValue(this.newGroupName);
				this.groupNameField.onChange(val => {
						this.newGroupName = val;
						if (addBtnEl) {
							val.length > 0 ?
								addBtnEl.removeClass('btn-disabled')
								: addBtnEl.addClass('btn-disabled');
						}
					})
				}
			)
			.addButton(btn => {
					btn
						.setIcon('plus')
						.onClick(() => this.addNewGroup());
					addBtnEl = btn.buttonEl;
					addBtnEl.addClass('btn-disabled');
				}
			)

		this.GenerateGroupList(groupParent);
	}

	GenerateGroupList(groupParent: HTMLElement) {
		this.plugin.settings.groupsMap.forEach((group => {
			const groupSetting = new Setting(groupParent)
				.setName(group.name)
				.addButton(btn => {
					btn.setButtonText('Enable All');
					btn.setIcon('power');
					btn.onClick(() => {
						group.enable()
					});
				})
				.addButton(btn => {
					btn.setButtonText('Disable All');
					btn.setIcon('power-off');
					btn.onClick(() => group.disable());
				})
				.addButton(btn => {
					btn.setIcon('pencil')
					btn.onClick(() => this.editGroup(group))
				});
			if(group.enableAtStartup) {
				groupSetting.setDesc('Load plugins delayed by ' + group.delay + ' seconds');
			}
		}));

	}

	async addNewGroup() {
		const id = generateGroupID(this.newGroupName,{ map: this.plugin.settings.groupsMap});

		if(!id) {
			console.error('Failed to create Group, please choose a different Name as there have been to many groups with the same name')
			return;
		}

		const newGroup = new PluginGroup({
			id: id,
			name: this.newGroupName
		});
		new PluginGroupEditModal(this.app, this, newGroup).open();
		this.newGroupName = '';
		if(this.groupNameField) {
			this.groupNameField.setValue('');
		}
	}

	editGroup(group: PluginGroup) {
		new PluginGroupEditModal(this.app, this, group).open();
	}
}
