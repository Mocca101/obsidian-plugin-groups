import {App, PluginSettingTab, Setting} from "obsidian";
import PluginGroupsMain from "../main";
import {PluginGroup, PluginInfo} from "./Types";
import PluginGroupEditModal from "./PluginGroupEditModal";

export default class GroupSettingsTab extends PluginSettingTab {
	plugin: PluginGroupsMain;

	newGroupName: string;

	availablePlugins: PluginInfo[];


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
				.addToggle(tgl => {
					tgl.setValue(group.active);
					tgl.onChange(value => this.toggleGroup(value ,i))
				})
				.addButton(btn => {
					btn.setIcon('pencil')
					btn.onClick(() => this.editGroup(group))
				})
		}

	}

	async toggleGroup(enabled: boolean, groupID: number) {
		this.plugin.settings.groups[groupID].active = enabled;
		await this.plugin.saveSettings();
		this.display();

		if(enabled === true) {
			for (const plugin of this.plugin.settings.groups[groupID].plugins) {
				// @ts-ignore
				await app.plugins.enablePlugin(plugin.id);
			}
		}
		else {
			for (const plugin of this.plugin.settings.groups[groupID].plugins) {
				// @ts-ignore
				await app.plugins.disablePlugin(plugin.id);
			}
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
