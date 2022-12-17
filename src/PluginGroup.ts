import {PgComponent} from "./Types";
import {PgPlugin} from "./PgPlugin";

export class PluginGroup implements PgComponent{

	id: string;
	name: string;
	plugins: PgPlugin[];
	pluginGroups: PluginGroup[];
	active: boolean;

	isStartup = false;
	delay = 0;

	constructor(args: PluginGroupConstructorArgs) {
		console.log(args)

		if(args.pg) {
			this.id = args.pg.id;
			this.name = args.pg.name;

			this.assignAndLoadPlugins(args.pg.plugins);
			this.assignAndLoadGroups(args.pg.pluginGroups);

			this.active = args.pg.active;
			this.isStartup = args.pg.isStartup;
			this.delay = args.pg.delay;
			return;
		}
		this.id = args.id;
		this.name = args.name;

		this.assignAndLoadPlugins(args.plugins);
		this.assignAndLoadGroups(args.pluginGroups);

		this.active = args.active ?? false;
		this.isStartup = args.isStartup ?? false;
		this.delay = args.delay ?? 2;
	}

	assignAndLoadPlugins(plugins?: PgPlugin[]) {
		console.log('pl', plugins);
		this.plugins = plugins?.map(p => new PgPlugin(p.id, p.name)) ?? [];
	}

	assignAndLoadGroups(pluginGroups?: PluginGroup[]) {
		this.pluginGroups = pluginGroups?.map(pg => new PluginGroup({id: pg.id, name: pg.name, pg: pg})) ?? [];
	}

	startup() {
		console.log('startup');
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

	addPgComponent(component: PgComponent) {
		if((component instanceof PgPlugin)) {
			if(this.plugins.map(p => p.id).contains(component.id)) return;

			this.plugins.push(component);
			return;
		}
		if((component instanceof PluginGroup) && !this.wouldHaveCyclicGroups(component.id)) {
			if(this.pluginGroups.map(p => p.id).contains(component.id)) return;

			this.pluginGroups.push(component)
			return;
		} else {
			throw new Error('Couldn\'t add Group as it would cause cyclic of groups (This would lead to an endless cycle of en/disabling).')
		}
	}

	removePgComponent(component: PgComponent) {
		if((component instanceof PgPlugin)) {
			const componentID = this.plugins.map(p => p.id).indexOf(component.id);

			if(componentID === -1) return;

			this.plugins.splice(componentID, 1);
			return;
		}
		if((component instanceof PluginGroup) && !this.wouldHaveCyclicGroups(component.id)) {
			const componentID = this.pluginGroups.map(p => p.id).indexOf(component.id);

			if(componentID === -1) return;

			this.pluginGroups.splice(componentID, 1);
			return;
		} else {
			throw new Error('Couldn\'t add Group as it would cause cyclic of groups (This would lead to an endless cycle of en/disabling).')
		}
	}

	wouldHaveCyclicGroups(idToCheck: string) : boolean {
		if(this.id === idToCheck) {
			return true;
		}

		this.pluginGroups.forEach(pluginGroup => {
			if(pluginGroup.wouldHaveCyclicGroups(idToCheck)) {
				return true;
			}
		})

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
}
