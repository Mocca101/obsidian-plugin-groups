import { PersistentSettings, PluginGroupsSettings } from '../Utils/Types';
import PgMain from '../../main';
import { PluginGroup } from '../DataStructures/PluginGroup';
import { pluginId } from '../Utils/Constants';
import { setIcon } from 'obsidian';
import GroupSettingsMenu from '../Components/Modals/GroupSettingsMenu';

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true,
	showNoticeOnGroupLoad: 'none',
	devLogs: false,
	devices: [],
	doLoadSynchronously: true,
	showStatusbarIcon: 'None',
};

export default class Manager {
	private static instance?: Manager;

	private settings: PluginGroupsSettings;

	private main: PgMain;

	private constructor() {}

	public static getInstance(): Manager {
		if (!Manager.instance) {
			Manager.instance = new Manager();
		}
		return Manager.instance;
	}

	async init(main: PgMain): Promise<Manager> {
		this.main = main;
		await this.loadSettings();
		return this;
	}

	async loadSettings() {
		const savedSettings: PersistentSettings = await this.main.loadData();

		this.settings = Object.assign({}, DEFAULT_SETTINGS);

		if (!savedSettings) {
			return;
		}

		Object.keys(this.settings).forEach(function (key) {
			if (key in savedSettings) {
				// @ts-ignore
				Manager.getInstance().settings[key] = savedSettings[key];
			}
		});

		if (savedSettings.groups && Array.isArray(savedSettings.groups)) {
			this.settings.groupsMap = new Map<string, PluginGroup>();
			savedSettings.groups.forEach((g) => {
				this.groupsMap.set(g.id, new PluginGroup(g));
			});
		}
	}

	/***
	 * Returns a map of each plugin that is in 1 or more groups, and it's connected groups.
	 * Format: PluginID -> Set of connected groupsId's
	 */
	public get mapOfPluginsConnectedGroupsIncludingParentGroups(): Map<
		string,
		Set<string>
	> {
		const pluginsMemMap = new Map<string, Set<string>>();

		this.groupsMap.forEach((group) => {
			group.getAllPluginIdsControlledByGroup().forEach((plugin) => {
				if (!pluginsMemMap.has(pluginId)) {
					pluginsMemMap.set(plugin, new Set<string>());
				}
				pluginsMemMap.get(plugin)?.add(group.id);
			});
		});
		return pluginsMemMap;
	}

	public get mapOfPluginsDirectlyConnectedGroups(): Map<string, Set<string>> {
		const pluginsMemMap = new Map<string, Set<string>>();

		this.groupsMap.forEach((group) => {
			group.plugins.forEach((plugin) => {
				if (!pluginsMemMap.has(plugin.id)) {
					pluginsMemMap.set(plugin.id, new Set<string>());
				}
				pluginsMemMap.get(plugin.id)?.add(group.id);
			});
		});
		return pluginsMemMap;
	}

	public getGroupsOfPlugin(pluginId: string): PluginGroup[] {
		const groups: PluginGroup[] = [];
		for (const group of this.groupsMap.values()) {
			if (group.plugins.find((plugin) => plugin.id === pluginId)) {
				groups.push(group);
			}
		}
		return groups;
	}

	async saveSettings() {
		const persistentSettings: PersistentSettings = {
			groups: Array.from(this.groupsMap.values() ?? []),
			generateCommands:
				this.settings.generateCommands ??
				DEFAULT_SETTINGS.generateCommands,
			showNoticeOnGroupLoad:
				this.settings.showNoticeOnGroupLoad ??
				DEFAULT_SETTINGS.showNoticeOnGroupLoad,
			devLogs: this.settings.devLogs ?? DEFAULT_SETTINGS.devLogs,
			devices: this.settings.devices ?? DEFAULT_SETTINGS.devices,
			doLoadSynchronously:
				this.settings.doLoadSynchronously ??
				DEFAULT_SETTINGS.doLoadSynchronously,
			showStatusbarIcon:
				this.settings.showStatusbarIcon ??
				DEFAULT_SETTINGS.showStatusbarIcon,
		};
		await this.main.saveData(persistentSettings);
	}

	// Getters & Setters

	get doLoadSynchronously(): boolean {
		return this.settings.doLoadSynchronously;
	}

	set doLoadSynchronously(value: boolean) {
		this.settings.doLoadSynchronously = value;
	}

	get showStatusbarIcon() {
		return this.settings.showStatusbarIcon;
	}

	set showStatusbarIcon(value) {
		this.settings.showStatusbarIcon = value;
	}

	get devLog(): boolean {
		return this.settings.devLogs;
	}
	set devLog(value: boolean) {
		this.settings.devLogs = value;
	}

	get pluginInstance(): PgMain {
		return this.main;
	}

	public get pluginsManifests() {
		return this.obsidianPluginsObject.manifests;
	}

	public get obsidianPluginsObject() {
		// @ts-ignore
		return this.main.app.plugins;
	}

	get groupsMap(): Map<string, PluginGroup> {
		return this.settings.groupsMap;
	}

	get generateCommands(): boolean {
		return this.settings.generateCommands;
	}

	set shouldGenerateCommands(val: boolean) {
		this.settings.generateCommands = val;
	}

	get showNoticeOnGroupLoad(): string {
		return this.settings.showNoticeOnGroupLoad;
	}

	set showNoticeOnGroupLoad(val: string) {
		this.settings.showNoticeOnGroupLoad = val;
	}

	get devices(): string[] {
		return this.settings.devices;
	}

	private statusbarItem: HTMLElement;

	public updateStatusbarItem() {
		if (this.statusbarItem) {
			this.statusbarItem.remove();
		}
		if (this.showStatusbarIcon === 'None') {
			return;
		}

		this.statusbarItem = this.pluginInstance.addStatusBarItem();
		this.statusbarItem.addClasses(['pg-statusbar-icon', 'mod-clickable']);
		this.statusbarItem.tabIndex = 0;

		if (this.showStatusbarIcon === 'Text') {
			this.statusbarItem.textContent = 'Plugins';
		} else if (this.showStatusbarIcon === 'Icon') {
			setIcon(this.statusbarItem, 'boxes');
		}

		const menu = new GroupSettingsMenu(this.statusbarItem, {});

		this.statusbarItem.onfocus = () => {
			menu.updatePosition();
		};
	}
}
