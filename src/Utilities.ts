import PgMain from "../main";
import {PgPlugin} from "./PgPlugin";

export function getAllAvailablePlugins() : PgPlugin[] {
	const manifests = this.app.plugins.manifests;

	const plugins: PgPlugin[] = [];

	for(const key in manifests) {
		if(manifests[key].id === PgMain.pluginId) continue;

		const info: PgPlugin = new PgPlugin(manifests[key].id, manifests[key].name);
		plugins.push(info)
	}

	return plugins;
}

export function generateGroupID(name: string, delay?:number) : string | undefined {
	let id = nameToId( (delay ? 'stg-' : 'pg-' ) + name);

	const groupMap = PgMain.instance?.settings.groupsMap;

	if(!groupMap) {return undefined; }

	if(!(groupMap.has(id))) { return id; }

	for (let i = 0; i < 512; i++) {
		const nrdId = id + i.toString();
		id += i.toString();
		if(!groupMap.has(id)) {
			return delay ? nrdId + delay.toString() : nrdId;
		}
	}
	return undefined;
}

export function nameToId(name: string): string {
	return name.replace(/[\W_]/g,'').toLowerCase();
}

export function saveVaultLocalStorage (key: string, object: any) : void {
	// @ts-ignore
	app.saveLocalStorage(key, object);
}

export function loadVaultLocalStorage (key: string) : string | null | undefined {
	// @ts-ignore
	return app.loadLocalStorage(key);
}

export function getKnownPluginIds () : Set<string> | null {
	const ids = loadVaultLocalStorage(PgMain.knownPluginIdsKey);
	if(!ids) { return null; }
	return new Set<string>(JSON.parse(ids));
}

export function setKnownPluginIds (ids: Set<string> | null) {
	if(!ids) { return; }
	const setAsString = JSON.stringify([...ids]);
	saveVaultLocalStorage(PgMain.knownPluginIdsKey, setAsString);
}

export function getInstalledPluginIds() : Set<string>{
	const manifests = this.app.plugins.manifests;

	const installedPlugins = new Set<string>();

	for(const key in manifests) {
		installedPlugins.add(key);
	}

	return installedPlugins;
}

export function getInstalledPluginFromId(id: string) : PgPlugin | null {
	if(!this.app.plugins.manifests[id]) {
		return null;
	}
	return new PgPlugin(this.app.plugins.manifests[id].id, this.app.plugins.manifests[id].name);
}


export function getCurrentlyActiveDevice () : string | null {
	const device = loadVaultLocalStorage(PgMain.deviceNameKey);
	if(typeof device === 'string') {
		return device as string;
	}
	return null;
}

export function setCurrentlyActiveDevice (device: string | null) {
	saveVaultLocalStorage(PgMain.deviceNameKey, device);
}

export function checkPluginEnabled (plugin: PgPlugin) : boolean {
	// @ts-ignore
	return app.plugins.enabledPlugins.has(plugin.id);
}

export async function enablePlugin (plugin: PgPlugin) : Promise<boolean> {
	// @ts-ignore
	return app.plugins.enablePlugin(plugin.id);
}

export function disablePlugin (plugin: PgPlugin) {
	// @ts-ignore
	app.plugins.disablePlugin(plugin.id);
}

