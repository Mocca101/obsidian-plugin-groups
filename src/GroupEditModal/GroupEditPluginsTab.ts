import {Setting} from "obsidian";
import {PgPlugin} from "../PgPlugin";
import {PluginGroup} from "../PluginGroup";
import DropdownActionButton, {DropdownOption} from "../Components/DropdownActionButton";
import PluginManager from "../Managers/PluginManager";
import PluginList from "../Components/PluginList";
import Manager from "../Managers/Manager";
import FilteredGroupsList from "../Components/FilteredGroupsList";

export default class GroupEditPluginsTab {
	containerEl: HTMLElement;

	private readonly availablePlugins: PgPlugin[] = PluginManager.getAllAvailablePlugins();

	private filteredPlugins: PgPlugin[];

	private groupToEdit: PluginGroup;

	private readonly sortModes = {
		byName: "By Name",
		byNameAndSelected: "By Name & Selected"
	}

	private selectedSortMode = this.sortModes.byNameAndSelected;

	searchTerm: string;

	private pluginsList: PluginList;

	private filteredGroups: Map<string, PluginGroup> = new Map<string, PluginGroup>();

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



		const filtersAndSelectionContainer = searchAndList.createDiv({cls: 'pg-plugin-filter-container'});
		const filtersAndSelection = filtersAndSelectionContainer.createDiv({cls: 'pg-plugin-filter-section'});
		const filters = filtersAndSelection.createDiv();

		const filteredGroupsList = new FilteredGroupsList(filtersAndSelectionContainer, this.filteredGroups, ()=> this.filterAndSortPlugins());

		const toggleGroupFilter = (group: PluginGroup) => {
			this.filteredGroups.has(group.id) ? this.filteredGroups.delete(group.id) : this.filteredGroups.set(group.id, group);
			filteredGroupsList.update(this.filteredGroups);
		}

		const groupOptionsForButton: DropdownOption[] = [{
			label: 'All groups',
			func: () => {
				if(this.filteredGroups.size === Manager.getInstance().groupsMap.size) {
					Manager.getInstance().groupsMap.forEach(group => {
						this.filteredGroups.delete(group.id);
					});
				} else {
					Manager.getInstance().groupsMap.forEach(group => {
						this.filteredGroups.set(group.id, group);
					});
				}
				filteredGroupsList.update(this.filteredGroups);
				this.filterAndSortPlugins();
			}
		}];
		Manager.getInstance().groupsMap.forEach(group => {
			groupOptionsForButton.push({
				label: group.name,
				func: () => {
					toggleGroupFilter(group);
					this.filterAndSortPlugins();
				}
			})
		})

		new DropdownActionButton(filters, {label: 'Filter Groups'}, groupOptionsForButton, {drpIcon: 'filter'});

		const sortButton = new DropdownActionButton(filters, {label: 'Sort'}, [
			{
				label: this.sortModes.byName,
				func: () => {
					this.selectedSortMode = this.sortModes.byName;
					sortButton.mainLabel.label = this.sortModes.byName;
					sortButton.rerender();
					this.filterAndSortPlugins();

				}
			},
			{
				label: this.sortModes.byNameAndSelected,
				func: () => {
					this.selectedSortMode = this.sortModes.byNameAndSelected;
					sortButton.mainLabel.label = this.sortModes.byNameAndSelected;
					sortButton.rerender();
					this.filterAndSortPlugins();
				}
			},
		], {width:'80px', drpIcon: 'sort-desc'})

		new DropdownActionButton(filtersAndSelection, {label: 'Bulk Select'}, [
			{label: 'Select all', func: () => this.selectAllFilteredPlugins()},
			{label: 'Deselect all',	func: () =>	this.deselectAllFilteredPlugins()},
		])

		this.pluginsList = new PluginList(searchAndList, this.sortPlugins(this.filteredPlugins, this.selectedSortMode), {group: this.groupToEdit, onClickAction: (plugin: PgPlugin) => this.togglePluginForGroup(plugin)});

		return pluginSection;
	}

	// Cumulative Filter function called from various points that acts depending on filter variables set at object level
	private filterAndSortPlugins() {

		this.filteredPlugins = this.availablePlugins;
		if(this.searchTerm && this.searchTerm !== '') {
			this.filteredPlugins = this.filteredPlugins
				.filter(p => p.name.toLowerCase().contains(this.searchTerm.toLowerCase()));
		}

		if(this.filteredGroups.size > 0) {
			this.filteredPlugins = this.filterPluginsByGroups(this.filteredPlugins, this.filteredGroups);
		}

		this.filteredPlugins = this.sortPlugins(this.filteredPlugins, this.selectedSortMode);

		this.showFilteredPlugins();
	}

	private filterPluginsByGroups(pluginsToFilter: PgPlugin[], groupsToExclude: Map<string, PluginGroup>) : PgPlugin[] {
		const pluginMembershipMap = Manager.getInstance().mapOfPluginsDirectlyConnectedGroups;
		return pluginsToFilter.filter(plugin => {
			if (!pluginMembershipMap.has(plugin.id)) { return true; }

			for (const groupId of pluginMembershipMap.get(plugin.id) ?? []) {
				if(groupsToExclude.has(groupId)) {
					return false;
				}
			}
			return true;
		})
	}

	private searchPlugins(search: string) {
		this.searchTerm = search;
		this.filterAndSortPlugins();
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

	sortPlugins(plugins: PgPlugin[], sortMode: string) : PgPlugin[] {
		const sortedArray = [...plugins];

		if(sortMode === this.sortModes.byName) {
			return sortedArray.sort((a, b) => a.name.localeCompare(b.name));
		}

		if(sortMode === this.sortModes.byNameAndSelected) {
			sortedArray.sort((a, b) => a.name.localeCompare(b.name));
			sortedArray.sort((a, b) => {
				const aInGroup = this.isPluginInGroup(a);
				const bInGroup = this.isPluginInGroup(b);
				if (aInGroup && !bInGroup) return -1;
				else if (!aInGroup && bInGroup) return 1;
				else return 0;
			});
		}

		return sortedArray;
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
