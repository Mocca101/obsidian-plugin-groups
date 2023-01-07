import {ButtonComponent, Setting} from "obsidian";
import {PgPlugin} from "../PgPlugin";
import {PluginGroup} from "../PluginGroup";
import {groupFromId} from "../Utils/Utilities";
import ButtonWithDropdown from "../Components/ButtonWithDropdown";
import PluginManager from "../Managers/PluginManager";
import PluginList from "../Components/PluginList";

export default class GroupEditPluginsTab {
	containerEl: HTMLElement;

	private readonly availablePlugins: PgPlugin[] = PluginManager.getAllAvailablePlugins();

	private filteredPlugins: PgPlugin[];

	private groupToEdit: PluginGroup;

	excludedGroupIds: Set<string> = new Set<string>();

	searchTerm: string;

	private pluginsList: PluginList;


	constructor(group: PluginGroup, parentEl: HTMLElement) {
		this.groupToEdit = group;
		this.filteredPlugins = this.availablePlugins;

		this.containerEl = this.generatePluginSection(parentEl)
	}

	private generatePluginSection(parentElement: HTMLElement) : HTMLElement {

		const pluginSection = parentElement.createDiv({cls:"pg-tabbed-content"});

		pluginSection.createEl('h5', {text: 'Plugins'});

		const searchAndList: HTMLElement = pluginSection.createEl('div');

		new Setting(searchAndList)
			.setName('Search')
			.addText(txt => {
				txt.setPlaceholder('Search for Plugin...')
				txt.onChange(search => {
					this.searchPlugins(search);
				})
			})


		const filtersAndSelection = new Setting(searchAndList);
		filtersAndSelection.addToggle(tgl => {
			tgl.onChange(value => {
				value ? this.excludedGroupIds.add(this.groupToEdit.id) : this.excludedGroupIds.delete(this.groupToEdit.id);
				this.filterPlugins();
			})
		})

		new ButtonWithDropdown(filtersAndSelection.settingEl, {label: 'Bulk Select'}, [
			{label: 'Select all', func: () => this.selectAllFilteredPlugins()},
			{label: 'Deselect all',	func: () =>	this.deselectAllFilteredPlugins()},
		])


		this.pluginsList = new PluginList(searchAndList, this.filteredPlugins, {group: this.groupToEdit, onClickAction: (plugin: PgPlugin) => this.togglePluginForGroup(plugin)});

		return pluginSection;
	}

	private setIconForPluginBtn(btn: ButtonComponent, pluginId: string) {
		btn.setIcon(this.groupToEdit.plugins.map(p => p.id).contains(pluginId) ? 'check-circle' : 'circle')
	}


	// Cumulative Filter function called from various points that acts depending on filter variables set at object level
	private filterPlugins() {

		this.filteredPlugins = this.availablePlugins;
		if(this.searchTerm && this.searchTerm !== '') {
			this.filteredPlugins = this.filteredPlugins
				.filter(p => p.name.toLowerCase().contains(this.searchTerm.toLowerCase()));
		}

		const pluginsToExclude = this.excludedPlugins();

		if(pluginsToExclude) {
			this.filteredPlugins = this.filteredPlugins.filter(plugin => !pluginsToExclude.has(plugin.id))
		}

		this.showFilteredPlugins();
	}

	private excludedPlugins() : Set<string> | null {
		let pluginsToExclude: Set<string> | null = null;

		// TODO: Do I also want to be able to know the plugins inside compound groups (groups that contain groups)
		if(this.excludedGroupIds && this.excludedGroupIds.size > 0) {
			let arr: string[] = [];
			this.excludedGroupIds.forEach(id => {
					arr = [...arr, ...(groupFromId(id)?.plugins.map(plugin => plugin.id) ?? [])];
				}
			)
			if(arr && arr.length > 0) {
				pluginsToExclude = new Set<string>(arr);
			}
		}
		return pluginsToExclude;
	}


	private searchPlugins(search: string) {
		this.searchTerm = search;
		this.filterPlugins();
		this.showFilteredPlugins();
	}

	private showFilteredPlugins() {
		this.pluginsList.updateList(this.filteredPlugins);
	}

	private deselectAllFilteredPlugins() {
		this.filteredPlugins.forEach(plugin => 	this.groupToEdit.removePlugin(plugin));
		this.showFilteredPlugins();
	}

	private selectAllFilteredPlugins() {
		this.filteredPlugins.forEach(plugin => 	this.groupToEdit.addPlugin(plugin));
		this.showFilteredPlugins();
	}

	sortPlugins(plugins: PgPlugin[]) : PgPlugin[] {
		return plugins.sort((a, b) => {
			const aInGroup = this.isPluginInGroup(a);
			const bInGroup = this.isPluginInGroup(b);
			if(aInGroup && !bInGroup) return -1;
			else if(!aInGroup && bInGroup) return 1;
			else {
				return a.name.localeCompare(b.name);
			}
		})
	}

	isPluginInGroup(plugin: PgPlugin) :boolean {
		return this.groupToEdit.plugins.map(p => p.id).contains(plugin.id);
	}



	togglePluginForGroup(plugin: PgPlugin) {
		if(this.groupToEdit.plugins.map(p => p.id).contains(plugin.id)) {
			this.groupToEdit.removePlugin(plugin);
		} else {
			this.groupToEdit.addPlugin(plugin);
		}
	}
}
