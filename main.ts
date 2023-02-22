import { ExtraButtonComponent, Notice, Plugin } from 'obsidian';
import PluginGroupSettings from './src/PluginGroupSettings';
import { disableStartupTimeout } from './src/Utils/Constants';
import Manager from './src/Managers/Manager';
import CommandManager from './src/Managers/CommandManager';
import PluginManager from './src/Managers/PluginManager';
import GroupSettingsMenu from './src/Components/Modals/GroupSettingsMenu';

export default class PgMain extends Plugin {
	async onload() {
		const times: {
			label: string;
			time: number;
		}[] = [];

		times.push({ label: 'Time on Load', time: this.getCurrentTime() });

		await Manager.getInstance().init(this);
		this.logTime('Manager Setup', times);

		await PluginManager.loadNewPlugins();
		this.logTime('Loading new plugins', times);

		this.addSettingTab(new PluginGroupSettings(this.app, this));
		this.logTime('Creating the Settings Tab', times);

		this.addStatusBar();

		if (!Manager.getInstance().groupsMap) {
			this.displayTimeNotice(times);

			return; // Exit early if there are no groups yet, no need to load the rest.
		}

		if (Manager.getInstance().generateCommands) {
			Manager.getInstance().groupsMap.forEach((group) =>
				CommandManager.getInstance().AddGroupCommands(group.id)
			);
			if (Manager.getInstance().devLog) {
				this.logTime('Generated Commands for Groups in', times);
			}
		}

		// TODO: Improve hacky solution if possible
		if (window.performance.now() < disableStartupTimeout) {
			Manager.getInstance().groupsMap.forEach((group) => {
				if (group.loadAtStartup) group.startup();
			});

			if (Manager.getInstance().devLog) {
				this.logTime('Dispatching Groups for delayed start in', times);
			}
		}

		this.displayTimeNotice(times);
	}

	private addStatusBar() {
		const sbItem = this.addStatusBarItem();
		sbItem.addClass('pg-statusbar-icon');
		sbItem.tabIndex = 0;

		const menu = new GroupSettingsMenu(sbItem, {});

		const btn = new ExtraButtonComponent(sbItem);
		btn.setIcon('boxes');
		// @ts-ignore
		btn.setTooltip('Plugin Groups Menu', { placement: 'top' });

		sbItem.onfocus = () => {
			menu.updatePosition();
		};
	}
	private logTime(label: string, times: { label: string; time: number }[]) {
		if (Manager.getInstance().devLog) {
			times.push({ label, time: this.elapsedTime(times) });
		}
	}

	private displayTimeNotice(times: { label: string; time: number }[]) {
		if (!Manager.getInstance().devLog || times.length === 0) {
			return;
		}
		const totalTime = Math.round(this.accTime(times.slice(1)));

		new Notice(
			times
				.map((item) => item.label + ': ' + item.time + ' ms')
				.join('\n') +
				'\nTotal Time: ' +
				totalTime +
				' ms',
			10000
		);
	}

	private elapsedTime(times: { label: string; time: number }[]): number {
		if (times.length > 1) {
			return this.getCurrentTime() - this.accTime(times);
		}
		return this.getCurrentTime() - times[0].time;
	}

	private accTime(times: { label: string; time: number }[]): number {
		return times
			.map((item) => item.time)
			.reduce((prev, curr) => prev + curr);
	}

	private getCurrentTime(): number {
		return Date.now();
	}

	onunload() {}
}
