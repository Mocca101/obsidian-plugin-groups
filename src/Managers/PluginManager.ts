import {PgPlugin} from "../PgPlugin";
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


	public static loadNewPlugins() {
		if (PluginManager.getKnownPluginIds() === null) {
			PluginManager.setKnownPluginIds(PluginManager.getInstalledPluginIds());
		} else {
			const knownPlugins = PluginManager.getKnownPluginIds();
			const installedPlugins = PluginManager.getInstalledPluginIds();
			PluginManager.setKnownPluginIds(installedPlugins);

			const newPlugins = new Set([...installedPlugins].filter(id => !knownPlugins?.has(id)));

			if(newPlugins.size <= 0) { return; }

			Manager.getInstance().groupsMap.forEach(g => {
				if(g.autoAdd) {
					newPlugins.forEach(pluginId => {
						const plugin = PluginManager.getInstalledPluginFromId(pluginId);
						if(plugin) {
							g.addPlugin(plugin);
						}
					})
				}
			});

			Manager.getInstance().saveSettings();
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
		// @ts-ignore
		const manifests = app.plugins.manifests;

		const installedPlugins = new Set<string>();

		for(const key in manifests) {
			installedPlugins.add(key);
		}

		return installedPlugins;
	}

	public static getInstalledPluginFromId (id: string) : PgPlugin | null {

		// @ts-ignore
		if(!app.plugins.manifests[id]) {
			return null;
		}

		// @ts-ignore
		return new PgPlugin(this.app.plugins.manifests[id].id, this.app.plugins.manifests[id].name);
	}


	public static getAllAvailablePlugins() : PgPlugin[] {

		// @ts-ignore
		const manifests = app.plugins.manifests;

		const plugins: PgPlugin[] = [];

		for(const key in manifests) {
			if(manifests[key].id === pluginId) continue;

			const info: PgPlugin = new PgPlugin(manifests[key].id, manifests[key].name);
			plugins.push(info)
		}

		return plugins;
	}

	public static checkPluginEnabled (plugin: PgPlugin) : boolean {
		// @ts-ignore
		return app.plugins.enabledPlugins.has(plugin.id) ||	this.checkPluginEnabledFromPluginGroups(plugin);
	}

	private static checkPluginEnabledFromPluginGroups(plugin: PgPlugin) : boolean {
		return this.pgEnabledPlugins.has(plugin.id);
	}

	private static enablePlugin (plugin: PgPlugin) : Promise<boolean> {
		// @ts-ignore
		return app.plugins.enablePlugin(plugin.id);
	}

	private static disablePlugin (plugin: PgPlugin) {
		// @ts-ignore
		return  app.plugins.disablePlugin(plugin.id);
	}

}
