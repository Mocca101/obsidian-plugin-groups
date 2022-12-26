import PgMain from "../main";
import {PgPlugin} from "./PgPlugin";
import {PgComponent} from "./Types";

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

export function nameToId(name: string): string {
	return name.replace(/[\W_]/g,'').toLowerCase();
}

export function generateGroupID(name: string, existingGroupID: { map?: Map<string, PgComponent>, arr?: string[] }, delay?:number) : string | undefined {
	let id = nameToId( (delay ? 'stg-' : 'pg-' ) + name);

	if(!(existingGroupID.arr?.contains(id)) && !(existingGroupID.map?.has(id))) { return id; }

	for (let i = 0; i < 512; i++) {
		const nrdId = id + i.toString();
		id += i.toString();
		if(!(existingGroupID.arr?.contains(id)) && !(existingGroupID.map?.has(id))) {
			return delay ? nrdId + delay.toString() : nrdId;
		}
	}
	return undefined;
}

export function saveVaultLocalStorage (key: string, object: any) : void {
	// @ts-ignore
	app.saveLocalStorage(key, object);
}

export function loadVaultLocalStorage (key: string) : unknown {
	// @ts-ignore
	return app.loadLocalStorage(key);
}

export function getCurrentlyActiveDevice () : string | null {
	if(loadVaultLocalStorage(PgMain.deviceNameKey) instanceof String || typeof loadVaultLocalStorage(PgMain.deviceNameKey) === 'string') {
		return loadVaultLocalStorage(PgMain.deviceNameKey) as string;
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

