import {Plugin} from 'obsidian';
import GroupSettingsTab from "./src/GroupSettingsTab";
import {disableStartupTimeout} from "./src/Utils/Constants";
import Manager from "./src/Managers/Manager";
import CommandManager from "./src/Managers/CommandManager";
import PluginManager from "./src/Managers/PluginManager";

export default class PgMain extends Plugin {

	readonly doLogTime: boolean = false;

	async onload() {
		await Manager.getInstance().init(this);
		if(this.doLogTime) { console.log('pg-afterManagerInit', window.performance.now() / 1000 ); }

		PluginManager.loadNewPlugins();
		if(this.doLogTime) { console.log('pg-afterNewPluginLoad', window.performance.now() / 1000 ); }

		this.addSettingTab(new GroupSettingsTab(this.app, this));
		if(this.doLogTime) { console.log('pg-afterAddSettings', window.performance.now() / 1000 ); }


		if(!Manager.getInstance().groupsMap) {
			return; // Exit early if there are no groups yet, no need to load the rest.
		}

		if(Manager.getInstance().generateCommands) {
			Manager.getInstance().groupsMap.forEach(group => CommandManager.getInstance().AddGroupCommands(group.id));
			if(this.doLogTime) { console.log('pg-afterGenerateCommand', window.performance.now() / 1000 ); }
		}

		// TODO: Improve hacky solution if possible
		if(window.performance.now() / 1000 < disableStartupTimeout) {
			Manager.getInstance().groupsMap.forEach(group => {
				if (group.loadAtStartup) group.startup();
			});
		}
		if(this.doLogTime) { console.log('pg-afterInitStartups', window.performance.now() / 1000 ); }

	}


	onunload() {
	}
}
