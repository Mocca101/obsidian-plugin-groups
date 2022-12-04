export interface PluginInfo {
	id: string,
	name: string,
}

export interface PluginGroup {
	name: string;
	plugins: PluginInfo[];
	active: boolean;
}

export interface PluginGroupsSettings {
	groups: PluginGroup[];

}
