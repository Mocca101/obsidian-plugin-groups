import ConfirmationPopupModal from "@/Components/BaseComponents/ConfirmationPopupModal";
import AdvancedSettings from "@/Components/Settings/AdvancedSettings";
import GroupSettings from "@/Components/Settings/GroupSettings";
import PluginSettings from "@/Components/Settings/PluginsSettings";
import Manager from "@/Managers/Manager";
import PluginManager from "@/Managers/PluginManager";
import {
	getCurrentlyActiveDevice,
	makeCollapsible,
	setCurrentlyActiveDevice,
} from "@/Utils/Utilities";
import type PgMain from "@/main";
import {
	type App,
	type ButtonComponent,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";

import MainSettings from "@/Components/Settings/main-settings.svelte"

export default class PluginGroupSettings extends PluginSettingTab {
	async display(): Promise<void> {
		await PluginManager.loadNewPlugins();

		const { containerEl } = this;

		containerEl.empty();

		const target = containerEl.createDiv();

		const svelteBaseComponent = new MainSettings({target})
		

		new GroupSettings(containerEl, {
			collapsible: true,
			startOpened: true,
		});

		this.GenerateDeviceList(containerEl);

		new PluginSettings(containerEl, { collapsible: true });

		new AdvancedSettings(containerEl, { collapsible: true });
	}


	GenerateDeviceList(contentEl: HTMLElement) {
		let newDeviceName = "";
		const CreateNewDevice = async () => {
			if (!newDeviceName || newDeviceName.replace(" ", "") === "") {
				return;
			}

			if (Manager.getInstance().devices.contains(newDeviceName)) {
				new Notice("Name already in use for other device");
				return;
			}

			Manager.getInstance().devices.push(newDeviceName);
			await Manager.getInstance().saveSettings();

			if (!getCurrentlyActiveDevice()) {
				setCurrentlyActiveDevice(newDeviceName);
			}

			this.display();

			newDeviceName = "";
			newDevNameText.setValue(newDeviceName);
		};

		const header = contentEl.createEl("h4", { text: "Devices" });

		const content = contentEl.createDiv();

		makeCollapsible(header, content);

		let deviceAddBtn: ButtonComponent;

		const deviceNameSetting = new Setting(content).setName("New Device");

		const newDevNameText = new TextComponent(deviceNameSetting.controlEl);
		newDevNameText
			.setValue(newDeviceName)
			.onChange((value) => {
				newDeviceName = value;
				if (deviceAddBtn) {
					value.replace(" ", "").length > 0
						? deviceAddBtn.buttonEl.removeClass("btn-disabled")
						: deviceAddBtn.buttonEl.addClass("btn-disabled");
				}
			})
			.setPlaceholder("Device Name").inputEl.onkeydown = async (e) => {
			if (e.key === "Enter") {
				await CreateNewDevice();
			}
		};

		deviceNameSetting.addButton((btn) => {
			deviceAddBtn = btn;
			deviceAddBtn
				.setIcon("plus")
				.onClick(async () => {
					await CreateNewDevice();
				})
				.buttonEl.addClass("btn-disabled");
		});

		Manager.getInstance().devices.forEach((device) => {
			const deviceSetting = new Setting(content).setName(device);
			if (getCurrentlyActiveDevice() === device) {
				deviceSetting.setDesc("Current Device").addButton((btn) => {
					btn.setIcon("trash");
					btn.onClick(() =>
						new ConfirmationPopupModal(
							this.app,
							"This is the currently active device, are you sure?",
							void 0,
							"Delete",
							() => {
								this.ResetCurrentDevice();
							}
						).open()
					);
				});
			} else {
				deviceSetting
					.addButton((btn) => {
						btn.setButtonText("Set as Current");
						btn.onClick(() => {
							setCurrentlyActiveDevice(device);
							this.display();
						});
					})
					.addButton((btn) => {
						btn.setIcon("trash");
						btn.onClick(() =>
							new ConfirmationPopupModal(
								this.app,
								`You are about to delete: ${device}`,
								void 0,
								"Delete",
								async () => {
									Manager.getInstance().devices.remove(device);
									await Manager.getInstance().saveSettings();
									this.display();
								}
							).open()
						);
					});
			}
		});
	}

	ResetCurrentDevice() {
		const device: string | null = getCurrentlyActiveDevice();

		if (!device) {
			return;
		}
		Manager.getInstance().devices.remove(device);
		setCurrentlyActiveDevice(null);
		this.display();
	}
}
