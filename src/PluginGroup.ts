import {PgComponent} from "./Types";
import {PgPlugin} from "./PgPlugin";
import {Notice} from "obsidian";

export class PluginGroup implements PgComponent{

	id: string;
	name: string;
	plugins: PgPlugin[];
	pluginGroups: PluginGroup[];

	generateCommands: boolean;

	enableAtStartup = false;
	delay = 0;

	constructor(args: PluginGroupConstructorArgs) {
		if(args.pg) {
			this.id = args.pg.id;
			this.name = args.pg.name;

			this.assignAndLoadPlugins(args.pg.plugins);
			this.assignAndLoadGroups(args.pg.pluginGroups);

			this.enableAtStartup = args.pg.enableAtStartup;
			this.delay = args.pg.delay;
			this.generateCommands = args.pg.generateCommands;
			return;
		}
		this.id = args.id;
		this.name = args.name;

		this.assignAndLoadPlugins(args.plugins);
		this.assignAndLoadGroups(args.pluginGroups);

		this.enableAtStartup = args.isStartup ?? false;
		this.delay = args.delay ?? 2;
		this.generateCommands = args.generateCommands ?? false;
	}

	assignAndLoadPlugins(plugins?: PgPlugin[]) {
		this.plugins = plugins?.map(p => new PgPlugin(p.id, p.name)) ?? [];
	}

	assignAndLoadGroups(pluginGroups?: PluginGroup[]) {
		this.pluginGroups = pluginGroups?.map(pg => new PluginGroup({id: pg.id, name: pg.name, pg: pg})) ?? [];
	}

	startup() {
		setTimeout(async () => {
			this.enable()
		}, this.delay * 1000)
	}

	enable() {
		this.plugins.forEach(plugin => {
			plugin.enable();
		})
		this.pluginGroups.forEach(pluginGroup => pluginGroup.enable())
	}

	disable() {
		this.plugins.forEach(plugin => {
			plugin.disable();
		})

		this.pluginGroups.forEach(pluginGroup => {
			pluginGroup.disable();
		})
	}

	addPgComponent(component: PgComponent) : boolean {
		if((component instanceof PgPlugin)) {
			if(this.plugins.map(p => p.id).contains(component.id)) return false;

			this.plugins.push(component);
			return true;
		}

		if(!(component instanceof PluginGroup)) {
			return false;
		}

		if(!component.wouldHaveCyclicGroups(this.id)) {
			if(this.pluginGroups.map(p => p.id).contains(component.id)) return false;
			this.pluginGroups.push(component)
			return true;
		} else {
			new Notice('Couldn\'t add this group, it would create a loop of group activations:\n Group A → Group B → Group A', 4000);
		}
		return false;
	}

	removePgComponent(component: PgComponent) : boolean{
		if((component instanceof PgPlugin)) {
			const indexOfPlugin: number = this.plugins.map(p => p.id).indexOf(component.id);

			if(indexOfPlugin === -1) return true;

			this.plugins.splice(indexOfPlugin, 1);
			return true;
		}

		if((component instanceof PluginGroup)) {
			const indexOfGroup = this.pluginGroups.map(p => p.id).indexOf(component.id);

			if(indexOfGroup === -1) return true;

			this.pluginGroups.splice(indexOfGroup, 1);
			return true;
		} else {
			throw new Error('Couldn\'t add Group as it would cause cyclic of groups (This would lead to an endless cycle of en/disabling).')
		}
	}

	wouldHaveCyclicGroups(idToCheck: string) : boolean {
		if(this.id === idToCheck) {
			return true;
		}

		for (let i = 0; i < this.pluginGroups.length; i++) {
			const pluginGroup = this.pluginGroups[i];
			if(pluginGroup.wouldHaveCyclicGroups(idToCheck)) {
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
	pluginGroups?: PluginGroup[];
	active?: boolean;
	isStartup?: boolean;
	delay?: number;
	generateCommands?: boolean;
}
