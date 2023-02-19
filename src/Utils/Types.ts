import { PluginGroup } from '../DataStructures/PluginGroup';

export interface PgComponent {
	id: string;
	name: string;
}

export interface PluginGroupsSettings {
	groupsMap: Map<string, PluginGroup>;
	generateCommands: boolean;
	showNoticeOnGroupLoad: string;
	devices: string[];

	devLogs: boolean;
	doLoadSynchronously: boolean;
}

export interface PersistentSettings {
	groups: PluginGroup[];
	generateCommands: boolean;
	showNoticeOnGroupLoad: string;
	devices: string[];
	devLogs: boolean;
	doLoadSynchronously: boolean;
}
