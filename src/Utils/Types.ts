import {PluginGroup} from "../DataStructures/PluginGroup";

export interface PgComponent {
	id: string;
	name: string;
}

export interface PluginGroupsSettings {
	groupsMap: Map<string, PluginGroup>;
	generateCommands: boolean;
	showNoticeOnGroupLoad: string;
	logDetailedTime: boolean;
	devices: string[];
}

export interface PersistentSettings {
	groups: PluginGroup[];
	generateCommands: boolean;
	showNoticeOnGroupLoad: string;
	devices: string[];
	logDetailedTime: boolean;
}
