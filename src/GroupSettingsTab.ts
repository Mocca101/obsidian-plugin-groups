import {App, ButtonComponent, Notice, PluginSettingTab, Setting, TextComponent} from "obsidian";
import PgMain from "../main";
import PluginGroupEditModal from "./PluginGroupEditModal";
import {generateGroupID} from "./Utilities";
import {PluginGroup} from "./PluginGroup";
import DeviceSelectionModal from "./DeviceSelectionModal";
import ConfirmationPopupModal from "./ConfirmationPopupModal";

export default class GroupSettingsTab extends PluginSettingTab {

	newGroupName: string;

	groupNameField: TextComponent;

	constructor(app: App, plugin: PgMain) {
		super(app, plugin);
	}

	display(): void {

		const {containerEl} = this;

		containerEl.empty();

		// @ts-ignore
		if(app.loadLocalStorage(PgMain.deviceNameKey) && PgMain.instance?.settings.showNoticeOnGroupLoad) {
			// @ts-ignore
			new Notice('Loaded on following device: ' + app.loadLocalStorage(PgMain.deviceNameKey),5000);
		}

		const generalParent = containerEl.createEl('h4', {text: 'General'});

		new Setting(generalParent)
			.setName('Generate Commands for Groups')
			.addToggle(tgl => {
				tgl.setValue(PgMain.instance?.settings.generateCommands ?? false);
				tgl.onChange(async value => {
					if(!PgMain.instance) {return;}
					PgMain.instance.settings.generateCommands = value;
					await PgMain.instance.saveSettings();
				});
			})

		new Setting(generalParent)
			.setName('Show Notice upon un-/loading groups')
			.addToggle(tgl => {
				tgl.setValue(PgMain.instance?.settings.showNoticeOnGroupLoad ?? false);
				tgl.onChange(async value => {
					if(!PgMain.instance) {return;}
					PgMain.instance.settings.showNoticeOnGroupLoad = value;
					await PgMain.instance.saveSettings();
				});
			})

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
						if(e.key === 'Enter') { await this.addNewGroup() }
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

		this.GenerateDeviceList(containerEl);
	}

	GenerateGroupList(groupParent: HTMLElement) {
		PgMain.instance?.settings.groupsMap.forEach(group => {
			const groupSetting = new Setting(groupParent)
				.setName(group.name)
				.addButton(btn => {
					btn.setButtonText('Enable All');
					btn.setIcon('power');
					btn.onClick(async () => {
						await group.enable();
					});
				})
				.addButton(btn => {
					btn.setButtonText('Disable All');
					btn.setIcon('power-off');
					btn.onClick(() => group.disable());
				})
				.addButton(btn => {
					btn.setIcon('pencil')
					btn.onClick(() => this.editGroup(group))
				});
			if(group.enableAtStartup) {
				groupSetting.setDesc('Load plugins delayed by ' + group.delay + ' seconds');
			}
		});
	}

	async addNewGroup() {
		const id = generateGroupID(this.newGroupName,{ map: PgMain.instance?.settings.groupsMap});

		if(!id) {
			console.error('Failed to create Group, please choose a different Name as there have been to many groups with the same name')
			return;
		}

		const newGroup = new PluginGroup({
			id: id,
			name: this.newGroupName
		});
		new PluginGroupEditModal(this.app, this, newGroup).open();
		this.newGroupName = '';
		if(this.groupNameField) {
			this.groupNameField.setValue('');
		}
	}

	editGroup(group: PluginGroup) {
		new PluginGroupEditModal(this.app, this, group).open();
	}

	GenerateDeviceList(contentEl: HTMLElement) {
		let newDeviceName = '';
		const CreateNewDevice = () => {
			if(!newDeviceName || newDeviceName.replace(' ', '') === '') {return;}

			if(PgMain.instance?.settings.devices.contains(newDeviceName)) {
				new Notice('Name already in use for other device');
				return;
			}

			PgMain.instance?.settings.devices.push(newDeviceName);
			PgMain.instance?.saveSettings();

			// @ts-ignore
			if(!app.loadLocalStorage(PgMain.deviceNameKey)) { app.saveLocalStorage(PgMain.deviceNameKey, newDeviceName); }

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
			.inputEl.onkeydown = e => {
				if(e.key === 'Enter') { CreateNewDevice(); }
			};


		deviceNameSetting
			.addButton(btn => {
				deviceAddBtn = btn;
				deviceAddBtn
					.setIcon('plus')
					.onClick(() => {
					CreateNewDevice();
					})
					.buttonEl.addClass('btn-disabled');
			})

		PgMain.instance?.settings.devices.forEach(device => {
			const devSetting = new Setting(contentEl)
				.setName(device);
			// @ts-ignore
			if(app.loadLocalStorage(PgMain.deviceNameKey) === device) {
				devSetting
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
				devSetting
					.addButton(btn => {
						btn.setButtonText('Set as Current');
						btn.onClick(() => {
							// @ts-ignore
							app.saveLocalStorage(PgMain.deviceNameKey, device);
							this.display();
						});
					})
					.addButton(btn => {
						btn.setIcon('trash');
						btn.onClick(() => new ConfirmationPopupModal(this.app,
							'You are about to delete: ' + device,
							void 0,
							'Delete',
							() => {
								PgMain.instance?.settings.devices.remove(device);
								PgMain.instance?.saveSettings();
								this.display();
							}).open());
					})
			}

		});
	}

	ResetCurrentDevice() {
		// @ts-ignore
		const device: string | null = app.loadLocalStorage(PgMain.deviceNameKey);

		if(!device) { return ;}
		PgMain.instance?.settings.devices.remove(device);
		// @ts-ignore
		app.saveLocalStorage(PgMain.deviceNameKey, null);
		this.display();

	}


}
