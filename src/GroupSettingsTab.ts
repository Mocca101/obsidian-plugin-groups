import {App, Notice, PluginSettingTab, Setting, TextComponent} from "obsidian";
import PgMain from "../main";
import PluginGroupEditModal from "./PluginGroupEditModal";
import {generateGroupID} from "./Utilities";
import {PluginGroup} from "./PluginGroup";
import SetDeviceNameModal from "./SetDeviceNameModal";
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

		if(!window.localStorage.getItem(PgMain.deviceNameKey)) {
			new SetDeviceNameModal(app, this).open();
		} else {
			new Notice('Loaded on: ' + window.localStorage.getItem(PgMain.deviceNameKey),5000);
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
				this.groupNameField.setPlaceholder('Enter group name...');
				this.groupNameField.setValue(this.newGroupName);
				this.groupNameField.onChange(val => {
						this.newGroupName = val;
						if (addBtnEl) {
							val.length > 0 ?
								addBtnEl.removeClass('btn-disabled')
								: addBtnEl.addClass('btn-disabled');
						}
					})
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
					btn.onClick(() => {
						group.enable()
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
		contentEl.createEl('h4', {text: 'Devices'});

		new Setting(contentEl)
			.setName('New Device')
			.addButton(btn => {
				btn.setIcon('plus');
				btn.onClick(() => {
					new SetDeviceNameModal(app, this).open();
				})
			})

		PgMain.instance?.settings.devices.forEach(device => {
			if(window.localStorage.getItem(PgMain.deviceNameKey) === device) {
				new Setting(contentEl)
					.setName(device)
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
				new Setting(contentEl)
					.setName(device)
					.addButton(btn => {
						btn.setButtonText('Set as Current');
						btn.onClick(() => {
							window.localStorage.setItem(PgMain.deviceNameKey, device);
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
								this.display();
							}).open());
					})
			}

		});
	}

	ResetCurrentDevice() {
		const device: string | null = window.localStorage.getItem(PgMain.deviceNameKey);

		if(!device) { return ;}
		PgMain.instance?.settings.devices.remove(device);
		window.localStorage.removeItem(PgMain.deviceNameKey);
		this.display();

	}


}
