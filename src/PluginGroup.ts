import {PgComponent} from "./Types";
import {PgPlugin} from "./PgPlugin";
import {Notice} from "obsidian";
import PgMain from "../main";

export class PluginGroup implements PgComponent{

	id: string;
	name: string;
	plugins: PgPlugin[];
	groupIds: string[];

	generateCommands: boolean;

	enableAtStartup = false;
	delay = 0;

	constructor(args: PluginGroupConstructorArgs) {
		if(args.pg) {
			this.id = args.pg.id;
			this.name = args.pg.name;

			this.assignAndLoadPlugins(args.pg.plugins);
			this.groupIds = args.pg.groupIds ?? [];

			this.enableAtStartup = args.pg.enableAtStartup;
			this.delay = args.pg.delay;
			this.generateCommands = args.pg.generateCommands;
			return;
		}
		this.id = args.id;
		this.name = args.name;

		this.assignAndLoadPlugins(args.plugins);
		this.groupIds = args.groupIds ?? [];

		this.enableAtStartup = args.isStartup ?? false;
		this.delay = args.delay ?? 2;
		this.generateCommands = args.generateCommands ?? false;
	}

	assignAndLoadPlugins(plugins?: PgPlugin[]) {
		this.plugins = plugins ?? [];
	}

	startup() {
		setTimeout(async () => {
			this.enable()
		}, this.delay * 1000)
	}

	enable() {
		console.log("-> enabling ", this);
		this.plugins.forEach(plugin => {
			// @ts-ignore
			app.plugins.enablePlugin(plugin.id);
		})
		this.groupIds.forEach(groupId =>
			PgMain.groupFromId(groupId)?.enable()
		);
	}

	disable() {
		this.plugins.forEach(plugin => {
			// @ts-ignore
			app.plugins.disablePlugin(plugin.id);
		})

		this.groupIds.forEach(groupId => {
			PgMain.groupFromId(groupId)?.disable();
		})
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


interface PluginGroupConstructorArgs {
	id: string;
	name:string;
	pg?: PluginGroup;
	plugins?: PgPlugin[];
	groupIds?: string[];
	active?: boolean;
	isStartup?: boolean;
	delay?: number;
	generateCommands?: boolean;
}
