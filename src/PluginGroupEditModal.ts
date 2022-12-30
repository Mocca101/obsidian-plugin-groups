import {App, Modal, Setting} from "obsidian";
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

	delayElement: Setting;

	pluginSelection: HTMLElement;

	groupSelection: HTMLElement;
	pluginListElements : Map<string, Setting> = new Map<string, Setting>();

	groupListElements : Map<string, Setting> = new Map<string, Setting>();

	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
		this.availablePlugins = getAllAvailablePlugins();

		if(PgMain.instance) {
			this.availableGroups = Array.from(PgMain.instance.settings.groupsMap.values()).filter(g => g.id !== group.id);
		}
		this.groupToEditCache = JSON.stringify(group);
	}

	onOpen() {
		const {modalEl} = this;

		modalEl.empty();

		const contentEl = modalEl.createEl('div', {cls: 'group-edit-modal-content '})

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

		new Setting(contentEl)
			.setName('Auto Add')
			.setDesc('Automatically add new Plugins to this group')
			.addToggle(tgl => {
					tgl.setValue(this.groupToEdit.autoAdd ?? false)
					tgl.onChange(value => this.groupToEdit.autoAdd = value)
				}
			)

		const devicesSetting = new Setting(contentEl)
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

		this.GenerateStartupSettings(contentEl);

		this.GeneratePluginSelectionList(contentEl);

		this.GenerateGroupSelectionList(contentEl);

		this.GenerateFooter(modalEl);
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
		startupParent.createEl('h3', {text: 'Startup'});

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
					this.delayElement.setDesc(value.toString());
				})
			})
			.setDesc(this.groupToEdit.delay.toString());

		ChangeOptionVisibility();
	}

	private GeneratePluginSelectionList(parentElement: HTMLElement) {

		let searchAndList: HTMLElement | undefined = undefined;

		this.pluginSelection = parentElement.createEl('div');

		let showingPlugins = true;

		const headerSetting = new Setting(this.pluginSelection)
			.addButton(btn => {
				btn.setIcon('eye')
				btn.onClick(() => {
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

		this.sortPlugins(this.availablePlugins)
			.forEach(plugin => { const setting = new Setting(pluginList)
					.setName(plugin.name)
				.addButton(btn=> {
					btn.setIcon(this.groupToEdit.plugins.map(p => p.id).contains(plugin.id) ? 'check-circle' : 'circle')
						.onClick(() => {
							this.togglePluginForGroup(plugin);
							btn.setIcon(this.groupToEdit.plugins.map(p => p.id).contains(plugin.id) ? 'check-circle' : 'circle')
						})
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
				btn.onClick(() => {
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

