import { makeCollapsible } from "src/Utils/Utilities";
import HtmlComponent from "../BaseComponents/HtmlComponent";
import { ExtraButtonComponent, Setting } from "obsidian";
import EditPluginList from "../EditPluginList";
import { PgPlugin } from "src/DataStructures/PgPlugin";
import Manager from "src/Managers/Manager";
import PluginManager from "src/Managers/PluginManager";
import { ItemAndDescription } from "../DescriptionsList";
import { PluginGroup } from "src/DataStructures/PluginGroup";
import DropdownActionButton, { DropdownOption } from "../BaseComponents/DropdownActionButton";
import FilteredGroupsList from "../FilteredGroupsList";

export interface PluginSettingOptions {
	collapsible?: boolean;
	startOpened?: boolean;
	maxListHeight?: number;
}

export default class PluginSettings extends HtmlComponent<PluginSettingOptions> {

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

		const listContainer = this.content.createDiv();
		listContainer.style.overflow = 'scroll';
		listContainer.style.maxHeight =
			(this.options.maxListHeight?.toString() ?? '') + 'px';

		this.FilterAndSort();

		this.createFilterSection(listContainer);

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

  private createFilterSection(parentEl: HTMLElement): HTMLElement {
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

		return filterSection;
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
		groupsToExclude: Map<string, PluginGroup>
	): ItemAndDescription<PgPlugin>[] {
		const pluginMembershipMap =
			Manager.getInstance().mapOfPluginsDirectlyConnectedGroups;

		return pluginsToFilter.filter((itemAndDesc) => {
			if (!pluginMembershipMap.has(itemAndDesc.item.id)) {
				return true;
			}

			for (const groupId of pluginMembershipMap.get(itemAndDesc.item.id) ?? []) {
				if (groupsToExclude.has(groupId)) {
					return false;
				}
			}
			return true;
		});
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
