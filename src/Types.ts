import {PluginGroup} from "./PluginGroup";

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
	groups: Map<string,PluginGroup>;
}
