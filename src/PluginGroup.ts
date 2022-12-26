import {PgComponent} from "./Types";
import {PgPlugin} from "./PgPlugin";
import {Notice} from "obsidian";
import PgMain from "../main";

export class PluginGroup implements PluginGroupData {

	id: string;
	name: string;

	plugins: PgPlugin[];
	groupIds: string[];

	generateCommands: boolean;

	enableAtStartup = false;
	delay = 0;

	assignedDevices?: string[];

	constructor(args: PluginGroupData) {
		this.id = args.id;
		this.name = args.name;

		this.assignAndLoadPlugins(args.plugins);
		this.groupIds = args.groupIds ?? [];

		this.enableAtStartup = args.enableAtStartup ?? false;
		this.delay = args.delay ?? 2;
		this.generateCommands = args.generateCommands ?? false;

		this.assignedDevices = args.assignedDevices;
	}

	assignAndLoadPlugins(plugins?: PgPlugin[]) {
		this.plugins = plugins ?? [];
	}

	startup() {
		setTimeout(async () => {
			await this.enable()
		}, this.delay * 1000)
	}

	async enable() {
		const pluginPromises: Promise<any>[] = [];

		for (const plugin of this.plugins) {
			// @ts-ignore
			if(app.plugins.enabledPlugins.has(plugin.id)) { continue; }
			// @ts-ignore
			pluginPromises.push( app.plugins.enablePlugin(plugin.id));
		}

		await Promise.allSettled(pluginPromises);
		for (const groupId of this.groupIds) {
				await PgMain.groupFromId(groupId)?.enable()
			}
		if(PgMain.instance?.settings.showNoticeOnGroupLoad) {
			let messageString: string ='Loaded ' + this.name +'\n';

			this.plugins && this.plugins.length > 0
				? messageString += '- Plugins:\n' + this.plugins.map(p => ' - ' + p.name + '\n').join('')
				: messageString += '';

			this.groupIds && this.groupIds.length > 0
				? messageString += '- Groups:\n' + this.groupIds.map(g => {
						const group = PgMain.groupFromId(g);
						if(group) { return ' - ' + group.name + '\n';}
					}).join('')
				: messageString += '';


			new Notice(messageString,5000);
		}
	}

	disable() {
		this.plugins.forEach(plugin => {
			// @ts-ignore
			app.plugins.disablePlugin(plugin.id);
		})

		this.groupIds.forEach(groupId => {
			PgMain.groupFromId(groupId)?.disable();
		})

		if(PgMain.instance?.settings.showNoticeOnGroupLoad) {
			let messageString: string ='Disabled ' + this.name +'\n';

			this.plugins && this.plugins.length > 0
				? messageString += '- Plugins:\n' + this.plugins.map(p => ' - ' + p.name + '\n').join('')
				: messageString += '';

			this.groupIds && this.groupIds.length > 0
				? messageString += '- Groups:\n' + this.groupIds.map(g => {
					const group = PgMain.groupFromId(g);
					if(group) { return ' - ' + group.name + '\n';}
				}).join('')
				: messageString += '';


			new Notice(messageString);
		}
	}

	addPlugin(plugin: PgPlugin) : boolean {
		if(this.plugins.map(p => p.id).contains(plugin.id)) return false;

		this.plugins.push(plugin);
		return true;
	}

	addGroup(group: PluginGroup) : boolean {
		if(!group.wouldHaveCyclicGroups(this.id)) {
			if(this.groupIds.contains(group.id)) return false;

			this.groupIds.push(group.id)
			return true;
		} else {
			new Notice('Couldn\'t add this group, it would create a loop of group activations:\n Group A → Group B → Group A', 4000);
		}
		return false;
	}

	removePlugin(plugin: PgPlugin): boolean {
		const indexOfPlugin: number = this.plugins.map(p => p.id).indexOf(plugin.id);

		if(indexOfPlugin === -1) return true;

		return this.plugins.splice(indexOfPlugin, 1).length > 0;
	}

	removeGroup(group: PluginGroup): boolean {
		const indexOfGroup = this.groupIds.indexOf(group.id);

		if(indexOfGroup === -1) return true;

		return this.groupIds.splice(indexOfGroup, 1).length > 0;
	}

	wouldHaveCyclicGroups(idToCheck: string) : boolean {
		if(this.id === idToCheck) {
			return true;
		}

		for (let i = 0; i < this.groupIds.length; i++) {
			const groupId = this.groupIds[i];
			if(PgMain.groupFromId(groupId)?.wouldHaveCyclicGroups(idToCheck)) {
				return true;
			}
		}
		return false;
	}
}

interface PluginGroupData extends  PgComponent{
	plugins?: PgPlugin[];
	groupIds?: string[];
	generateCommands?: boolean;
	enableAtStartup?: boolean;
	delay?: number;
	assignedDevices?: string[];
}
