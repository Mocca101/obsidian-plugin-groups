import {Plugin} from 'obsidian';
import {PersistentSettings, PluginGroupsSettings} from "./src/Types";
import GroupSettingsTab from "./src/GroupSettingsTab";
import * as process from "process";
import {PluginGroup} from "./src/PluginGroup";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true
}

export default class PluginGroupsMain extends Plugin {

	static disableStartupTimeout = 20;
	static pluginId = 'obsidian-plugin-groups';

	settings: PluginGroupsSettings;

	async onload() {
		await this.loadSettings();

		PluginGroupsMain.pluginId = this.manifest.id;

		this.addSettingTab(new GroupSettingsTab(this.app, this));

		if(!this.settings.groupsMap) {
			return;
		}

		if(this.settings.generateCommands) {
			this.settings.groupsMap.forEach(group => this.AddGroupCommands(group));
		}

		// TODO: Improve hacky solution if possible
		if(process.uptime()) {
			if(process.uptime() < PluginGroupsMain.disableStartupTimeout) {
				this.settings.groupsMap.forEach(group => {
					if (group.enableAtStartup) group.startup();
				});
			}
		}
	}

	onunload() {
	}

	AddGroupCommands(group: PluginGroup) {
		this.addCommand({
			id: 'plugin-groups-enable' + group.id.toLowerCase(),
			name: 'Plugin Groups: Enable ' + group.name,
			icon: 'power',
			checkCallback: (checking: boolean) => {
				if(!this.shouldShowCommand(group)) return false;
				if (checking) return true;
				group.enable();
			}
		});
		this.addCommand({
			id: 'plugin-groups-disable' + group.id.toLowerCase(),
			name: 'Plugin Groups: Disable ' + group.name,
			icon: 'power-off',
			checkCallback: (checking: boolean) => {
				if(!this.shouldShowCommand(group)) return false;
				if (checking) return true;
				group.disable();
			}
		});
	}

	shouldShowCommand(group: PluginGroup): boolean {
		if (!this.settings.groupsMap.has(group.id)) return false;
		if (!this.settings.generateCommands) return false;
		if (!group.generateCommands) return false;
		return true;
	}

	async loadSettings() {
		const savedSettings: PersistentSettings = await this.loadData();

		this.settings = Object.assign({}, DEFAULT_SETTINGS);

		if(savedSettings?.groups && Array.isArray(savedSettings.groups)) {
			this.settings.groupsMap = new Map<string, PluginGroup>();
			savedSettings.groups.forEach(g => {
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
		const persistentSettings: PersistentSettings = {
			groups:  Array.from(this.settings.groupsMap.values()),
			generateCommands: this.settings.generateCommands,
		}

		await this.saveData(persistentSettings);
	}
}
