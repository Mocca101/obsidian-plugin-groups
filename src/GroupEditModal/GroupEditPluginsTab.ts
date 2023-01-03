import {ButtonComponent, Setting} from "obsidian";
import {PgPlugin} from "../PgPlugin";
import {PluginGroup} from "../PluginGroup";
import {getAllAvailablePlugins} from "../Utilities";
import ButtonWithDropdown from "./ButtonWithDropdown";

export default class GroupEditPluginsTab {
	containerEl: HTMLElement;

	private readonly availablePlugins: PgPlugin[] = getAllAvailablePlugins();

	private pluginListElements : Map<string, {setting: Setting, btn: ButtonComponent}> = new Map<string, {setting: Setting, btn: ButtonComponent}>();

	private filteredPlugins: PgPlugin[];

	private groupToEdit: PluginGroup;

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

		const pluginList = searchAndList.createEl('div');
		pluginList.addClass('group-edit-modal-plugin-list');

		const filtersAndSelection = new Setting(pluginList);

		new ButtonWithDropdown(filtersAndSelection.settingEl, {label: 'Bulk Select'}, [
			{label: 'Select all', func: () => this.selectAllFilteredPlugins()},
			{label: 'Deselect all',	func: () =>	this.deselectAllFilteredPlugins()},
		])

		this.pluginListElements = new Map<string, {setting: Setting, btn: ButtonComponent}>();

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


	private searchPlugins(search: string) {
		this.filteredPlugins = this.availablePlugins
			.filter(p => p.name.toLowerCase().contains(search.toLowerCase()));
		this.pluginListElements.forEach(el => el.setting.settingEl.hide());
		this.showFilteredPlugins();
	}

	private showFilteredPlugins() {
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
