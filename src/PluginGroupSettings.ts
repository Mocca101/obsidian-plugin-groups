import {
	App,
	ButtonComponent,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
} from 'obsidian';
import PgMain from '../main';
import GroupEditModal from './GroupEditModal';
import {
	generateGroupID,
	getCurrentlyActiveDevice,
	setCurrentlyActiveDevice,
} from './Utils/Utilities';
import { PluginGroup } from './DataStructures/PluginGroup';
import ConfirmationPopupModal from './Components/BaseComponents/ConfirmationPopupModal';
import Manager from './Managers/Manager';
import PluginManager from './Managers/PluginManager';
import DescriptionsPluginList, {
	PluginAndDesc,
} from './Components/DescriptionsPluginList';
import GroupSettings from './Components/Settings/GroupSettings';
import AdvancedSettings from './Components/Settings/AdvancedSettings';

export default class PluginGroupSettings extends PluginSettingTab {
	constructor(app: App, plugin: PgMain) {
		super(app, plugin);
	}

	async display(): Promise<void> {
		await PluginManager.loadNewPlugins();

		const { containerEl } = this;

		containerEl.empty();

		this.generateGeneralSettings(containerEl);

		new GroupSettings(containerEl, {});

		this.GenerateDeviceList(containerEl);

		this.GeneratePluginsList(containerEl);

		new AdvancedSettings(containerEl, {});
	}

	private generateGeneralSettings(containerEl: HTMLElement) {
		const generalParent = containerEl.createEl('h4', { text: 'General' });

		new Setting(generalParent)
			.setName('Generate Commands for Groups')
			.addToggle((tgl) => {
				tgl.setValue(Manager.getInstance().generateCommands ?? false);
				tgl.onChange(async (value) => {
					Manager.getInstance().shouldGenerateCommands = value;
					await Manager.getInstance().saveSettings();
				});
			});

		new Setting(generalParent)
			.setName('Notice upon un-/loading groups')
			.addDropdown((drp) => {
				drp.addOption('none', 'None')
					.addOption('short', 'Short')
					.addOption('normal', 'Normal');
				drp.setValue(
					Manager.getInstance().showNoticeOnGroupLoad ?? 'none'
				);
				drp.onChange(async (value) => {
					Manager.getInstance().showNoticeOnGroupLoad = value;
					await Manager.getInstance().saveSettings();
				});
			});
	}

	GenerateDeviceList(contentEl: HTMLElement) {
		let newDeviceName = '';
		const CreateNewDevice = async () => {
			if (!newDeviceName || newDeviceName.replace(' ', '') === '') {
				return;
			}

			if (Manager.getInstance().devices.contains(newDeviceName)) {
				new Notice('Name already in use for other device');
				return;
			}

			Manager.getInstance().devices.push(newDeviceName);
			await Manager.getInstance().saveSettings();

			if (!getCurrentlyActiveDevice()) {
				setCurrentlyActiveDevice(newDeviceName);
			}

			this.display();

			newDeviceName = '';
			newDevNameText.setValue(newDeviceName);
		};

		contentEl.createEl('h4', { text: 'Devices' });

		let deviceAddBtn: ButtonComponent;

		const deviceNameSetting = new Setting(contentEl).setName('New Device');

		const newDevNameText = new TextComponent(deviceNameSetting.controlEl);
		newDevNameText
			.setValue(newDeviceName)
			.onChange((value) => {
				newDeviceName = value;
				if (deviceAddBtn) {
					value.replace(' ', '').length > 0
						? deviceAddBtn.buttonEl.removeClass('btn-disabled')
						: deviceAddBtn.buttonEl.addClass('btn-disabled');
				}
			})
			.setPlaceholder('Device Name').inputEl.onkeydown = async (e) => {
			if (e.key === 'Enter') {
				await CreateNewDevice();
			}
		};

		deviceNameSetting.addButton((btn) => {
			deviceAddBtn = btn;
			deviceAddBtn
				.setIcon('plus')
				.onClick(async () => {
					await CreateNewDevice();
				})
				.buttonEl.addClass('btn-disabled');
		});

		Manager.getInstance().devices.forEach((device) => {
			const deviceSetting = new Setting(contentEl).setName(device);
			if (getCurrentlyActiveDevice() === device) {
				deviceSetting.setDesc('Current Device').addButton((btn) => {
					btn.setIcon('trash');
					btn.onClick(() =>
						new ConfirmationPopupModal(
							this.app,
							'This is the currently active device, are you sure?',
							void 0,
							'Delete',
							() => {
								this.ResetCurrentDevice();
							}
						).open()
					);
				});
			} else {
				deviceSetting
					.addButton((btn) => {
						btn.setButtonText('Set as Current');
						btn.onClick(() => {
							setCurrentlyActiveDevice(device);
							this.display();
						});
					})
					.addButton((btn) => {
						btn.setIcon('trash');
						btn.onClick(() =>
							new ConfirmationPopupModal(
								this.app,
								'You are about to delete: ' + device,
								void 0,
								'Delete',
								async () => {
									Manager.getInstance().devices.remove(
										device
									);
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

	GeneratePluginsList(contentEl: HTMLElement) {
		contentEl.createEl('h4', { text: 'Plugins' });

		const pluginsAndParentGroups: PluginAndDesc[] =
			PluginManager.getAllAvailablePlugins().map((plugin) => {
				const groups = Manager.getInstance().getGroupsOfPlugin(
					plugin.id
				);

				return {
					plugin: plugin,
					description: groups.map((group) => group.name).join(', '),
				};
			});

		new DescriptionsPluginList(contentEl, {
			items: pluginsAndParentGroups,
		});
	}
}
