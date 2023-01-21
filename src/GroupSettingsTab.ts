import {App, ButtonComponent, Notice, PluginSettingTab, Setting, TextComponent} from "obsidian";
import PgMain from "../main";
import GroupEditModal from "./GroupEditModal";
import {generateGroupID, getCurrentlyActiveDevice, groupFromId, setCurrentlyActiveDevice} from "./Utils/Utilities";
import {PluginGroup} from "./DataStructures/PluginGroup";
import ConfirmationPopupModal from "./Components/ConfirmationPopupModal";
import Manager from "./Managers/Manager";
import PluginManager from "./Managers/PluginManager";
import DescriptionsPluginList, {PluginAndDesc} from "./Components/DescriptionsPluginList";

export default class GroupSettingsTab extends PluginSettingTab {

	newGroupName: string;

	groupNameField: TextComponent;

	constructor(app: App, plugin: PgMain) {
		super(app, plugin);
	}

	display(): void {

		PluginManager.loadNewPlugins();

		const {containerEl} = this;

		containerEl.empty();

		this.generateGeneralSettings(containerEl);

		this.generateGroupSettings(containerEl);

		this.GenerateDeviceList(containerEl);

		this.GeneratePluginsList(containerEl);
	}

	private generateGroupSettings(containerEl: HTMLElement) {
		const groupParent = containerEl.createEl('div');
		groupParent.createEl('h5', {text: 'Groups'});

		let addBtnEl: HTMLButtonElement;

		new Setting(groupParent)
			.setName('Add Group')
			.addText(text => {
					this.groupNameField = text;
					this.groupNameField.setPlaceholder('Enter group name...')
						.setValue(this.newGroupName)
						.onChange(val => {
							this.newGroupName = val;
							if (addBtnEl) {
								val.replace(' ', '').length > 0 ?
									addBtnEl.removeClass('btn-disabled')
									: addBtnEl.addClass('btn-disabled');
							}
						})
						.inputEl.onkeydown = async e => {
						if (e.key === 'Enter') {
							await this.addNewGroup()
						}
					};
				}
			)
			.addButton(btn => {
					btn
						.setIcon('plus')
						.onClick(() => this.addNewGroup());
					addBtnEl = btn.buttonEl;
					addBtnEl.addClass('btn-disabled');
				}
			)

		this.GenerateGroupList(groupParent);
	}

	private generateGeneralSettings(containerEl: HTMLElement) {
		const generalParent = containerEl.createEl('h4', {text: 'General'});

		new Setting(generalParent)
			.setName('Generate Commands for Groups')
			.addToggle(tgl => {
				tgl.setValue(Manager.getInstance().generateCommands ?? false);
				tgl.onChange(async value => {
					Manager.getInstance().shouldGenerateCommands = value;
					await Manager.getInstance().saveSettings();
				});
			})

		new Setting(generalParent)
			.setName('Notice upon un-/loading groups')
			.addDropdown(drp => {
				drp.addOption('none', 'None')
					.addOption('short', 'Short')
					.addOption('normal', 'Normal');
				drp.setValue(Manager.getInstance().showNoticeOnGroupLoad ?? 'none');
				drp.onChange(async value => {
					Manager.getInstance().showNoticeOnGroupLoad = value;
					await Manager.getInstance().saveSettings();

				});
			});

		new Setting(generalParent)
			.setName('Log Startup time')
			.addToggle(tgl => {
				tgl.setValue(Manager.getInstance().logDetailedTime);
				tgl.onChange(async value => {
					Manager.getInstance().logDetailedTime = value;
					await Manager.getInstance().saveSettings();
				})
			})
	}

	GenerateGroupList(groupParent: HTMLElement) {
		Manager.getInstance().groupsMap.forEach(group => {
			const groupSetting = new Setting(groupParent)
				.setName(group.name)
				.addButton(btn => {
					btn.setButtonText('Enable');
					btn.setIcon('power');
					btn.onClick(async () => {
						await group.enable();
					});
					group.groupActive() ? btn.buttonEl.removeClass('btn-disabled') : btn.buttonEl.addClass('btn-disabled');
				})
				.addButton(btn => {
					btn.setButtonText('Disable');
					btn.setIcon('power-off');
					btn.onClick(() => group.disable());
					group.groupActive() ? btn.buttonEl.removeClass('btn-disabled') : btn.buttonEl.addClass('btn-disabled');
				})
				.addButton(btn => {
					btn.setIcon('pencil')
					btn.onClick(() => this.editGroup(group))
				});
			if(group.loadAtStartup) {
				const descFrag = new DocumentFragment();
				const startupEl = descFrag
					.createEl('span');
				startupEl
					.createEl('b', {
						text: 'Startup: ',
						})
				startupEl
					.createEl('span',{text: 'Delayed by ' + group.delay + ' seconds'});

				if(!group.groupActive()) {
					const activeEl = descFrag.createEl('span')
					activeEl.createEl('br');
					activeEl.createEl('b', {text: 'Inactive: '});
					activeEl.createEl('span', {text: 'Not enabled for current Device'});
				}

				groupSetting.setDesc(descFrag);
			}
		});
	}

	async addNewGroup() {
		const id = generateGroupID(this.newGroupName);

		if(!id) {
			console.error('Failed to create Group, please choose a different Name as there have been to many groups with the same name')
			return;
		}

		const newGroup = new PluginGroup({
			id: id,
			name: this.newGroupName
		});
		new GroupEditModal(this.app, this, newGroup).open();
		this.newGroupName = '';
		if(this.groupNameField) {
			this.groupNameField.setValue('');
		}
	}

	editGroup(group: PluginGroup) {
		new GroupEditModal(this.app, this, group).open();
	}

	GenerateDeviceList(contentEl: HTMLElement) {
		let newDeviceName = '';
		const CreateNewDevice = async () => {
			if(!newDeviceName || newDeviceName.replace(' ', '') === '') {return;}

			if(Manager.getInstance().devices.contains(newDeviceName)) {
				new Notice('Name already in use for other device');
				return;
			}

			Manager.getInstance().devices.push(newDeviceName);
			await Manager.getInstance().saveSettings();

			if(!getCurrentlyActiveDevice()) { setCurrentlyActiveDevice(newDeviceName); }

			this.display();

			newDeviceName = '';
			newDevNameText.setValue(newDeviceName);
		};


		contentEl.createEl('h4', {text: 'Devices'});


		let deviceAddBtn: ButtonComponent;

		const deviceNameSetting = new Setting(contentEl).setName('New Device');

		const newDevNameText = new TextComponent(deviceNameSetting.controlEl);
		newDevNameText
			.setValue(newDeviceName)
			.onChange(value => {
				newDeviceName = value;
				if (deviceAddBtn) {
					value.replace(' ', '').length > 0 ?
						deviceAddBtn.buttonEl.removeClass('btn-disabled')
						: deviceAddBtn.buttonEl.addClass('btn-disabled');
				}
			})
			.setPlaceholder('Device Name')
			.inputEl.onkeydown = async e => {
				if(e.key === 'Enter') {await CreateNewDevice(); }
			};


		deviceNameSetting
			.addButton(btn => {
				deviceAddBtn = btn;
				deviceAddBtn
					.setIcon('plus')
					.onClick(async () => {
					await CreateNewDevice();
					})
					.buttonEl.addClass('btn-disabled');
			})

		Manager.getInstance().devices.forEach(device => {
			const deviceSetting = new Setting(contentEl)
				.setName(device);
			if(getCurrentlyActiveDevice() === device) {
				deviceSetting
					.setDesc('Current Device')
					.addButton(btn => {
						btn.setIcon('trash');
						btn.onClick(() => new ConfirmationPopupModal(this.app,
							'This is the currently active device, are you sure?',
							void 0,
							'Delete',
							() => {
								this.ResetCurrentDevice();
							}).open());
					})
			} else {
				deviceSetting
					.addButton(btn => {
						btn.setButtonText('Set as Current');
						btn.onClick(() => {
							setCurrentlyActiveDevice(device);
							this.display();
						});
					})
					.addButton(btn => {
						btn.setIcon('trash');
						btn.onClick(() => new ConfirmationPopupModal(this.app,
							'You are about to delete: ' + device,
							void 0,
							'Delete',
							async () => {
								Manager.getInstance().devices.remove(device);
								await Manager.getInstance().saveSettings();
								this.display();
							}).open());
					})
			}

		});
	}

	ResetCurrentDevice() {
		const device: string | null = getCurrentlyActiveDevice();

		if(!device) { return ;}
		Manager.getInstance().devices.remove(device);
		setCurrentlyActiveDevice(null);
		this.display();

	}

	GeneratePluginsList(contentEl: HTMLElement) {
		contentEl.createEl('h4', {text: 'Plugins'});

		const pluginsAndParentGroups : PluginAndDesc[] = PluginManager.getAllAvailablePlugins()
			.map(plugin => {
				let description: string | undefined;
				const groups = Manager.getInstance().getGroupsOfPlugin(plugin.id);

				return {
					plugin: plugin,
					description: groups.map(group => group.name).join(', ')
				}
			})

		new DescriptionsPluginList(contentEl, pluginsAndParentGroups)

	}


}
