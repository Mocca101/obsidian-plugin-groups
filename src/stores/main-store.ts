import type { PluginGroup } from "@/DataStructures/PluginGroup";
import type { PersistentSettings, PluginGroupsSettings } from "@/Utils/Types";
import { derived, get, readable, writable, type Readable, type Writable } from "svelte/store";
import type PgMain from "@/main";
import { loadVaultLocalStorage, saveVaultLocalStorage } from "@/Utils/Utilities";
import { DEVICE_NAME_KEY, pluginId } from "@/Utils/Constants";
import type { PluginManifest, Plugins } from "obsidian";
import type { PgPlugin } from "@/DataStructures/PgPlugin";

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groupsMap: new Map<string, PluginGroup>(),
	generateCommands: true,
	showNoticeOnGroupLoad: "none",
	devLogs: false,
	devices: [],
	doLoadSynchronously: true,
	showStatusbarIcon: "None",
};

export let pluginInstance: Readable<PgMain>;
export let pluginManifests: Readable<Record<string, PluginManifest>>;
export let obsidianPluginsInstance: Readable<Plugins>;
export let availablePlugins: Readable<Array<PgPlugin>>;
export let installedPluginIds: Readable<Set<string>>;

export let currentDeviceStore: Writable<string | null>;
function initCurrentDeviceStore() {
	const device = loadVaultLocalStorage(DEVICE_NAME_KEY);
	if (typeof device === "string") {
		return device as string;
	}
	return null;
}

export function setupStores(p: PgMain) {
	pluginInstance = readable(p);
	obsidianPluginsInstance = derived(pluginInstance, ($pluginInstance) => $pluginInstance.app.plugins);

	pluginManifests = derived(pluginInstance, ($pluginInstance) => $pluginInstance.app.plugins.manifests);

	availablePlugins = derived(pluginManifests, ($pluginManifests) => {
		return Object.values($pluginManifests).reduce(
			(plugins, manifest) => {
				if(manifest.id === pluginId) return plugins;

				plugins.push({
					id: manifest.id,
					name: manifest.name,
				});

				return plugins;
			}, [] as PgPlugin[]
		)
	})

	installedPluginIds = derived(pluginManifests, ($pluginsManifests) => {
		return new Set(Object.keys($pluginsManifests));
	});

	currentDeviceStore = writable(initCurrentDeviceStore());

	currentDeviceStore.subscribe((device) => {
		if(!get(pluginInstance)) return;
		saveVaultLocalStorage(DEVICE_NAME_KEY, device);
	});
}


export const settingsStore = writable<PluginGroupsSettings>(DEFAULT_SETTINGS);

settingsStore.subscribe(async (settings) => {
	if(!get(pluginInstance)) return;

	const persistentSettings: PersistentSettings = {
		groups: Array.from(settings.groupsMap.values()),
		generateCommands: settings.generateCommands ?? DEFAULT_SETTINGS.generateCommands,
		showNoticeOnGroupLoad:
			settings.showNoticeOnGroupLoad ??
			DEFAULT_SETTINGS.showNoticeOnGroupLoad,
		devLogs: settings.devLogs ?? DEFAULT_SETTINGS.devLogs,
		devices: settings.devices ?? DEFAULT_SETTINGS.devices,
		doLoadSynchronously:
			settings.doLoadSynchronously ??
			DEFAULT_SETTINGS.doLoadSynchronously,
		showStatusbarIcon:
			settings.showStatusbarIcon ?? DEFAULT_SETTINGS.showStatusbarIcon,
	};

	await get(pluginInstance).saveData(persistentSettings);
});

