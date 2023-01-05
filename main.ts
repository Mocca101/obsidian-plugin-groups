import {Plugin} from 'obsidian';
import GroupSettingsTab from "./src/GroupSettingsTab";
import {
	getInstalledPluginFromId,
	getInstalledPluginIds,
	getKnownPluginIds,
	setKnownPluginIds
} from "./src/Utilities";
import {disableStartupTimeout} from "./src/Constants";
import Manager from "./src/Manager";
import CommandManager from "./src/CommandManager";

export default class PgMain extends Plugin {

	async onload() {
		await Manager.getInstance().init(this);

		this.loadNewPlugins();

		this.addSettingTab(new GroupSettingsTab(this.app, this));

		if(!Manager.getInstance().groupsMap) {
			return; // Exit early if there are no groups yet, no need to load the rest.
		}

		if(Manager.getInstance().generateCommands) {
			Manager.getInstance().groupsMap.forEach(group => CommandManager.getInstance().AddGroupCommands(group.id));
		}

		// TODO: Improve hacky solution if possible
		if(window.performance.now() / 1000 < disableStartupTimeout) {
			Manager.getInstance().groupsMap.forEach(group => {
				if (group.loadAtStartup) group.startup();
			});
		}
	}

	loadNewPlugins() {
		if (getKnownPluginIds() === null) {
			setKnownPluginIds(getInstalledPluginIds());
		} else {
			const knownPlugins = getKnownPluginIds();
			const installedPlugins = getInstalledPluginIds();
			setKnownPluginIds(installedPlugins);

			const newPlugins = new Set([...installedPlugins].filter(id => !knownPlugins?.has(id)));

			if(newPlugins.size <= 0) { return; }

			Manager.getInstance().groupsMap.forEach(g => {
				if(g.autoAdd) {
					newPlugins.forEach(pluginId => {
						const plugin = getInstalledPluginFromId(pluginId);
						if(plugin) {
							g.addPlugin(plugin);
						}
					})
				}
			});

			Manager.getInstance().saveSettings();
		}
	}

	onunload() {
	}
}
