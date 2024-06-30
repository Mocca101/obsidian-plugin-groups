import type { PgPlugin } from "@/DataStructures/PgPlugin";
import { installedPluginIds, obsidianPluginsInstance, pluginManifests, settingsStore } from "@/stores/main-store"
import { get } from "svelte/store";
import { knownPluginIdsKey } from "./Constants";
import { loadVaultLocalStorage, saveVaultLocalStorage } from "./Utilities";

export const getInstalledPluginById = (id:string): PgPlugin | null => {
	if(!get(obsidianPluginsInstance)) return null;
	if(!get(pluginManifests)) return null;
	const manifest = get(pluginManifests)[id];
	if(!manifest) return null;

	return {
		id: manifest.id,
		name: manifest.name,
	};
}

export const getKnownPluginIds = () => {
	const ids = loadVaultLocalStorage(knownPluginIdsKey);
	return ids ? new Set<string>(JSON.parse(ids)) : null;
}

export const setKnownPluginIds = (ids: Set<string> | null) => {
	if(!ids) return;
	const setAsString = JSON.stringify([...ids]);
	saveVaultLocalStorage(knownPluginIdsKey, setAsString);
}

export const enablePlugin = (plugin: PgPlugin): Promise<boolean> => {
	// The typings for the obsidian API are incorrect.
	// The enablePlugin method does actually return a boolean
	// @ts-expect-error - The return type is acutally a boolean
	return get(obsidianPluginsInstance)?.enablePlugin(plugin.id);
}

export const disablePlugin = (plugin: PgPlugin) => {
	return get(obsidianPluginsInstance)?.disablePlugin(plugin.id);
}

const enablePluginQueue = new Set<string>();
const disablePluginQueue = new Set<string>();
const pgEnabledPlugins = new Set<string>();

const pluginIsEnabled = (plugin: PgPlugin) => {
	// .getPlugin(id) would be the preferred method, however it does not work since,
	// for some reason it won't recognize the admonition plugin as active if it was loaded through obsidian
	return (
		get(obsidianPluginsInstance).enabledPlugins.has(plugin.id)
		|| pgEnabledPlugins.has(plugin.id)
	);
}

/**
 * @returns true if the plugin was enabled, false if it was already enabled
 */
export const queuePluginForEnable = async (plugin: PgPlugin): Promise<boolean> => {

	if(pluginIsEnabled(plugin)) return false;

	if(enablePluginQueue.has(plugin.id)) return false;

	enablePluginQueue.add(plugin.id);

	const enabled = await enablePlugin(plugin);

	if(enabled) pgEnabledPlugins.add(plugin.id);

	enablePluginQueue.delete(plugin.id);

	return enabled;
}

export const queuePluginForDisable = async (plugin: PgPlugin): Promise<boolean> => {
	if(!pluginIsEnabled(plugin)) return false;

	if(disablePluginQueue.has(plugin.id)) return false;

	disablePluginQueue.add(plugin.id);
	await disablePlugin(plugin);
	pgEnabledPlugins.delete(plugin.id);
	disablePluginQueue.delete(plugin.id);
	return true;
}

export const loadNewPlugins = () => {
	if(getKnownPluginIds() === null) {
		setKnownPluginIds(get(installedPluginIds));
		return;
	}

	if(!get(installedPluginIds)) return;

	const knownPlugins = getKnownPluginIds();

	setKnownPluginIds(get(installedPluginIds));

	for(const id of get(installedPluginIds)) {
		if(knownPlugins?.has(id)) continue;

		for(const group of get(settingsStore).groupsMap.values()) {
			if(!group.autoAdd) continue;

			const plugin = getInstalledPluginById(id);
			if(!plugin) continue;

			group.addPlugin(plugin);
		}
	}
}
