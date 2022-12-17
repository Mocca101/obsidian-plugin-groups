import {App, PluginSettingTab, Setting} from "obsidian";
import PluginGroupsMain from "../main";
import PluginGroupEditModal from "./PluginGroupEditModal";
import {generateGroupID} from "./Utilities";
import {PluginGroup} from "./PluginGroup";

export default class GroupSettingsTab extends PluginSettingTab {
	plugin: PluginGroupsMain;

	newGroupName: string;

	constructor(app: App, plugin: PluginGroupsMain) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {

		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h5', {text: 'Groups'});

		new Setting(containerEl)
			.setName('Groups')
			.setDesc('Your plugin Groups')
			.addText(text => text
				.setPlaceholder('Group name')
				.onChange(val => {
					this.newGroupName = val;
				})
			)
			.addButton(btn => btn
				.setIcon('plus')
				.onClick(() => this.addNewGroup())
			)

		this.plugin.settings.groups.forEach((group => {
			new Setting(containerEl)
				.setName(group.name)
				.addButton(btn => {
					btn.setButtonText('Enable All');
					btn.setIcon('power');
					btn.onClick(() => group.enable());
				})
				.addButton(btn => {
					btn.setButtonText('Disable All');
					btn.setIcon('power-off');
					btn.onClick(() => group.disable());
				})
				.addButton(btn => {
					btn.setIcon('pencil')
					btn.onClick(() => this.editGroup(group))
				})
		}));

	}

	async addNewGroup() {

		const id = generateGroupID(this.newGroupName, Array.from(this.plugin.settings.groups.keys()));

		if(!id) {
			console.error('Failed to create Group, please choose a different Name as there have been to many groups with the same name')
			return;
		}

		const newGroup = new PluginGroup(id, this.newGroupName);
		new PluginGroupEditModal(this.app, this, newGroup).open();
		this.newGroupName = '';
	}

	editGroup(group: PluginGroup) {
		new PluginGroupEditModal(this.app, this, group).open();
	}
}
