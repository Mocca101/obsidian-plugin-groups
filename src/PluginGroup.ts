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


	constructor(id: string, name: string, plugins: PgPlugin[] = [], pluginGroups: PluginGroup[] = [],
				active = false, isStartup = false, delay = 5) {
		this.id = id;
		this.name = name;
		this.plugins = plugins;
		this.pluginGroups = pluginGroups;
		this.active = active;
		this.isStartup = isStartup;
		this.delay = delay;
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

		this.pluginGroups.forEach(plpuginGroup => {
			if(plpuginGroup.wouldHaveCyclicGroups(idToCheck)) {
				return true;
			}
		})

		return false;
	}

}
