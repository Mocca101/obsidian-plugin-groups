import {App, ButtonComponent, Modal, Setting} from "obsidian";
import GroupSettingsTab from "./GroupSettingsTab";
import {generateGroupID, getAllAvailablePlugins} from "./Utilities";
import ConfirmationPopupModal from "./ConfirmationPopupModal";
import PgMain from "../main";
import {PluginGroup} from "./PluginGroup";
import {PgPlugin} from "./PgPlugin";
import DeviceSelectionModal from "./DeviceSelectionModal";

export default class PluginGroupEditModal extends Modal {

	groupToEdit: PluginGroup;

	groupToEditCache: string;
	discardChanges = true;

	settingsTab: GroupSettingsTab;

	availablePlugins: PgPlugin[];

	availableGroups: PluginGroup[];

	pluginListElements : Map<string, {setting: Setting, btn: ButtonComponent}> = new Map<string, {setting: Setting, btn: ButtonComponent}>();

	filteredPlugins: PgPlugin[];

	groupListElements : Map<string, Setting> = new Map<string, Setting>();

	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
		this.availablePlugins = getAllAvailablePlugins();
		this.filteredPlugins = this.availablePlugins;

		if(PgMain.instance) {
			this.availableGroups = Array.from(PgMain.instance.settings.groupsMap.values()).filter(g => g.id !== group.id);
		}
		this.groupToEditCache = JSON.stringify(group);
	}

	onOpen() {
		const {modalEl} = this;

		modalEl.empty();

		const contentEl = modalEl.createEl('div', {cls: 'group-edit-modal-content '})
		// eslint-disable-next-line prefer-const
		let generalSettings: HTMLElement;
		// eslint-disable-next-line prefer-const
		let pluginsSection: HTMLElement;
		// eslint-disable-next-line prefer-const
		let groupsSection: HTMLElement;

		const nameSettingNameEl = new Setting(contentEl)
			.addText(txt => {
				txt.setValue(this.groupToEdit.name)
				txt.onChange(val => {
					this.groupToEdit.name = val;
					nameSettingNameEl.setText("Editing \"" + this.groupToEdit.name + "\"")
				});
			}).nameEl.createEl("h2", {text: "Editing \"" + this.groupToEdit.name + "\""})

		const tabContainer = contentEl.createDiv({cls: "pg-tabs"});

		const generalTab = tabContainer.createDiv({cls: "pg-tab is-active"});
			generalTab.createSpan({text: "General"});
		const pluginsTab = tabContainer.createDiv({cls: "pg-tab"});
			pluginsTab.createSpan({text: "Plugins"});
		const groupsTab = tabContainer.createDiv({cls: "pg-tab"});
			groupsTab.createSpan({text: "Groups"});

		const switchActive = (clicked: string) => {
			generalTab.removeClass("is-active");
			pluginsTab.removeClass("is-active");
			groupsTab.removeClass("is-active");

			generalSettings?.removeClass("is-active");
			pluginsSection?.removeClass("is-active");
			groupsSection?.removeClass("is-active");
			switch (clicked) {
				case "Plugins":
					pluginsSection?.addClass("is-active");
					pluginsTab?.addClass("is-active");
					break;
				case "Groups":
					groupsSection?.addClass("is-active");
					groupsTab.addClass("is-active");
					break;
				default:
					generalSettings?.addClass("is-active");
					generalTab.addClass("is-active");
					break;
			}
		}

		generalTab.onClickEvent(() => switchActive("General"));
		pluginsTab.onClickEvent(() =>  switchActive("Plugins"));
		groupsTab.onClickEvent(() => switchActive("Groups"));


		generalSettings = this.generateGeneralSettingsSection(contentEl);

		pluginsSection = this.generatePluginSection(contentEl);

		groupsSection = this.generateGroupsSection(contentEl);

		this.generateFooter(modalEl);
	}

	private generateGeneralSettingsSection(contentEl: HTMLDivElement) : HTMLElement {
		const generalSettingsSection = contentEl.createDiv({cls:"pg-tabbed-content is-active"})

		generalSettingsSection.createEl("h5", {text: "General"})

		new Setting(generalSettingsSection)
			.setName('Commands')
			.setDesc('Add Commands to enable/disable this group')
			.addToggle(tgl => {
					tgl.setValue(this.groupToEdit.generateCommands)
					tgl.onChange(value => this.groupToEdit.generateCommands = value)
				}
			)

		new Setting(generalSettingsSection)
			.setName('Auto Add')
			.setDesc('Automatically add new Plugins to this group')
			.addToggle(tgl => {
					tgl.setValue(this.groupToEdit.autoAdd ?? false)
					tgl.onChange(value => this.groupToEdit.autoAdd = value)
				}
			)

		const devicesSetting = new Setting(generalSettingsSection)
			.setName('Devices')
			.setDesc(this.getDevicesDescription())
			.addButton(btn => {
				btn.setIcon('pencil')
					.onClick(() => {
						new DeviceSelectionModal(app, (evt: CustomEvent) => {
							this.groupToEdit.assignedDevices = evt.detail.devices;
							devicesSetting.setDesc(this.getDevicesDescription());
						}, this.groupToEdit.assignedDevices).open();
					})
			})

		this.GenerateStartupSettings(generalSettingsSection);

		return generalSettingsSection;
	}

	getDevicesDescription () {
		let description = 'Active on All devices';

		if(!this.groupToEdit.assignedDevices) {return description;}
		const arr : string[] = this.groupToEdit.assignedDevices.filter(device => PgMain.instance?.settings.devices.contains(device));
		if(arr?.length > 0) {
			description = 'Active on: ' + arr.reduce((acc, curr, i, arr) => {
				if (i < 3) {
					return acc + ', ' + curr;
				} else if (i === arr.length - 1) {
					return acc + ', ... and ' + (i - 2) + ' other' + (i - 2 > 1 ? 's' : '');
				}
				return acc;
			})
		}
		return description;
	}

	private GenerateStartupSettings(contentEl: HTMLElement) {

		const startupParent = contentEl.createEl('div');
		startupParent.createEl('h6', {text: 'Startup'});

		// eslint-disable-next-line prefer-const
		let delaySetting: Setting;

		// eslint-disable-next-line prefer-const
		let behaviourElement: HTMLElement;

		const ChangeOptionVisibility = () => {
			if(delaySetting) {
				this.groupToEdit.loadAtStartup ? delaySetting.settingEl.show() : delaySetting.settingEl.hide();
			}
			if(behaviourElement) {
				this.groupToEdit.loadAtStartup ? behaviourElement.show() : behaviourElement.hide();
			}
		}


		new Setting(startupParent)
			.setName('Load on Startup')
			.addDropdown(drp => {
				behaviourElement = drp.selectEl;
				drp.addOption('enable', 'Enable');
				drp.addOption('disable', 'Disable');
				drp.setValue(this.groupToEdit.disableOnStartup ? 'disable' : 'enable');
				drp.onChange(value => {
					value === 'disable'
						? this.groupToEdit.disableOnStartup = true
						: this.groupToEdit.disableOnStartup = false;
				})
			})
			.addToggle(tgl => {
				tgl.onChange(value => {
					this.groupToEdit.loadAtStartup = value;
					ChangeOptionVisibility();
				});
				tgl.setValue(this.groupToEdit.loadAtStartup);
			});

		delaySetting = new Setting(startupParent)
			.setName('Delay')
			.addSlider(slider => {
				slider.setValue(this.groupToEdit.delay);
				slider.setLimits(0, PgMain.disableStartupTimeout, 1)
				slider.onChange(value => {
					this.groupToEdit.delay = value;
					delaySetting.setDesc(value.toString());
				})
			})
			.setDesc(this.groupToEdit.delay.toString());

		ChangeOptionVisibility();
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

		new Setting(pluginList).addButton(btn => {
			btn.setIcon('circle');
			btn.setTooltip('Deselect all');
			btn.onClick(() => {
				this.deselectAllFilteredPlugins();
			})
		})
			.addButton(btn => {
				btn.setIcon('check-circle');
				btn.setTooltip('Select all');
				btn.onClick(() => {
					this.selectAllFilteredPlugins();
				})
			})

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

	private generateGroupsSection(parentElement: HTMLElement) : HTMLElement {

		const groupSection :HTMLElement = parentElement.createDiv({cls:"pg-tabbed-content"});

		groupSection.createEl("h5", {text: "Groups"});

		const searchAndList: HTMLElement = groupSection.createEl('div');

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

		this.sortGroups(this.availableGroups)
			.forEach(pluginGroup => { const setting = new Setting(groupList)
				.setName(pluginGroup.name)
				.addButton(btn=> {
					btn.setIcon(this.groupToEdit.groupIds.contains(pluginGroup.id) ? 'check-circle' : 'circle')
						.onClick(() => {
							this.toggleGroupForGroup(pluginGroup) ;
							btn.setIcon(this.groupToEdit.groupIds.contains(pluginGroup.id) ? 'check-circle' : 'circle');
						})
				});
				this.groupListElements.set(pluginGroup.id, setting);
			})
		return groupSection;
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

	private searchGroups(search: string) {
		const hits = this.availableGroups
			.filter(p => p.name.toLowerCase().contains(search.toLowerCase()))
			.map(p => p.id);
		this.groupListElements.forEach(group => group.settingEl.hide());
		hits.forEach(id => this.groupListElements.get(id)?.settingEl.show());
	}

	private generateFooter(parentElement: HTMLElement) {
		const footer = parentElement.createEl('div');

		footer.addClass('group-edit-modal-footer');

		new Setting(footer)
			.addButton(btn => {
				btn.setButtonText('Delete');
				btn.onClick(() =>
					new ConfirmationPopupModal(this.app,
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
			.addExtraButton(btn => {
				btn.setIcon('copy')
					.setTooltip('Duplicate this group')
					.onClick(() => this.duplicate());
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

	togglePluginForGroup(plugin: PgPlugin) {
		if(this.groupToEdit.plugins.map(p => p.id).contains(plugin.id)) {
			this.groupToEdit.removePlugin(plugin);
		} else {
			this.groupToEdit.addPlugin(plugin);
		}
	}

	toggleGroupForGroup(group: PluginGroup) {
		if(this.groupToEdit.groupIds.contains(group.id)) {
			return this.groupToEdit.removeGroup(group);
		} else {
			return this.groupToEdit.addGroup(group);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();

		if(PgMain.instance?.settings.groupsMap.has(this.groupToEdit.id) && this.discardChanges){
			Object.assign(
				this.groupToEdit,
				JSON.parse(this.groupToEditCache))
		}

	}

	async saveChanges() {
		this.discardChanges = false;
		if(PgMain.instance?.settings.groupsMap.has(this.groupToEdit.id)) {
			await this.editGroup(this.groupToEdit);
		} else {
			await this.addGroup(this.groupToEdit)
		}
	}

	async duplicate() {
		const duplicateGroup = new PluginGroup(this.groupToEdit);
		const groupMap = PgMain.instance?.settings.groupsMap;

		if(!groupMap) { return; }
		duplicateGroup.name += '-Duplicate';
		const genId = generateGroupID(duplicateGroup.name);

		if(!genId) { return; }
		duplicateGroup.id = genId;

		await this.addGroup(duplicateGroup)
	}

	async addGroup(group: PluginGroup) {
		PgMain.instance?.settings.groupsMap.set(group.id, group);

		PgMain.instance?.AddGroupCommands(group.id);

		await this.persistChangesAndClose();
	}

	async editGroup(group: PluginGroup) {
		PgMain.instance?.settings.groupsMap.set(group.id, group);
		PgMain.instance?.updateCommand(group.id);
		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		await PgMain.instance?.saveSettings();
		this.settingsTab.display();
		this.close();
	}

	async deleteGroup() {
		PgMain.instance?.settings.groupsMap.delete(this.groupToEdit.id);
		await PgMain.instance?.saveSettings();
		this.settingsTab.display();
		this.close();
	}
}

