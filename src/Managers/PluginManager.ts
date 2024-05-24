import { get } from "svelte/store";
import { PgPlugin } from "../DataStructures/PgPlugin";
import { knownPluginIdsKey, pluginId } from "../Utils/Constants";
import {
	loadVaultLocalStorage,
	saveVaultLocalStorage,
} from "../Utils/Utilities";
import Manager from "./Manager";
import { installedPlugins, pluginsManifests, settingsStore } from "@/stores/main-store";

export default class PluginManager {
	private static enablePluginQueue: Set<string> = new Set<string>();
	private static disablePluginQueue: Set<string> = new Set<string>();
	private static pgEnabledPlugins: Set<string> = new Set<string>();

	public static async queuePluginForEnable(plugin: PgPlugin): Promise<boolean> {
		if (PluginManager.checkPluginEnabled(plugin)) {
			return false;
		}

		if (PluginManager.enablePluginQueue.has(plugin.id)) {
			return false;
		}

		PluginManager.enablePluginQueue.add(plugin.id);
		const enabled: boolean = await PluginManager.enablePlugin(plugin);
		if (enabled) {
			PluginManager.pgEnabledPlugins.add(plugin.id);
		}
		PluginManager.enablePluginQueue.delete(plugin.id);

		return true;
	}

	public static queueDisablePlugin(plugin: PgPlugin) {
		if (!PluginManager.checkPluginEnabled(plugin)) {
			return false;
		}
		if (PluginManager.disablePluginQueue.has(plugin.id)) {
			return;
		}

		PluginManager.disablePluginQueue.add(plugin.id);
		PluginManager.disablePlugin(plugin);
		PluginManager.pgEnabledPlugins.delete(plugin.id);
		PluginManager.disablePluginQueue.delete(plugin.id);
	}

	public static async loadNewPlugins() {
		if (PluginManager.getKnownPluginIds() === null) {
			PluginManager.setKnownPluginIds(PluginManager.getInstalledPluginIds());
		} else {
			const knownPlugins = PluginManager.getKnownPluginIds();
			const installedPlugins: Set<string> =
				PluginManager.getInstalledPluginIds();

			if (!installedPlugins) {
				return;
			}

			PluginManager.setKnownPluginIds(installedPlugins);

			installedPlugins?.forEach((id) => {
				if (!knownPlugins?.has(id)) {
					get(settingsStore).groupsMap.forEach((g) => {
						if (g.autoAdd) {
							const plugin = PluginManager.getInstalledPluginFromId(id);
							if (plugin) {
								g.addPlugin(plugin);
							}
						}
					});
				}
			});
			return Manager.getInstance().saveSettings();
		}
	}

	public static getKnownPluginIds(): Set<string> | null {
		const ids = loadVaultLocalStorage(knownPluginIdsKey);
		if (!ids) {
			return null;
		}
		return new Set<string>(JSON.parse(ids));
	}

	public static setKnownPluginIds(ids: Set<string> | null) {
		if (!ids) {
			return;
		}
		const setAsString = JSON.stringify([...ids]);
		saveVaultLocalStorage(knownPluginIdsKey, setAsString);
	}

	public static getInstalledPluginIds(): Set<string> {
		const manifests = get(pluginsManifests);

		const installedPlugins = new Set<string>();

		for (const key in manifests) {
			installedPlugins.add(key);
		}

		return installedPlugins;
	}

	public static getInstalledPluginFromId(id: string): PgPlugin | null {
		if (!get(installedPlugins)) {
			return null;
		}
		if (!get(pluginsManifests)?.[id]) {
			return null;
		}

		return new PgPlugin(
			get(pluginsManifests)[id].id,
			get(pluginsManifests)[id].name
		);
	}

	public static getAllAvailablePlugins(): PgPlugin[] {
		const manifests = get(pluginsManifests);

		const plugins: PgPlugin[] = [];

		for (const key in manifests) {
			if (manifests[key].id === pluginId) continue;

			const info: PgPlugin = new PgPlugin(
				manifests[key].id,
				manifests[key].name
			);
			plugins.push(info);
		}

		return plugins;
	}

	public static checkPluginEnabled(plugin: PgPlugin): boolean {
		return (
			// .getPlugin(id) would be the preferred method, however it does not work since,
			// for some reason it won't recognize the admonition plugin as active if it was loaded through obsidian
			get(installedPlugins).enabledPlugins.has(
				plugin.id
			) || PluginManager.checkPluginEnabledFromPluginGroups(plugin)
		);
	}

	private static checkPluginEnabledFromPluginGroups(plugin: PgPlugin): boolean {
		return PluginManager.pgEnabledPlugins.has(plugin.id);
	}

	private static enablePlugin(plugin: PgPlugin): Promise<boolean> {
		return get(installedPlugins).enablePlugin(plugin.id);
	}

	private static disablePlugin(plugin: PgPlugin) {
		return get(installedPlugins).disablePlugin(plugin.id);
	}
}
