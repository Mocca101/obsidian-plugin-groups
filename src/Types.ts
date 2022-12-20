import {PluginGroup} from "./PluginGroup";

export abstract class PgComponent {

	public id: string;
	public name: string;

	abstract enable() : void;

	abstract disable() : void;
}

export interface PluginGroupsSettings {
	groupsMap: Map<string, PluginGroup>;
	generateCommands: boolean;
}

export interface PersistentSettings {
	groups: PluginGroup[];
	generateCommands: boolean;
}
