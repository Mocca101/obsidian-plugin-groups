import "./styles.css";
import { Notice, Plugin } from "obsidian";
import CommandManager from "./Managers/CommandManager";
import Manager from "./Managers/Manager";
import PluginManager from "./Managers/PluginManager";
import PluginGroupSettings from "./PluginGroupSettings";
import { disableStartupTimeout } from "./Utils/Constants";
import { settingsStore, setupStores } from "./stores/main-store";
import { get } from "svelte/store";

export default class PgMain extends Plugin {
	async onload() {
		setupStores(this);

		const times: {
			label: string;
			time: number;
		}[] = [];

		times.push({ label: "Time on Load", time: this.getCurrentTime() });

		await Manager.getInstance().init(this);
		this.logTime("Manager Setup", times);

		await PluginManager.loadNewPlugins();
		this.logTime("Loading new plugins", times);

		this.addSettingTab(new PluginGroupSettings(this.app, this));
		this.logTime("Creating the Settings Tab", times);

		Manager.getInstance().updateStatusbarItem();

		if (!Manager.getInstance().groupsMap) {
			this.displayTimeNotice(times);

			return; // Exit early if there are no groups yet, no need to load the rest.
		}

		if (get(settingsStore).generateCommands) {
			for (const group of Object.values(get(settingsStore).groupsMap)) {
				CommandManager.getInstance().AddGroupCommands(group.id);
			}

			if (get(settingsStore).devLogs) {
				this.logTime("Generated Commands for Groups in", times);
			}
		}

		// TODO: Improve hacky solution if possible
		if (window.performance.now() < disableStartupTimeout) {
			for (const group of Object.values(get(settingsStore).groupsMap)) {
				if (!group.loadAtStartup) continue;
				group.startup();
			}

			if (get(settingsStore).devLogs) {
				this.logTime("Dispatching Groups for delayed start in", times);
			}
		}

		this.displayTimeNotice(times);
	}

	private logTime(label: string, times: { label: string; time: number }[]) {
		if (get(settingsStore).devLogs) {
			times.push({ label, time: this.elapsedTime(times) });
		}
	}

	private displayTimeNotice(times: { label: string; time: number }[]) {
		if (!get(settingsStore).devLogs || times.length === 0) {
			return;
		}
		const totalTime = Math.round(this.accTime(times.slice(1)));

		new Notice(
			`${times
				.map((item) => `${item.label}: ${item.time} ms`)
				.join("\n")}\nTotal Time: ${totalTime} ms`,
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
		return times.map((item) => item.time).reduce((prev, curr) => prev + curr);
	}

	private getCurrentTime(): number {
		return Date.now();
	}

	onunload() {}
}
