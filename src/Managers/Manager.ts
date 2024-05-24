import GroupSettingsMenu from "@/Components/Modals/GroupSettingsMenu";
import { PluginGroup } from "@/DataStructures/PluginGroup";
import { pluginId } from "@/Utils/Constants";
import type { PersistentSettings, PluginGroupsSettings } from "@/Utils/Types";
import type PgMain from "@/main";
import { settingsStore } from "@/stores/main-store";
import { setIcon } from "obsidian";
import { get } from "svelte/store";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true,
	showNoticeOnGroupLoad: "none",
	devLogs: false,
	devices: [],
	doLoadSynchronously: true,
	showStatusbarIcon: "None",
};

export default class Manager {
	private static instance?: Manager;


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

		if (!savedSettings) {
			return;
		}


		settingsStore.update((s) => {
			for (const key in s) {
				if (key in savedSettings) {
					// @ts-ignore
					s[key] = savedSettings[key];
				}
			}

			if(!savedSettings.groups || !Array.isArray(savedSettings.groups)) return s;

			s.groupsMap = new Map<string, PluginGroup>();
			for (const g of savedSettings.groups) {
				s.groupsMap.set(g.id, new PluginGroup(g));
			}

			return s;
		});
	}

	/***
	 * Returns a map of each plugin that is in 1 or more groups, and its connected groups.
	 * Format: PluginID -> Set of connected groupsId's
	 */
	public get mapOfPluginsConnectedGroupsIncludingParentGroups(): Map<
		string,
		Set<string>
	> {
		const pluginsMemMap = new Map<string, Set<string>>();

		for (const group of this.groupsMap.values()) {
			for (const plugin of group.plugins) {
				if (!pluginsMemMap.has(plugin.id)) {
					pluginsMemMap.set(plugin.id, new Set<string>());
				}
				pluginsMemMap.get(plugin.id)?.add(group.id);
			}
		}

		return pluginsMemMap;
	}

	public get mapOfPluginsDirectlyConnectedGroups(): Map<string, Set<string>> {
		const pluginsMemMap = new Map<string, Set<string>>();

		for (const group of this.groupsMap.values()) {
			for (const plugin of group.plugins) {
				if (!pluginsMemMap.has(plugin.id)) {
					pluginsMemMap.set(plugin.id, new Set<string>());
				}
				pluginsMemMap.get(plugin.id)?.add(group.id);
			}
		}
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
		// const persistentSettings: PersistentSettings = {
		// 	groups: Array.from(this.groupsMap.values() ?? []),
		// 	generateCommands:
		// 		this.settings.generateCommands ?? DEFAULT_SETTINGS.generateCommands,
		// 	showNoticeOnGroupLoad:
		// 		this.settings.showNoticeOnGroupLoad ??
		// 		DEFAULT_SETTINGS.showNoticeOnGroupLoad,
		// 	devLogs: this.settings.devLogs ?? DEFAULT_SETTINGS.devLogs,
		// 	devices: this.settings.devices ?? DEFAULT_SETTINGS.devices,
		// 	doLoadSynchronously:
		// 		this.settings.doLoadSynchronously ??
		// 		DEFAULT_SETTINGS.doLoadSynchronously,
		// 	showStatusbarIcon:
		// 		this.settings.showStatusbarIcon ?? DEFAULT_SETTINGS.showStatusbarIcon,
		// };
		// await this.main.saveData(persistentSettings);
	}

	// Getters & Setters

	get doLoadSynchronously(): boolean {
		return get(settingsStore).doLoadSynchronously;
	}

	set doLoadSynchronously(value: boolean) {
		settingsStore.update((s) => {
			s.doLoadSynchronously = value;
			return s;
		});
	}

	get showStatusbarIcon() {
		return get(settingsStore).showStatusbarIcon;
	}

	set showStatusbarIcon(value) {
		settingsStore.update((s) => {
			s.showStatusbarIcon = value;
			return s;
		});
	}

	get devLog(): boolean {
		return get(settingsStore).devLogs;
	}
	set devLog(value: boolean) {
		settingsStore.update((s) => {
			s.devLogs = value;
			return s;
		});
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
		return get(settingsStore).groupsMap;
	}

	get generateCommands(): boolean {
		return get(settingsStore).generateCommands;
	}

	set shouldGenerateCommands(val: boolean) {
		settingsStore.update((s) => {
			s.generateCommands = val;
			return s;
		});
	}

	get showNoticeOnGroupLoad(): "none" | "short" | "normal" {
		return get(settingsStore).showNoticeOnGroupLoad;
	}

	set showNoticeOnGroupLoad(val: "none" | "short" | "normal") {
		settingsStore.update((s) => {
			s.showNoticeOnGroupLoad = val;
			return s;
		});
	}

	get devices(): string[] {
		return get(settingsStore).devices;
	}

	private statusbarItem: HTMLElement;

	public updateStatusbarItem() {
		if (this.statusbarItem) {
			this.statusbarItem.remove();
		}
		if (this.showStatusbarIcon === "None") {
			return;
		}

		this.statusbarItem = this.pluginInstance.addStatusBarItem();
		this.statusbarItem.addClasses(["pg-statusbar-icon", "mod-clickable"]);
		this.statusbarItem.tabIndex = 0;

		if (this.showStatusbarIcon === "Text") {
			this.statusbarItem.textContent = "Plugins";
		} else if (this.showStatusbarIcon === "Icon") {
			setIcon(this.statusbarItem, "boxes");
		}

		const menu = new GroupSettingsMenu(this.statusbarItem, {});

		this.statusbarItem.onfocus = () => {
			menu.updatePosition();
		};
	}
}
