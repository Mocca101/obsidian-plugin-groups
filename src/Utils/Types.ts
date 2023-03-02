import { PluginGroup } from '../DataStructures/PluginGroup';

export interface Named {
	name: string;
}

export interface PgComponent extends Named {
	id: string;
}

export interface PluginGroupsSettings {
	groupsMap: Map<string, PluginGroup>;
	generateCommands: boolean;
	showNoticeOnGroupLoad: string;
	devices: string[];
	devLogs: boolean;
	doLoadSynchronously: boolean;
	showStatusbarIcon: 'None' | 'Icon' | 'Text';
}

export interface PersistentSettings {
	groups: PluginGroup[];
	generateCommands: boolean;
	showNoticeOnGroupLoad: string;
	devices: string[];
	devLogs: boolean;
	doLoadSynchronously: boolean;
	showStatusbarIcon: 'None' | 'Icon' | 'Text';
}
