import { Notice } from "obsidian";
import PluginManager from "../Managers/PluginManager";
import type { PgComponent } from "../Utils/Types";
import {
	groupFromId,
} from "../Utils/Utilities";
import type { PgPlugin } from "./PgPlugin";
import { currentDeviceStore, settingsStore } from "@/stores/main-store";
import { get } from "svelte/store";

export class PluginGroup implements PluginGroupData {
	id: string;
	name: string;

	plugins: PgPlugin[];
	groupIds: string[];

	generateCommands: boolean;

	loadAtStartup = false;
	disableOnStartup = false;
	delay = 0;

	assignedDevices?: string[];

	autoAdd?: boolean;
	constructor(pgData: PluginGroupData) {
		this.id = pgData.id;
		this.name = pgData.name;

		this.assignAndLoadPlugins(pgData.plugins);
		this.groupIds = pgData.groupIds ?? [];

		this.loadAtStartup = pgData.loadAtStartup ?? false;
		this.disableOnStartup = pgData.disableOnStartup ?? false;
		this.delay = pgData.delay ?? 2;
		this.generateCommands = pgData.generateCommands ?? false;

		this.assignedDevices = pgData.assignedDevices;
		this.autoAdd = pgData.autoAdd;
	}

	groupActive(): boolean {
		if (!this.assignedDevices || this.assignedDevices.length === 0) {
			return true;
		}

		const activeDevice: string | null = get(currentDeviceStore);
		if (!activeDevice) {
			return true;
		}

		return !!this.assignedDevices?.contains(activeDevice);
	}

	assignAndLoadPlugins(plugins?: PgPlugin[]) {
		this.plugins = plugins ?? [];
	}

	startup() {
		if (!this.loadAtStartup) {
			return;
		}

		if (this.disableOnStartup) {
			setTimeout(async () => {
				await this.disable();
			}, this.delay * 1000);
			return;
		}

		setTimeout(async () => {
			await this.enable();
		}, this.delay * 1000);
		return;
	}

	async enable() {
		if (!this.groupActive()) {
			return;
		}

		const pluginPromises: Promise<boolean>[] = [];

		for (const plugin of this.plugins) {
			if (get(settingsStore).doLoadSynchronously) {
				pluginPromises.push(PluginManager.queuePluginForEnable(plugin));
			} else {
				await PluginManager.queuePluginForEnable(plugin);
			}
		}

		await Promise.allSettled(pluginPromises);

		for (const groupId of this.groupIds) {
			await groupFromId(groupId)?.enable();
		}
		if (get(settingsStore).showNoticeOnGroupLoad) {
			const messageString: string = `Loaded ${this.name}`;

			if (get(settingsStore).showNoticeOnGroupLoad === "short") {
				new Notice(messageString);
			} else if (get(settingsStore).showNoticeOnGroupLoad === "normal") {
				new Notice(`${messageString}\n${this.getGroupListString()}`);
			}
		}
	}

	disable() {
		if (!this.groupActive()) {
			return;
		}

		this.plugins.forEach((plugin) => {
			PluginManager.queueDisablePlugin(plugin);
		});

		this.groupIds.forEach((groupId) => {
			groupFromId(groupId)?.disable();
		});

		if (get(settingsStore).showNoticeOnGroupLoad !== "none") {
			const messageString: string = `Disabled ${this.name}`;

			if (get(settingsStore).showNoticeOnGroupLoad === "short") {
				new Notice(messageString);
			} else if (get(settingsStore).showNoticeOnGroupLoad === "normal") {
				new Notice(`${messageString}\n${this.getGroupListString()}`);
			}
		}
	}

	getGroupListString(): string {
		const existingPluginsInGroup =
			PluginManager.getAllAvailablePlugins().filter((p) =>
				this.plugins.map((p) => p.id).contains(p.id)
			);
		let messageString = "";
		this.plugins && this.plugins.length > 0
			? (messageString += `- Plugins:\n${existingPluginsInGroup
					.map((p) => ` - ${p.name}\n`)
					.join("")}`)
			: (messageString += "");

		this.groupIds && this.groupIds.length > 0
			? (messageString += `- Groups:\n${this.groupIds
					.map((g) => {
						const group = groupFromId(g);
						if (group?.groupActive()) {
							return ` - ${group.name}\n`;
						}
					})
					.join("")}`)
			: (messageString += "");

		return messageString;
	}

	addPlugin(plugin: PgPlugin): boolean {
		if (this.plugins.map((p) => p.id).contains(plugin.id)) return false;

		this.plugins.push(plugin);
		return true;
	}

	addGroup(group: PluginGroup): boolean {
		if (!group.wouldHaveCyclicGroups(this.id)) {
			if (this.groupIds.contains(group.id)) return false;

			this.groupIds.push(group.id);
			return true;
		}
		new Notice(
			"Couldn't add this group, it would create a loop of group activations:\n Group A → Group B → Group A",
			4000
		);
		return false;
	}

	removePlugin(plugin: PgPlugin): boolean {
		const indexOfPlugin: number = this.plugins
			.map((p) => p.id)
			.indexOf(plugin.id);

		if (indexOfPlugin === -1) return true;

		return this.plugins.splice(indexOfPlugin, 1).length > 0;
	}

	removeGroup(group: PluginGroup): boolean {
		const indexOfGroup = this.groupIds.indexOf(group.id);

		if (indexOfGroup === -1) return true;

		return this.groupIds.splice(indexOfGroup, 1).length > 0;
	}

	wouldHaveCyclicGroups(idToCheck: string): boolean {
		if (this.id === idToCheck) {
			return true;
		}

		for (let i = 0; i < this.groupIds.length; i++) {
			const groupId = this.groupIds[i];
			if (groupFromId(groupId)?.wouldHaveCyclicGroups(idToCheck)) {
				return true;
			}
		}
		return false;
	}

	getAllPluginIdsControlledByGroup(): Set<string> {
		let pluginsArr = this.plugins.map((plugin) => plugin.id);

		this.groupIds.forEach((gid) => {
			const group = groupFromId(gid);
			if (group) {
				pluginsArr = [
					...pluginsArr,
					...group.getAllPluginIdsControlledByGroup(),
				];
			}
		});
		return new Set<string>(pluginsArr);
	}
}

interface PluginGroupData extends PgComponent {
	plugins?: PgPlugin[];
	groupIds?: string[];
	generateCommands?: boolean;
	loadAtStartup?: boolean;
	disableOnStartup?: boolean;
	delay?: number;
	startupBehaviour?: string;
	assignedDevices?: string[];
	autoAdd?: boolean;
}
