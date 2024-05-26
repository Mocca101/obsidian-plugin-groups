import GroupSettingsMenu from "@/Components/Modals/GroupSettingsMenu";
import { PluginGroup } from "@/DataStructures/PluginGroup";
import type { PersistentSettings  } from "@/Utils/Types";
import { pluginInstance, settingsStore } from "@/stores/main-store";
import { setIcon } from "obsidian";
import { get } from "svelte/store";

export default class Manager {
	private static instance?: Manager;

	public static getInstance(): Manager {
		if (!Manager.instance) {
			Manager.instance = new Manager();
		}
		return Manager.instance;
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

		for (const group of get(settingsStore).groupsMap.values()) {
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

		for (const group of get(settingsStore).groupsMap.values()) {
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
		for (const group of get(settingsStore).groupsMap.values()) {
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

	private statusbarItem: HTMLElement;

	public updateStatusbarItem() {
		if (this.statusbarItem) {
			this.statusbarItem.remove();
		}
		if (get(settingsStore).showStatusbarIcon === "None") {
			return;
		}

		this.statusbarItem = get(pluginInstance).addStatusBarItem();
		this.statusbarItem.addClasses(["pg-statusbar-icon", "mod-clickable"]);
		this.statusbarItem.tabIndex = 0;

		if (get(settingsStore).showStatusbarIcon === "Text") {
			this.statusbarItem.textContent = "Plugins";
		} else if (get(settingsStore).showStatusbarIcon === "Icon") {
			setIcon(this.statusbarItem, "boxes");
		}

		const menu = new GroupSettingsMenu(this.statusbarItem, {});

		this.statusbarItem.onfocus = () => {
			menu.updatePosition();
		};
	}
}
