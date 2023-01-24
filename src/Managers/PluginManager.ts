import {PgPlugin} from "../DataStructures/PgPlugin";
import { loadVaultLocalStorage, saveVaultLocalStorage
} from "../Utils/Utilities";
import Manager from "./Manager";
import {knownPluginIdsKey, pluginId} from "../Utils/Constants";


export default class PluginManager {

	private static enablePluginQueue: Set<string> = new Set<string>();
	private static disablePluginQueue: Set<string> = new Set<string>();
	private static pgEnabledPlugins: Set<string> = new Set<string>();

	public static async queuePluginForEnable (plugin: PgPlugin) : Promise<boolean> {
		if(this.checkPluginEnabled(plugin)) { return false; }

		if(this.enablePluginQueue.has(plugin.id)) { return false; }

		this.enablePluginQueue.add(plugin.id);
		const enabled: boolean =await this.enablePlugin(plugin);
		if(enabled) {
			this.pgEnabledPlugins.add(plugin.id);
		}
		this.enablePluginQueue.delete(plugin.id);

		return true;
	}

	public static queueDisablePlugin (plugin: PgPlugin) {
		if(!this.checkPluginEnabled(plugin)) { return false; }
		if(this.disablePluginQueue.has(plugin.id)) { return; }

		this.disablePluginQueue.add(plugin.id);
		this.disablePlugin(plugin);
		this.pgEnabledPlugins.delete(plugin.id);
		this.disablePluginQueue.delete(plugin.id);
	}

	public static async loadNewPlugins() {
		if (PluginManager.getKnownPluginIds() === null) {
			PluginManager.setKnownPluginIds(PluginManager.getInstalledPluginIds());
		} else {
			const knownPlugins = PluginManager.getKnownPluginIds();
			const installedPlugins: Set<string> = PluginManager.getInstalledPluginIds();

			if(!installedPlugins) {	return;	}

			PluginManager.setKnownPluginIds(installedPlugins);

			installedPlugins?.forEach((id) => {
				if(!knownPlugins?.has(id)) {
					Manager.getInstance().groupsMap.forEach(g => {
						if(g.autoAdd) {
							const plugin = PluginManager.getInstalledPluginFromId(id);
							if(plugin) {
								g.addPlugin(plugin);
							}
						}
					});
				}
			})
			return Manager.getInstance().saveSettings();
		}
	}

	public static getKnownPluginIds () : Set<string> | null {
		const ids = loadVaultLocalStorage(knownPluginIdsKey);
		if(!ids) { return null; }
		return new Set<string>(JSON.parse(ids));
	}

	public static setKnownPluginIds (ids: Set<string> | null) {
		if(!ids) { return; }
		const setAsString = JSON.stringify([...ids]);
		saveVaultLocalStorage(knownPluginIdsKey, setAsString);
	}

	public static getInstalledPluginIds() : Set<string>{
		const manifests = Manager.getInstance().pluginsManifests;

		const installedPlugins = new Set<string>();

		for(const key in manifests) {
			installedPlugins.add(key);
		}

		return installedPlugins;
	}

	public static getInstalledPluginFromId (id: string) : PgPlugin | null {
		if(!Manager.getInstance().pluginsManifests[id]) {
			return null;
		}

		return new PgPlugin(Manager.getInstance().pluginsManifests[id].id, Manager.getInstance().pluginsManifests[id].name);
	}

	public static getAllAvailablePlugins() : PgPlugin[] {
		const manifests = Manager.getInstance().pluginsManifests;

		const plugins: PgPlugin[] = [];

		for(const key in manifests) {
			if(manifests[key].id === pluginId) continue;

			const info: PgPlugin = new PgPlugin(manifests[key].id, manifests[key].name);
			plugins.push(info)
		}

		return plugins;
	}

	public static checkPluginEnabled (plugin: PgPlugin) : boolean {
		return Manager.getInstance().obsidianPluginsObject.enabledPlugins.has(plugin.id) ||	this.checkPluginEnabledFromPluginGroups(plugin);
	}

	private static checkPluginEnabledFromPluginGroups(plugin: PgPlugin) : boolean {
		return this.pgEnabledPlugins.has(plugin.id);
	}

	private static enablePlugin (plugin: PgPlugin) : Promise<boolean> {
		return Manager.getInstance().obsidianPluginsObject.enablePlugin(plugin.id);
	}

	private static disablePlugin (plugin: PgPlugin) {
		return Manager.getInstance().obsidianPluginsObject.disablePlugin(plugin.id);
	}

}
