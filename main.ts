import {Command, Plugin} from 'obsidian';
import {PersistentSettings, PluginGroupsSettings} from "./src/Types";
import GroupSettingsTab from "./src/GroupSettingsTab";
import {PluginGroup} from "./src/PluginGroup";
import {getInstalledPluginFromId, getInstalledPluginIds, getKnownPluginIds, setKnownPluginIds} from "./src/Utilities";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true,
	showNoticeOnGroupLoad: 'none',
	devices: []
}

export default class PgMain extends Plugin {
	static disableStartupTimeout = 25;
	static pluginId = 'obsidian-plugin-groups';
	static deviceNameKey = 'obsidian-plugin-groups-device-name';
	static knownPluginIdsKey = 'obsidian-plugin-groups-known-plugins';


	enableGroupCommandPrefix = 'plugin-groups-enable-';
	disableGroupCommandPrefix = 'plugin-groups-disable-';
	cnEnablePrefix = 'Plugin Groups: Enable ';
	cnDisablePrefix = 'Plugin Groups: Disable ';

	commandMap: Map<string, Command> = new Map<string, Command>();

	settings: PluginGroupsSettings;

	static instance?: PgMain;

	async onload() {
		if(PgMain.instance) { return; }
		else {PgMain.instance = this; }
		PgMain.pluginId = this.manifest.id;

		await this.loadSettings();

		this.loadNewPlugins();

		this.addSettingTab(new GroupSettingsTab(this.app, this));

		if(!PgMain.instance.settings.groupsMap) {
			return;
		}

		if(PgMain.instance.settings.generateCommands) {
			PgMain.instance.settings.groupsMap.forEach(group => this.AddGroupCommands(group.id));		}

		// TODO: Improve hacky solution if possible
		if(window.performance.now() / 1000 < PgMain.disableStartupTimeout) {
			PgMain.instance.settings.groupsMap.forEach(group => {
				if (group.loadAtStartup) group.startup();
			});
		}
	}

	private loadNewPlugins() {
		if (getKnownPluginIds() === null) {
			setKnownPluginIds(getInstalledPluginIds());
		} else {
			const knownPlugins = getKnownPluginIds();
			const installedPlugins = getInstalledPluginIds();
			setKnownPluginIds(installedPlugins);

			const newPlugins = new Set([...installedPlugins].filter(id => !knownPlugins?.has(id)));

			if(newPlugins.size <= 0) { return; }

			PgMain.instance?.settings.groupsMap.forEach(g => {
				if(g.autoAdd) {
					newPlugins.forEach(pluginId => {
						const plugin = getInstalledPluginFromId(pluginId);
						if(plugin) {
							g.addPlugin(plugin);
						}
					})
				}
			});

		}
	}

	onunload() {
		if(PgMain.instance) {
			PgMain.instance = undefined;
		}
	}

	AddGroupCommands(groupID: string) {
		const group = PgMain.groupFromId(groupID);
		if(!group) return;
		const enableId = this.enableGroupCommandPrefix + group.id;

		this.commandMap.set(enableId, this.addCommand({
			id: enableId,
			name: this.cnEnablePrefix + group.name,
			icon: 'power',
			checkCallback: (checking: boolean) => {
				if(!this.shouldShowCommand(group)) return false;
				if (checking) return true;
				group.enable();
			}
		}));

		const disableId = this.disableGroupCommandPrefix + group.id;

		this.commandMap.set(disableId, this.addCommand({
			id: disableId,
			name: this.cnDisablePrefix + group.name,
			icon: 'power-off',
			checkCallback: (checking: boolean) => {
				if(!this.shouldShowCommand(group)) return false;
				if (checking) return true;
				group.disable();
			}
		}));
	}

	shouldShowCommand(group: PluginGroup): boolean {
		if (!PgMain.instance?.settings.groupsMap.has(group.id)) return false;
		if (!PgMain.instance?.settings.generateCommands) return false;
		if(!group.groupActive()) { return false; }
		return group.generateCommands;
	}

	updateCommand(groupId: string) {
		const group = PgMain.groupFromId(groupId);
		if(!group) {return;}

		let command = this.commandMap.get(this.enableGroupCommandPrefix + group.id);
		if(command) {
			command.name = this.cnEnablePrefix + group.name;
		}

		command = this.commandMap.get(this.disableGroupCommandPrefix + group.id)
		if(command) {
			command.name = this.cnDisablePrefix + group.name;
		}
	}

	async loadSettings() {
		const savedSettings: PersistentSettings = await this.loadData();

		if(!PgMain.instance) {return;}

		PgMain.instance.settings = Object.assign({}, DEFAULT_SETTINGS);

		if(!savedSettings) {return;}

		if(!PgMain.instance.settings) {return;}

		Object.keys(PgMain.instance?.settings).forEach(function(key) {
			if (key in savedSettings) {
				// @ts-ignore
				PgMain.instance.settings[key] = savedSettings[key];
			}
		});

		if(savedSettings.groups && Array.isArray(savedSettings.groups)) {
			PgMain.instance.settings.groupsMap = new Map<string, PluginGroup>();
			savedSettings.groups.forEach(g => {
				PgMain.instance?.settings.groupsMap.set(g.id, new PluginGroup(g));
			});
		}

	}

	async saveSettings() {
		const persistentSettings: PersistentSettings = {
			groups:  Array.from(PgMain.instance?.settings.groupsMap.values() ?? []),
			generateCommands: PgMain.instance?.settings.generateCommands ?? DEFAULT_SETTINGS.generateCommands,
			showNoticeOnGroupLoad: PgMain.instance?.settings.showNoticeOnGroupLoad ?? DEFAULT_SETTINGS.showNoticeOnGroupLoad,
			devices: PgMain.instance?.settings.devices ?? DEFAULT_SETTINGS.devices
		}
		await this.saveData(persistentSettings);
	}

	static groupFromId(id:string) : PluginGroup | undefined{
		return PgMain.instance?.settings.groupsMap.get(id);
	}
}
