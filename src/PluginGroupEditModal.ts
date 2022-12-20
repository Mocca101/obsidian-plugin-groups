import {App, Modal, Setting} from "obsidian";
import GroupSettingsTab from "./GroupSettingsTab";
import {getAllAvailablePlugins} from "./Utilities";
import ConfirmationPopupModal from "./ConfirmationPopupModal";
import PluginGroupsMain from "../main";
import {PluginGroup} from "./PluginGroup";
import {PgPlugin} from "./PgPlugin";

export default class PluginGroupEditModal extends Modal {

	groupToEdit: PluginGroup;

	groupToEditCache: string;
	discardChanges = true;

	settingsTab: GroupSettingsTab;

	plugin: PluginGroupsMain;

	availablePlugins: PgPlugin[];

	availableGroups: PluginGroup[];

	delayElement: Setting;

	pluginSelection: HTMLElement;

	groupSelection: HTMLElement;
	pluginListElements : Map<string, Setting> = new Map<string, Setting>();

	groupListElements : Map<string, Setting> = new Map<string, Setting>();



	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
		this.plugin = settingsTab.plugin;
		this.availablePlugins = getAllAvailablePlugins();
		this.availableGroups = Array.from(this.plugin.settings.groupsMap.values()).filter(g => g.id !== group.id);
		this.groupToEditCache = JSON.stringify(group);
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl('h2', {text: 'Edit Group'});

		new Setting(contentEl)
			.setName('Name')
			.addText(txt => {
				txt.setValue(this.groupToEdit.name)
				txt.onChange(val => this.groupToEdit.name = val);
			})

		new Setting(contentEl)
			.setName('Commands')
			.setDesc('Add Commands to enable/disable this group')
			.addToggle(tgl => {
					tgl.setValue(this.groupToEdit.generateCommands)
					tgl.onChange(value => this.groupToEdit.generateCommands = value)
				}
			)

		this.GenerateStartupSettings(contentEl);

		this.GeneratePluginSelectionList(contentEl);

		this.GenerateGroupSelectionList(contentEl);

		this.GenerateFooter(contentEl);
	}


	private GenerateStartupSettings(contentEl: HTMLElement) {

		const startupParent = contentEl.createEl('div');
		startupParent.createEl('h3', {text: 'Startup'});

		new Setting(startupParent)
			.setName('Enable on Startup')
			.addToggle(tgl => {
				tgl.onChange(value => {
					this.groupToEdit.enableAtStartup = value;
					if (this.delayElement) {
						value ? this.delayElement.settingEl.show() : this.delayElement.settingEl.hide();
					}
				});
				tgl.setValue(this.groupToEdit.enableAtStartup);
			});

		this.delayElement = new Setting(startupParent)
			.setName('Delay')
			.addSlider(slider => {
				slider.setValue(this.groupToEdit.delay);
				slider.setLimits(0, PluginGroupsMain.disableStartupTimeout, 1)
				slider.onChange(value => {
					this.groupToEdit.delay = value;
					this.delayElement.setDesc(value.toString());
				})
			})
			.setDesc(this.groupToEdit.delay.toString());

		if(!this.groupToEdit.enableAtStartup) {
			this.delayElement.settingEl.hide();
		}
	}

	private GeneratePluginSelectionList(parentElement: HTMLElement) {

		let searchAndList: HTMLElement | undefined = undefined;

		this.pluginSelection = parentElement.createEl('div');

		let showingPlugins = true;

		const headerSetting = new Setting(this.pluginSelection)
			.addButton(btn => {
				btn.setIcon('eye')
				btn.onClick(e => {
					if(!searchAndList) { return; }
					if (showingPlugins) {
						btn.setIcon('eye-off');
						searchAndList.hide();
						showingPlugins = false;
					} else {
						btn.setIcon('eye');
						searchAndList.show();
						showingPlugins = true;
					}
				});
			});
		headerSetting.nameEl.createEl('h4', {text: 'Plugins'});

		searchAndList = this.pluginSelection.createEl('div');

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

		this.pluginListElements = new Map<string, Setting>();

		const includedPluginNames = (this.groupToEdit.plugins).map(p => p.name)

		this.sortPlugins(this.availablePlugins)
			.forEach(plugin => { const setting = new Setting(pluginList)
					.setName(plugin.name)
					.addToggle(tgl => {
						tgl.setValue(includedPluginNames.contains(plugin.name));
						tgl.onChange(doInclude => {
							this.togglePluginForGroup(plugin, doInclude);
						});
					});

				this.pluginListElements.set(plugin.id, setting);
		})
	}

	private GenerateGroupSelectionList(parentElement: HTMLElement) {

		let searchAndList: HTMLElement | undefined = undefined;

		this.groupSelection = parentElement.createEl('div');

		let showGroups = true;

		const headerSetting = new Setting(this.groupSelection)
			.addButton(btn => {
				btn.setIcon('eye')
				btn.onClick(e => {
					if(!searchAndList) { return; }
					if (showGroups) {
						btn.setIcon('eye-off');
						searchAndList.hide();
						showGroups = false;
					} else {
						btn.setIcon('eye');
						searchAndList.show();
						showGroups = true;
					}
				});
			});
		headerSetting.nameEl.createEl('h4', {text: 'Groups'});

		searchAndList = this.groupSelection.createEl('div');

		new Setting(searchAndList)
			.setName('Search')
			.addText(txt => {
				txt.setPlaceholder('Search for Groups...')
				txt.onChange(search => {
					this.searchGroups(search);
				})
			})

		const groupList = searchAndList.createEl('div');
		groupList.addClass('group-edit-modal-plugin-list');

		this.groupListElements = new Map<string, Setting>();

		const includedGroupNames = this.groupToEdit.pluginGroups.map(p => p.name);

		this.sortGroups(this.availableGroups)
			.forEach(pluginGroup => { const setting = new Setting(groupList)
				.setName(pluginGroup.name)
				.addToggle(tgl => {
					let included = includedGroupNames.contains(pluginGroup.name);
					let changeLock = false; // Used to prevent endless loop from resetting the tgl value in the onChange Function
					tgl.setValue(included);
					tgl.onChange(doInclude => {
						if(changeLock) { return; }
						changeLock = true;
						included = this.toggleGroupForGroup(pluginGroup, !included) ? !included : included;
						tgl.setValue(included);
						changeLock = false;
					});
				});
				this.groupListElements.set(pluginGroup.id, setting);
			})
	}


	private searchPlugins(search: string) {
		const hits = this.availablePlugins
			.filter(p => p.name.toLowerCase().contains(search.toLowerCase()))
			.map(p => p.id);
		this.pluginListElements.forEach(plugin => plugin.settingEl.hide());
		hits.forEach(id => this.pluginListElements.get(id)?.settingEl.show());
	}

	private searchGroups(search: string) {
		const hits = this.availableGroups
			.filter(p => p.name.toLowerCase().contains(search.toLowerCase()))
			.map(p => p.id);
		this.groupListElements.forEach(group => group.settingEl.hide());
		hits.forEach(id => this.groupListElements.get(id)?.settingEl.show());
	}

	private GenerateFooter(parentElement: HTMLElement) {
		const footer = parentElement.createEl('div');

		footer.addClass('group-edit-modal-footer');

		new Setting(footer)
			.addButton(btn => {
				btn.setButtonText('Delete');
				btn.onClick(() => new ConfirmationPopupModal(this.app,
					'You are about to delete: ' + this.groupToEdit.name,
					void 0,
					'Delete',
					() => this.deleteGroup()).open());
			})
			.addButton(btn => {
				btn.setButtonText('Cancel');
				btn.onClick(() => this.close());
			})
			.addButton(btn => {
				btn.setButtonText('Save');
				btn.onClick(() => this.saveChanges());
			})
			.settingEl.addClass('modal-footer');
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

	sortGroups(groups: PluginGroup[]) : PluginGroup[] {
		return groups.sort((a, b) => {
			const aInGroup = this.isGroupInGroup(a);
			const bInGroup = this.isGroupInGroup(b);
			if(aInGroup && !bInGroup) return -1;
			else if(!aInGroup && bInGroup) return 1;
			else {
				return a.name.localeCompare(b.name);
			}
		})
	}

	isGroupInGroup(plugin: PluginGroup) :boolean {
		return this.groupToEdit.plugins.map(p => p.id).contains(plugin.id);
	}

	togglePluginForGroup(plugin: PgPlugin, doInclude: boolean) {
		if(doInclude) {
			this.groupToEdit.addPgComponent(plugin);
		} else {
			this.groupToEdit.removePgComponent(plugin);
		}
	}

	toggleGroupForGroup(group: PluginGroup, doInclude: boolean) {
		if(doInclude) {
			return this.groupToEdit.addPgComponent(group);
		} else {
			return this.groupToEdit.removePgComponent(group);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();

		if(this.plugin.settings.groupsMap.has(this.groupToEdit.id) && this.discardChanges){
			Object.assign(
				this.groupToEdit,
				JSON.parse(this.groupToEditCache))
		}

	}

	async saveChanges() {
		this.discardChanges = false;
		if(this.plugin.settings.groupsMap.has(this.groupToEdit.id)) {
			await this.editGroup(this.groupToEdit);
		} else {
			await this.addGroup(this.groupToEdit)
		}
	}

	async addGroup(group: PluginGroup) {
		this.plugin.settings.groupsMap.set(group.id, group);

		this.plugin.AddGroupCommands(group);

		await this.persistChangesAndClose();
	}

	async editGroup(group: PluginGroup) {
		this.plugin.settings.groupsMap.set(group.id, group);
		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		await this.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}


	async deleteGroup() {
		this.plugin.settings.groupsMap.delete(this.groupToEdit.id);
		await this.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}
}

