import {ButtonComponent, Setting} from "obsidian";
import {PgPlugin} from "../PgPlugin";
import {PluginGroup} from "../PluginGroup";
import {groupFromId} from "../Utils/Utilities";
import ButtonWithDropdown from "../Components/ButtonWithDropdown";
import PluginManager from "../Managers/PluginManager";

export default class GroupEditPluginsTab {
	containerEl: HTMLElement;

	private readonly availablePlugins: PgPlugin[] = PluginManager.getAllAvailablePlugins();

	private pluginListElements : Map<string, {setting: Setting, btn: ButtonComponent}> = new Map<string, {setting: Setting, btn: ButtonComponent}>();

	private filteredPlugins: PgPlugin[];

	private groupToEdit: PluginGroup;

	excludedGroupIds: Set<string> = new Set<string>();

	searchTerm: string;


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

		const pluginList = searchAndList.createEl('div');
		pluginList.addClass('group-edit-modal-plugin-list');


		this.pluginListElements = new Map<string, {setting: Setting, btn: ButtonComponent}>();

		// TODO: Change this in the process of making sure plugins are loaded in the correct (user defined) order
		this.sortPlugins(this.availablePlugins)
			.forEach(plugin => {
				const setting = new Setting(pluginList)
					.setName(plugin.name);
				const btn: ButtonComponent = new ButtonComponent(setting.settingEl);
				this.setIconForPluginBtn(btn, plugin.id);
				btn.onClick(() => {
					this.togglePluginForGroup(plugin);
					this.setIconForPluginBtn(btn, plugin.id);
				})

				this.pluginListElements.set(plugin.id, {setting: setting, btn: btn});
			})
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
		this.pluginListElements.forEach(el => el.setting.settingEl.hide());
		this.filteredPlugins.forEach(plugin => this.pluginListElements.get(plugin.id)?.setting.settingEl.show());
	}

	private deselectAllFilteredPlugins() {
		this.filteredPlugins.forEach(plugin => 	this.groupToEdit.removePlugin(plugin));
		this.setAllPluginListBtnIcons();
	}

	private selectAllFilteredPlugins() {
		this.filteredPlugins.forEach(plugin => 	this.groupToEdit.addPlugin(plugin));
		this.setAllPluginListBtnIcons();
	}

	private setAllPluginListBtnIcons() {
		for (const [id, el] of this.pluginListElements) {
			this.setIconForPluginBtn(el.btn, id);
		}
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
