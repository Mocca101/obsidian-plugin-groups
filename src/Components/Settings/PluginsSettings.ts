import { makeCollapsible } from "@/Utils/Utilities";
import HtmlComponent from "@/Components/BaseComponents/HtmlComponent";
import { ExtraButtonComponent, Setting } from "obsidian";
import EditPluginList from "@/Components/EditPluginList";
import type { PgPlugin } from "@/DataStructures/PgPlugin";
import Manager from "@/Managers/Manager";
import PluginManager from "@/Managers/PluginManager";
import type { ItemAndDescription } from "@/Components/DescriptionsList";
import type { PluginGroup } from "@/DataStructures/PluginGroup";
import DropdownActionButton, { type DropdownOption } from "@/Components//BaseComponents/DropdownActionButton";
import FilteredGroupsList from "@/Components/FilteredGroupsList";

export interface PluginSettingOptions {
	collapsible?: boolean;
	startOpened?: boolean;
	maxListHeight?: number;
}

export default class PluginSettings extends HtmlComponent<PluginSettingOptions> {

	private readonly FilterModes = {
		notInGroup: 'Not in the Group(s)',
		inGroup: 'In the Groups',
	};

	activeFilterMode = this.FilterModes.inGroup;

  content: HTMLElement;

  private filteredPlugins: ItemAndDescription<PgPlugin>[];

	searchTerm: string;

  private pluginsList: EditPluginList;

	private filteredGroups: Map<string, PluginGroup> = new Map<
		string,
		PluginGroup
	>();


	constructor(parentEL: HTMLElement, options: PluginSettingOptions) {
		super(parentEL, options);
		this.generateComponent();
	}

  protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv();
	}

  protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

    const header = this.mainEl.createEl('h5', { text: 'Plugins' });

		this.content = this.mainEl.createDiv();

		makeCollapsible(header, this.content);

		if (this.options.collapsible) {
			makeCollapsible(header, this.content, this.options.startOpened);
		}

		this.FilterAndSort();

		this.GenerateFilterSection(this.content);

		const listContainer = this.content.createDiv();
		listContainer.style.overflow = 'scroll';
		listContainer.style.maxHeight =
			(this.options.maxListHeight?.toString() ?? '') + 'px';


		this.GeneratePluginsList(listContainer);
	}

  GeneratePluginsList(parentEl: HTMLElement) {

		const refresh = new ExtraButtonComponent(this.content);
		refresh.setIcon('refresh-cw');
		refresh.setTooltip(
			'Refresh list for changes to the plugins and assigned groups.'
		);

		this.pluginsList = new EditPluginList(
			this.content,
			{
				items: this.filteredPlugins,
			},
			() => {
				this.pluginsList.update({
					items: this.filteredPlugins,
				});
			}
		);

		refresh.onClick(() => {
			this.pluginsList.update({
				items: this.filteredPlugins,
			});
		});
	}

	private getPluginsWithGroupsAsDescription(): ItemAndDescription<PgPlugin>[] {
		return PluginManager.getAllAvailablePlugins().map((plugin) => {
			const groups = Manager.getInstance().getGroupsOfPlugin(plugin.id);

			return {
				item: plugin,
				description: groups.map((group) => group.name).join(', '),
			};
		});
	}

  // ------------------------------------------------------------------------

  private GenerateFilterSection(parentEl: HTMLElement): HTMLElement {
		const filterSection = parentEl.createDiv();
		new Setting(filterSection).setName('Search').addText((txt) => {
			txt.setPlaceholder('Search for Plugin...');
			txt.onChange((search) => {
				this.searchPlugins(search);
			});
		});

		const filtersAndSelectionContainer = filterSection.createDiv({
			cls: 'pg-plugin-filter-container',
		});
		const filtersAndSelection = filtersAndSelectionContainer.createDiv({
			cls: 'pg-plugin-filter-section',
		});
		const filters = filtersAndSelection.createDiv();

		const filteredGroupsChips = new FilteredGroupsList(
			filtersAndSelectionContainer,
			this.filteredGroups,
			() => this.OnFilterOrSortUpdated()
		);

		const toggleGroupFilter = (group: PluginGroup) => {
			this.filteredGroups.has(group.id)
				? this.filteredGroups.delete(group.id)
				: this.filteredGroups.set(group.id, group);
		};
		const updateGroupFilters = () => {
			filteredGroupsChips.update(this.filteredGroups);
			this.OnFilterOrSortUpdated();
		};

		const groupFilterOptions: DropdownOption[] = [
			{
				label: 'All groups',
				func: () => {
					if (
						this.filteredGroups.size ===
						Manager.getInstance().groupsMap.size
					) {
						this.filteredGroups.clear();
					} else {
						this.filteredGroups = new Map(
							Manager.getInstance().groupsMap
						);
					}
					updateGroupFilters();
				},
			},
		];
		Manager.getInstance().groupsMap.forEach((group) => {
			groupFilterOptions.push({
				label: group.name,
				func: () => {
					toggleGroupFilter(group);
					updateGroupFilters();
				},
			});
		});

		new DropdownActionButton(filters, {
			mainLabel: {
				label: 'Filter Groups',
			},
			dropDownOptions: groupFilterOptions,
			drpIcon: 'filter',
		});

		// TODO: Add Filter Mode Functionality: "Not In Selected Groups, In selected Groups"

		const sortButton = new DropdownActionButton(filters, {
			mainLabel: {
				label: this.activeFilterMode,
			},
			dropDownOptions: [
				{
					label: this.FilterModes.notInGroup,
					func: () => {
						this.onFilterModeChanged(
							this.FilterModes.notInGroup,
							sortButton
						);
					},
				},
				{
					label: this.FilterModes.inGroup,
					func: () => {
						this.onFilterModeChanged(
							this.FilterModes.inGroup,
							sortButton
						);
					},
				},
			],
			minWidth: '80px',
			drpIcon: 'sort-desc',
		});

		return filterSection;
	}

	private onFilterModeChanged(
		filterMode: string,
		sortButton: DropdownActionButton) {
			this.activeFilterMode = filterMode;
			sortButton.options.mainLabel.label = filterMode;
			sortButton.update();
			this.OnFilterOrSortUpdated();
	}

	// Cumulative Filter function called from various points that acts depending on filter variables set at object level
	private OnFilterOrSortUpdated() {
		this.FilterAndSort();

		this.showFilteredPlugins();
	}

	private FilterAndSort() {
		this.filteredPlugins = this.getPluginsWithGroupsAsDescription();
		if (this.searchTerm && this.searchTerm !== '') {
			this.filteredPlugins = this.filteredPlugins.filter((p) => p.item.name.toLowerCase().contains(this.searchTerm.toLowerCase())
			);
		}

		if (this.filteredGroups.size > 0) {
			this.filteredPlugins = this.filterPluginsByGroups(
				this.filteredPlugins,
				this.filteredGroups
			);
		}

		this.filteredPlugins = this.sortPlugins(
			this.filteredPlugins
		);
	}

	private filterPluginsByGroups(
		pluginsToFilter: ItemAndDescription<PgPlugin>[],
		filterGroups: Map<string, PluginGroup>
	): ItemAndDescription<PgPlugin>[] {
		const groupsOfPlugins =
			Manager.getInstance().mapOfPluginsDirectlyConnectedGroups;

		if(this.activeFilterMode === this.FilterModes.notInGroup){
			return this.filterByNotInGroup(pluginsToFilter, groupsOfPlugins, filterGroups);
		}

		if(this.activeFilterMode === this.FilterModes.inGroup){
			return this.filterByInGroup(pluginsToFilter, groupsOfPlugins, filterGroups);
		}

		return pluginsToFilter;
	}


	private filterByInGroup(
			pluginsToFilter: ItemAndDescription<PgPlugin>[],
			groupsOfPlugins: Map<string, Set<string>>,
			groupsToFilter: Map<string, PluginGroup>) {

		let filteredPlugins: ItemAndDescription<PgPlugin>[] = pluginsToFilter;
		filteredPlugins = filteredPlugins.filter(element => {
			return groupsOfPlugins.has(element.item.id);
		}
		).filter(element => {
			const groupsOfPlugin = groupsOfPlugins.get(element.item.id);
			for(const groupToFilter of groupsToFilter.keys()){
				if(!groupsOfPlugin?.has(groupToFilter)){
					return false;
				}
			}
			return true;
		});
		return filteredPlugins;
	}

	private filterByNotInGroup(pluginsToFilter: ItemAndDescription<PgPlugin>[], groupsOfPlugins: Map<string, Set<string>>, groupsToFilter: Map<string, PluginGroup>) {
		const filteredPlugins: ItemAndDescription<PgPlugin>[] = pluginsToFilter.filter(element => {
			if(!groupsOfPlugins.has(element.item.id)) {
				return true;
			}

			for (const groupOfPlugin of groupsOfPlugins.get(element.item.id) ?? []) {
				if(groupsToFilter.has(groupOfPlugin)){
					return false;
				}
			}

			return true;
		});
		return filteredPlugins;
	}

	private searchPlugins(search: string) {
		this.searchTerm = search;
		this.OnFilterOrSortUpdated();
		this.showFilteredPlugins();
	}

	private showFilteredPlugins() {
		this.pluginsList.update({ items: this.filteredPlugins});
	}

  sortPlugins(plugins: ItemAndDescription<PgPlugin>[]): ItemAndDescription<PgPlugin>[] {
		if (!plugins || !(typeof plugins[Symbol.iterator] === 'function')) {
			return [];
		}
		const sortedArray = [...plugins];

		return sortedArray.sort((a, b) => a.item.name.localeCompare(b.item.name));
	}
}
