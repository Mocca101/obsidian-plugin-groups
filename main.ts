import {Plugin} from 'obsidian';
import {PluginGroupsSettings} from "./src/Types";
import GroupSettingsTab from "./src/GroupSettingsTab";
import {disablePluginsOfGroup, enablePluginsOfGroup} from "./src/Utilities";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groups: []
}

export default class PluginGroupsMain extends Plugin {

	static pluginId = 'obsidian-plugin-groups';

	settings: PluginGroupsSettings;

	async onload() {
		await this.loadSettings();

		PluginGroupsMain.pluginId = this.manifest.id;

		this.settings.groups.forEach(group => {
			this.addCommand({
				id: 'plugin-groups-enable'+group.name.toLowerCase(),
				name: 'Plugin Groups: Enable ' + group.name,
				icon: 'power',
				checkCallback: (checking: boolean) => {
					if(!this.settings.groups.map(g => g.name).contains(group.name)) return false;
					if(checking) return true;
					enablePluginsOfGroup(group);

				}
			});

			this.addCommand({
				id: 'plugin-groups-disable'+group.name.toLowerCase(),
				name: 'Plugin Groups: Disable ' + group.name,
				icon: 'power-off',
				checkCallback: (checking: boolean) => {
					if(!this.settings.groups.map(g => g.name).contains(group.name)) return false;
					if(checking) return true;
					disablePluginsOfGroup(group);
				}
			})
		})

		this.addSettingTab(new GroupSettingsTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
