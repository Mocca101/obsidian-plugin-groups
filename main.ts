import {Plugin} from 'obsidian';
import {PersistentSettings, PluginGroupsSettings} from "./src/Types";
import GroupSettingsTab from "./src/GroupSettingsTab";
import * as process from "process";
import {PluginGroup} from "./src/PluginGroup";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>()
}

export default class PluginGroupsMain extends Plugin {

	static pluginId = 'obsidian-plugin-groups';

	settings: PluginGroupsSettings;

	async onload() {
		await this.loadSettings();

		PluginGroupsMain.pluginId = this.manifest.id;

		if(this.settings.groupsMap) {
			this.settings.groupsMap.forEach(group => {
				this.addCommand({
					id: 'plugin-groups-enable' + group.id.toLowerCase(),
					name: 'Plugin Groups: Enable ' + group.name,
					icon: 'power',
					checkCallback: (checking: boolean) => {
						if (!this.settings.groupsMap.has(group.id)) return false;
						if (checking) return true;
						group.enable();

					}
				});

				this.addCommand({
					id: 'plugin-groups-disable' + group.id.toLowerCase(),
					name: 'Plugin Groups: Disable ' + group.name,
					icon: 'power-off',
					checkCallback: (checking: boolean) => {
						if (!this.settings.groupsMap.has(group.id)) return false;
						if (checking) return true;
						group.disable();
					}
				})
			})
		}
		this.addSettingTab(new GroupSettingsTab(this.app, this));

		// TODO: Improve hacky solution if possible
		const disableStartupTimeout = 40;

		if(process.uptime()) {
			if(process.uptime() < disableStartupTimeout) {
				this.settings.groupsMap.forEach(group => {
					if (group.active && group.isStartup) group.startup();
				});
			}
		}
	}

	onunload() {
	}

	async loadSettings() {
		const savedSettings: PersistentSettings = await this.loadData();

		this.settings = Object.assign({}, DEFAULT_SETTINGS);

		if(savedSettings?.groups && Array.isArray(savedSettings.groups)) {
			this.settings.groupsMap = new Map<string, PluginGroup>()
			savedSettings.groups.forEach(g => {
				console.log('group', g);
				this.settings.groupsMap.set(g.id, new PluginGroup({
					id: g.id,
					name: g.name,
					pg: g
				}));
			});
		}
		console.log('save', this.settings);
	}

	async saveSettings() {
		await this.saveData({groups: Array.from(this.settings.groupsMap.values())});
	}
}
