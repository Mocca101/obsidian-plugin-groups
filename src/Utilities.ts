import {PluginGroup, PluginInfo} from "./Types";
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

export async function enablePluginsOfGroup(group: PluginGroup) {
	for (const plugin of group.plugins) {
		// @ts-ignore
		await app.plugins.enablePlugin(plugin.id);
	}
}

export async function disablePluginsOfGroup(group: PluginGroup) {
	for (const plugin of group.plugins) {
		// @ts-ignore
		await app.plugins.disablePlugin(plugin.id);
	}
}
