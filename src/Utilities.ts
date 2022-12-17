import PluginGroupsMain from "../main";
import {PgPlugin} from "./PgPlugin";

export function getAllAvailablePlugins() : PgPlugin[] {
	const manifests = this.app.plugins.manifests;

	const plugins: PgPlugin[] = [];

	for(const key in manifests) {
		if(manifests[key].id === PluginGroupsMain.pluginId) continue;

		const info: PgPlugin = new PgPlugin(manifests[key].id, manifests[key].name);
		plugins.push(info)
	}

	return plugins;
}

export function nameToId(name: string): string {
	return name.replace(/[\W_]/g,'').toLowerCase();
}

export function generateGroupID(name: string, existingGroupID: string[], delay?:number) : string | undefined {
	let id = nameToId( (delay ? 'stg-' : 'pg-' ) + name);

	if(!existingGroupID.contains(id)) { return id; }

	for (let i = 0; i < 512; i++) {
		const nrdId = id + i.toString();
		id += i.toString();
		if(!existingGroupID.contains(nrdId)) {
			return delay ? nrdId + delay.toString() : nrdId;
		}
	}
	return undefined;
}
