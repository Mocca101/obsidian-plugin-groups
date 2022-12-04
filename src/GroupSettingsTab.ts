import {App, PluginSettingTab, Setting} from "obsidian";
import PluginGroupsMain from "../main";
import {PluginGroup} from "./Types";
import PluginGroupEditModal from "./PluginGroupEditModal";
import {disablePluginsOfGroup, enablePluginsOfGroup} from "./Utilities";

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

		for (let i = 0; i < this.plugin.settings.groups.length; i++) {
			const group = this.plugin.settings.groups[i];

			new Setting(containerEl)
				.setName(group.name)
				.addButton(btn => {
					btn.setButtonText('Enable All');
					btn.setIcon('power');
					btn.onClick(() => enablePluginsOfGroup(group));
				})
				.addButton(btn => {
					btn.setButtonText('Disable All');
					btn.setIcon('power-off');
					btn.onClick(() => disablePluginsOfGroup(group));
				})
				.addButton(btn => {
					btn.setIcon('pencil')
					btn.onClick(() => this.editGroup(group))
				})
		}

	}

	async addNewGroup() {
		const newGroup: PluginGroup = {
			name: this.newGroupName,
			plugins: [],
			active: false
		};
		new PluginGroupEditModal(this.app, this, newGroup).open();
		this.newGroupName = '';
	}

	editGroup(group: PluginGroup) {
		new PluginGroupEditModal(this.app, this, group).open();
	}
}
