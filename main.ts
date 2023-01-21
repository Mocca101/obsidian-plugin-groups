import {Notice, Plugin} from 'obsidian';
import GroupSettingsTab from "./src/GroupSettingsTab";
import {disableStartupTimeout} from "./src/Utils/Constants";
import Manager from "./src/Managers/Manager";
import CommandManager from "./src/Managers/CommandManager";
import PluginManager from "./src/Managers/PluginManager";

export default class PgMain extends Plugin {

	async onload() {
		const times: {
			label: string;
			time: number
		}[] = [];

		const time = this.getRoundedCurrentTime() ;
		times.push({label: 'Time on Load', time: time });

		await Manager.getInstance().init(this);
		this.logTime('Manager Setup', times);

		PluginManager.loadNewPlugins();
		this.logTime('Loading new plugins', times);

		this.addSettingTab(new GroupSettingsTab(this.app, this));
		this.logTime('Creating the Settings Tab', times);

		if(!Manager.getInstance().groupsMap) {
			this.displayTimeNotice(times);

			return; // Exit early if there are no groups yet, no need to load the rest.
		}

		if(Manager.getInstance().generateCommands) {
			Manager.getInstance().groupsMap.forEach(group => CommandManager.getInstance().AddGroupCommands(group.id));
			if(Manager.getInstance().logDetailedTime) {
				this.logTime('Generated Commands for Groups in', times);
			}
		}

		// TODO: Improve hacky solution if possible
		if(window.performance.now() / 1000 < disableStartupTimeout) {
			Manager.getInstance().groupsMap.forEach(group => {
				if (group.loadAtStartup) group.startup();
			});

			if(Manager.getInstance().logDetailedTime) {
				this.logTime('Dispatching Groups for delayed start in', times);
			}
		}

		this.displayTimeNotice(times);
	}

	private logTime(label: string, times: {label: string, time: number}[]) {
		if(Manager.getInstance().logDetailedTime) {
			times.push({label, time: this.elapsedTime(times)});
		}
	}

	private displayTimeNotice(times: {label: string, time: number}[] ) {
		if(!Manager.getInstance().logDetailedTime || times.length === 0) { return }

		const totalTime = Math.round(this.accTime(times.slice(1)) / 1000);

		new Notice(times.map(item => item.label + ': ' + item.time + ' μs').join('\n') + '\nTotal Time: ' + totalTime + ' ms', 5000);
	}

	private elapsedTime(times: {label: string, time: number}[] ) : number {
		if(times.length > 1) {
			return this.getRoundedCurrentTime() - this.accTime(times);
		}
		return this.getRoundedCurrentTime() - times[0].time;
	}

	private accTime(times: {label: string, time: number}[]): number {
		return times.map(item => item.time).reduce((prev, curr) => prev + curr);
	}
	private getRoundedCurrentTime() : number {
		return Math.round(window.performance.now() * 1000)
	}

	onunload() {
	}
}
