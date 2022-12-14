import {PersistentSettings, PluginGroupsSettings} from "../Utils/Types";
import PgMain from "../../main";
import {PluginGroup} from "../PluginGroup";
import {pluginId} from "../Utils/Constants";
import PluginManager from "./PluginManager";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true,
	showNoticeOnGroupLoad: 'none',
	devices: []
}

export default class Manager {

	private static instance?: Manager;

	private settings: PluginGroupsSettings;

	private main: PgMain;

	private constructor() {	}

	public static getInstance() : Manager {
		if(!Manager.instance) {
			Manager.instance = new Manager();
		}
		return Manager.instance;
	}

	async init(main: PgMain) : Promise<Manager> {
		this.main = main;
		await this.loadSettings();
		return this;
	}

	async loadSettings() {
		const savedSettings: PersistentSettings = await this.main.loadData();

		this.settings = Object.assign({}, DEFAULT_SETTINGS);

		if(!savedSettings) {return;}

		Object.keys(this.settings).forEach(function(key) {
			if (key in savedSettings) {
				// @ts-ignore
				Manager.getInstance().settings[key] = savedSettings[key];
			}
		});

		if(savedSettings.groups && Array.isArray(savedSettings.groups)) {
			this.settings.groupsMap = new Map<string, PluginGroup>();
			savedSettings.groups.forEach(g => {
				this.groupsMap.set(g.id, new PluginGroup(g));
			});
		}
	}


	/***
	 * Returns a map of each plugin that is in 1 or more groups, and it's connected groups.
	 * Format: PluginID -> Set of connected groupsId's
	 */
	public get mapOfPluginsConnectedGroupsIncludingParentGroups() : Map<string, Set<string>> {
		const pluginsMemMap = new Map<string, Set<string>>();

		this.groupsMap.forEach(group => {
			group.getAllPluginIdsControlledByGroup().forEach(plugin => {
				if(!pluginsMemMap.has(pluginId)) {
					pluginsMemMap.set(plugin, new Set<string>());
				}
				pluginsMemMap.get(plugin)?.add(group.id);
			})
		})
		return pluginsMemMap;
	}

	public get mapOfPluginsDirectlyConnectedGroups() : Map<string, Set<string>> {
		const pluginsMemMap = new Map<string, Set<string>>();

		this.groupsMap.forEach(group => {
			group.plugins.forEach(plugin => {
				if(!pluginsMemMap.has(pluginId)) {
					pluginsMemMap.set(plugin.id, new Set<string>());
				}
				pluginsMemMap.get(plugin.id)?.add(group.id);
			})
		})
		return pluginsMemMap;
	}

	async saveSettings() {
		const persistentSettings: PersistentSettings = {
			groups:  Array.from(this.groupsMap.values() ?? []),
			generateCommands: this.settings.generateCommands ?? DEFAULT_SETTINGS.generateCommands,
			showNoticeOnGroupLoad: this.settings.showNoticeOnGroupLoad ?? DEFAULT_SETTINGS.showNoticeOnGroupLoad,
			devices: this.settings.devices ?? DEFAULT_SETTINGS.devices
		}
		await this.main.saveData(persistentSettings);
	}




	// Getters & Setters


	get pluginInstance() : PgMain {
		return this.main;
	}

	get groupsMap() : Map<string, PluginGroup> {
		return this.settings.groupsMap;
	}

	get generateCommands() : boolean {
		return this.settings.generateCommands;
	}

	set shouldGenerateCommands(val : boolean) {
		this.settings.generateCommands = val;
	}

	get showNoticeOnGroupLoad() : string {
		return this.settings.showNoticeOnGroupLoad;
	}

	set showNoticeOnGroupLoad(val: string) {
		this.settings.showNoticeOnGroupLoad = val;
	}

	get devices() : string[] {
		return this.settings.devices;
	}

}
