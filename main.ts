import {Plugin} from 'obsidian';
import {PersistentSettings, PluginGroupsSettings} from "./src/Types";
import GroupSettingsTab from "./src/GroupSettingsTab";
import * as process from "process";
import {PluginGroup} from "./src/PluginGroup";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true
}

export default class PgMain extends Plugin {

	static disableStartupTimeout = 20;
	static pluginId = 'obsidian-plugin-groups';

	settings: PluginGroupsSettings;

	static instance?: PgMain;

	async onload() {
		if(PgMain.instance) { return; }
		else {PgMain.instance = this; }

		await this.loadSettings();

		PgMain.pluginId = this.manifest.id;

		this.addSettingTab(new GroupSettingsTab(this.app, this));

		if(!PgMain.instance.settings.groupsMap) {
			return;
		}

		if(PgMain.instance.settings.generateCommands) {
			PgMain.instance.settings.groupsMap.forEach(group => this.AddGroupCommands(group));
		}

		// TODO: Improve hacky solution if possible
		if(process.uptime()) {
			if(process.uptime() < PgMain.disableStartupTimeout) {
				PgMain.instance.settings.groupsMap.forEach(group => {
					if (group.enableAtStartup) group.startup();
				});
			}
		}
	}

	onunload() {
		if(PgMain.instance) {
			PgMain.instance = undefined;
		}
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
		if (!PgMain.instance?.settings.groupsMap.has(group.id)) return false;
		if (!PgMain.instance?.settings.generateCommands) return false;
		return group.generateCommands;
	}

	async loadSettings() {
		const savedSettings: PersistentSettings = await this.loadData();

		if(!PgMain.instance) {return;}

		PgMain.instance.settings = Object.assign({}, DEFAULT_SETTINGS);
		console.log("-> PgMain.settings", PgMain.instance?.settings);

		if(savedSettings?.groups && Array.isArray(savedSettings.groups)) {
			PgMain.instance.settings.groupsMap = new Map<string, PluginGroup>();
			savedSettings.groups.forEach(g => {
				PgMain.instance?.settings.groupsMap.set(g.id, new PluginGroup({
					id: g.id,
					name: g.name,
					pg: g
				}));
			});
		}
	}

	async saveSettings() {
		console.log("-> PgMain.settings.groupsMap", PgMain.instance?.settings);

		const persistentSettings: PersistentSettings = {
			groups:  Array.from(PgMain.instance?.settings.groupsMap.values() ?? []),
			generateCommands: PgMain.instance?.settings.generateCommands ?? DEFAULT_SETTINGS.generateCommands,
		}
		await this.saveData(persistentSettings);
	}

	static groupFromId(id:string) : PluginGroup | undefined{
		return PgMain.instance?.settings.groupsMap.get(id);
	}
}
