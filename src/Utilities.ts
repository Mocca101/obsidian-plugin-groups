import {PluginInfo} from "./Types";
import PluginGroupsMain from "../main";

export function getAllAvailablePlugins() : PluginInfo[] {
	const manifests = this.app.plugins.manifests;

	const plugins: PluginInfo[] = [];

	for(const key in manifests) {
		if(manifests[key].id === PluginGroupsMain.pluginId) continue;
		
		const info: PluginInfo = {
			id: manifests[key].id,
			name: manifests[key].name,
		}
		plugins.push(info)
	}

	return plugins;
}
