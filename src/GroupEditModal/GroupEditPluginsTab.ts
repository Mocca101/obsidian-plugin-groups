import {Setting} from "obsidian";
import {PgPlugin} from "../DataStructures/PgPlugin";
import {PluginGroup} from "../DataStructures/PluginGroup";
import DropdownActionButton, {DropdownOption} from "../Components/DropdownActionButton";
import PluginManager from "../Managers/PluginManager";
import PluginListToggle from "../Components/PluginListToggle";
import Manager from "../Managers/Manager";
import FilteredGroupsList from "../Components/FilteredGroupsList";
import ReorderablePluginList from "../Components/ReorderablePluginList";
import TabbedContent from "../Components/TabbedContent";

interface PluginTabOptions {
	group: PluginGroup
}

export default class GroupEditPluginsTab extends TabbedContent<PluginTabOptions>{

	private readonly availablePlugins: PgPlugin[] = PluginManager.getAllAvailablePlugins();

	private filteredPlugins: PgPlugin[];

	private readonly sortModes = {
		byName: "By Name",
		byNameAndSelected: "By Name & Selected"
	}

	private selectedSortMode = this.sortModes.byNameAndSelected;

	searchTerm: string;

	private pluginsList: PluginListToggle;

	private filteredGroups: Map<string, PluginGroup> = new Map<string, PluginGroup>();

	constructor(parentElement: HTMLElement, options: PluginTabOptions) {
		super(parentElement, options);
		this.filteredPlugins = this.availablePlugins;

		this.generateComponent();
	}

	protected generateComponent(active?: boolean) {
		super.generateComponent(active);

		if(!this.mainEl) { return; }

		this.mainEl.createEl('h5', {text: 'Plugins'});

		const searchAndList: HTMLElement = this.mainEl?.createEl('div');

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

		const filteredGroupsChips = new FilteredGroupsList(filtersAndSelectionContainer, this.filteredGroups, ()=> this.filterAndSortPlugins());

		const toggleGroupFilter = (group: PluginGroup) => {
			this.filteredGroups.has(group.id) ? this.filteredGroups.delete(group.id) : this.filteredGroups.set(group.id, group);
		}
		const updateGroupFilters = () => {
			filteredGroupsChips.update(this.filteredGroups);
			this.filterAndSortPlugins();
		}

		const groupOptionsForButton: DropdownOption[] = [{
			label: 'All groups',
			func: () => {
				if(this.filteredGroups.size === Manager.getInstance().groupsMap.size) {
					this.filteredGroups.clear();
				} else {
					this.filteredGroups = new Map(Manager.getInstance().groupsMap);
				}
				updateGroupFilters();
			}
		}];
		Manager.getInstance().groupsMap.forEach(group => {
			groupOptionsForButton.push({
				label: group.name,
				func: () => {
					toggleGroupFilter(group);
					updateGroupFilters();
				}
			})
		})

		new DropdownActionButton(filters, {
			mainLabel: {
				label: 'Filter Groups'
			},
			dropDownOptions: groupOptionsForButton,
			drpIcon: 'filter'
		});

		const sortButton = new DropdownActionButton(filters, {
			mainLabel: {
				label: 'Sort'
			},
			dropDownOptions: [
				{
					label: this.sortModes.byName,
					func: () => {
						this.onSortModeChanged(this.sortModes.byName, sortButton);
					}
				},
				{
					label: this.sortModes.byNameAndSelected,
					func: () => {
						this.onSortModeChanged(this.sortModes.byNameAndSelected, sortButton);
					}
				},
			],
			minWidth:'80px',
			drpIcon: 'sort-desc'
		});

		new DropdownActionButton(filtersAndSelection, {
			mainLabel: {
				label: 'Bulk Select',
			},
			dropDownOptions: [
				{
					label: 'Select all',
					func: () => this.selectAllFilteredPlugins()
				},
				{
					label: 'Deselect all',
					func: () =>	this.deselectAllFilteredPlugins()
				},
			]
		});

		this.pluginsList = new PluginListToggle(searchAndList, this.sortPlugins(this.filteredPlugins, this.selectedSortMode), {group: this.options.group, onClickAction: (plugin: PgPlugin) => this.togglePluginForGroup(plugin)});

		new ReorderablePluginList(this.mainEl.createDiv(), {items: this.options.group.plugins});
	}

	private onSortModeChanged(sortMode: string, sortButton: DropdownActionButton) {
		this.selectedSortMode = sortMode;
		sortButton.options.mainLabel.label = sortMode;
		sortButton.update();
		this.filterAndSortPlugins();

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
		this.filteredPlugins.forEach(plugin => 	this.options.group.removePlugin(plugin));
		this.showFilteredPlugins();
	}

	private selectAllFilteredPlugins() {
		this.filteredPlugins.forEach(plugin => 	this.options.group.addPlugin(plugin));
		this.showFilteredPlugins();
	}

	sortPlugins(plugins: PgPlugin[], sortMode: string) : PgPlugin[] {
		if(!plugins || !(typeof plugins[Symbol.iterator] === 'function')) {
			return [];
		}
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
		return this.options.group.plugins.map(p => p.id).contains(plugin.id);
	}

	togglePluginForGroup(plugin: PgPlugin) {
		const { group } = this.options;
		group.plugins.filter(p => p.id === plugin.id).length > 0
			? group.removePlugin(plugin)
			: group.addPlugin(plugin);
	}
}
