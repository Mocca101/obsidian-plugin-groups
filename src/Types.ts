import {PluginGroup} from "./PluginGroup";

export interface pgData {

	id: string,
	name: string,
}

export interface PluginInfo {
	id: string,
	name: string,
}

export abstract class PgComponent {

	public id: string;
	public name: string;

	abstract enable() : void;

	abstract disable() : void;
}

export interface PluginGroupsSettings {
	groupsMap: Map<string, PluginGroup>;
}

export interface PersistentSettings {
	groups: PluginGroup[]
}

