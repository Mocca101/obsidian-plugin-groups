import {App, Modal, Notice, Setting} from "obsidian";
import PgMain from "../main";
import ConfirmationPopupModal from "./ConfirmationPopupModal";

export default class SetDeviceNameModal extends Modal {

	headerText: string;

	cancelText: string;

	confirmText: string;

	deviceName = '';

	constructor(app: App) {
		super(app);
		this.headerText = 'New device detected please enter a unique name.';
		this.cancelText = 'Cancel';
		this.confirmText = 'Confirm';
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl('h2', {text: this.headerText});


		contentEl.createEl('h6', {text: 'Existing Devices'});

		PgMain.instance?.settings.devices.forEach(device => {
			new Setting(contentEl)
				.setName(device)
				.addButton(btn => {
					btn.setButtonText('Set as Current');
				})
				.addButton(btn => {
					btn.setIcon('trash');
					btn.onClick(() => this.deviceName = device);
				})
		});

		new Setting(contentEl)
			.addText(txt => {
				txt.setPlaceholder('New Device');
				txt.onChange(value => this.deviceName = value);
				txt.setValue(this.deviceName);
			})

		new Setting(contentEl)
			.addButton(btn => {
				btn.setButtonText(this.cancelText);
				btn.onClick(() => this.close());
			})
			.addButton(btn => {
				btn.setButtonText(this.confirmText);
				btn.onClick(() => {
					if(PgMain.instance?.settings.devices.contains(this.deviceName)) {
						new Notice('Name already in use for other device');
						return;
					}
					window.localStorage.setItem(PgMain.deviceNameKey, this.deviceName);
					PgMain.instance?.settings.devices.push(this.deviceName);
					PgMain.instance?.saveSettings();
					this.close();
				})
			})
	}

}
