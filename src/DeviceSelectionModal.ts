import {App, Modal, Notice, Setting} from "obsidian";
import PgMain from "../main";
import GroupSettingsTab from "./GroupSettingsTab";

export default class DeviceSelectionModal extends Modal {

	headerText: string;

	cancelText: string;

	confirmText: string;

	settingsTab: GroupSettingsTab;

	deviceName = '';

	eventTarget: EventTarget = new EventTarget();

	onConfirm: CustomEvent = new CustomEvent('onConfirm', {
		detail: {
			devices: []
		}
	});

	selectedDevices: Set<string> = new Set<string>();

	constructor(app: App, onConfirmSelectionListener: EventListener, selectedDevices?: string[]) {
		super(app);
		this.headerText = 'New device detected please enter a unique name.';
		this.cancelText = 'Cancel';
		this.confirmText = 'Confirm';

		this.selectedDevices = new Set(selectedDevices);

		if(this.selectedDevices?.size > 0) {
			this.onConfirm.detail.devices = Array.from(this.selectedDevices.values());
		}

		this.eventTarget.addEventListener(this.onConfirm.type, onConfirmSelectionListener)
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl('h2', {text: this.headerText});


		contentEl.createEl('h6', {text: 'Existing Devices'});

		PgMain.instance?.settings.devices.forEach(device => {
			new Setting(contentEl)
				.setName(device)
				.addButton(tgl => {
					tgl.setIcon(this.selectedDevices.has(device) ? 'check-circle' : 'circle')
						.onClick(() => {
							if(this.selectedDevices.has(device)) {
								this.selectedDevices.delete(device);
								tgl.setIcon('circle');
							} else {
								this.selectedDevices.add(device);
								tgl.setIcon('check-circle');
							}
						})
				})
		});

		new Setting(contentEl)
			.addButton(btn => {
				btn.setButtonText(this.cancelText);
				btn.onClick(() => this.close());
			})
			.addButton(btn => {
				btn.setButtonText(this.confirmText);
				btn.onClick(() => {
					this.onConfirm.detail.devices = Array.from(this.selectedDevices.values());
					this.eventTarget.dispatchEvent(this.onConfirm)
					this.close();
				})
			})
	}

}
