import { App, Modal, Setting } from 'obsidian';
import GroupSettingsTab from './GroupSettingsTab';
import { generateGroupID } from './Utils/Utilities';
import ConfirmationPopupModal from './Components/ConfirmationPopupModal';
import { PluginGroup } from './DataStructures/PluginGroup';
import GroupEditPluginsTab from './GroupEditModal/GroupEditPluginsTab';
import GroupEditGroupsTab from './GroupEditModal/GroupEditGroupsTab';
import GroupEditGeneralTab from './GroupEditModal/GroupEditGeneralTab';
import Manager from './Managers/Manager';
import CommandManager from './Managers/CommandManager';
import TabGroupComponent from './Components/BaseComponents/TabGroupComponent';

export default class GroupEditModal extends Modal {
	groupToEdit: PluginGroup;

	groupToEditCache: string;
	discardChanges = true;

	settingsTab: GroupSettingsTab;

	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
		this.groupToEditCache = JSON.stringify(group);
	}

	onOpen() {
		const { modalEl } = this;

		modalEl.empty();

		const contentEl = modalEl.createEl('div', {
			cls: 'group-edit-modal-content ',
		});

		const nameSettingNameEl = new Setting(contentEl)
			.addText((txt) => {
				txt.setValue(this.groupToEdit.name);
				txt.onChange((val) => {
					this.groupToEdit.name = val;
					nameSettingNameEl.setText(
						'Editing "' + this.groupToEdit.name + '"'
					);
				});
			})
			.nameEl.createEl('h2', {
				text: 'Editing "' + this.groupToEdit.name + '"',
			});

		const tabGroup: TabGroupComponent = new TabGroupComponent(modalEl, {
			tabs: [
				{
					title: 'General',
					content: new GroupEditGeneralTab(
						this.groupToEdit,
						contentEl
					).containerEl,
				},
				{
					title: 'Plugins',
					content:
						new GroupEditPluginsTab(contentEl, {
							group: this.groupToEdit,
						}).mainEl ??
						modalEl.createSpan(
							'Plugins Not Loaded, please contact Dev.'
						),
				},
				{
					title: 'Groups',
					content: new GroupEditGroupsTab(this.groupToEdit, contentEl)
						.containerEl,
				},
			],
		});

		this.generateFooter(modalEl);
	}

	private generateFooter(parentElement: HTMLElement) {
		const footer = parentElement.createEl('div');

		footer.addClass('group-edit-modal-footer');

		new Setting(footer)
			.addButton((btn) => {
				btn.setButtonText('Delete');
				btn.onClick(() =>
					new ConfirmationPopupModal(
						this.app,
						'You are about to delete: ' + this.groupToEdit.name,
						void 0,
						'Delete',
						() => this.deleteGroup()
					).open()
				);
			})
			.addButton((btn) => {
				btn.setButtonText('Cancel');
				btn.onClick(() => this.close());
			})
			.addButton((btn) => {
				btn.setButtonText('Save');
				btn.onClick(() => this.saveChanges());
			})
			.addExtraButton((btn) => {
				btn.setIcon('copy')
					.setTooltip('Duplicate this group')
					.onClick(() => this.duplicate());
			})
			.settingEl.addClass('modal-footer');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();

		if (
			Manager.getInstance().groupsMap.has(this.groupToEdit.id) &&
			this.discardChanges
		) {
			Object.assign(this.groupToEdit, JSON.parse(this.groupToEditCache));
		}
	}

	async saveChanges() {
		this.discardChanges = false;
		if (Manager.getInstance().groupsMap.has(this.groupToEdit.id)) {
			await this.editGroup(this.groupToEdit);
		} else {
			await this.addGroup(this.groupToEdit);
		}
	}

	async duplicate() {
		const duplicateGroup = new PluginGroup(this.groupToEdit);
		const groupMap = Manager.getInstance().groupsMap;

		if (!groupMap) {
			return;
		}
		duplicateGroup.name += '-Duplicate';
		const genId = generateGroupID(duplicateGroup.name);

		if (!genId) {
			return;
		}
		duplicateGroup.id = genId;

		await this.addGroup(duplicateGroup);
	}

	async addGroup(group: PluginGroup) {
		Manager.getInstance().groupsMap.set(group.id, group);

		CommandManager.getInstance().AddGroupCommands(group.id);

		await this.persistChangesAndClose();
	}

	async editGroup(group: PluginGroup) {
		Manager.getInstance().groupsMap.set(group.id, group);
		CommandManager.getInstance().updateCommand(group.id);
		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		await Manager.getInstance().saveSettings();
		this.settingsTab.display();
		this.close();
	}

	async deleteGroup() {
		Manager.getInstance().groupsMap.delete(this.groupToEdit.id);
		await Manager.getInstance().saveSettings();
		this.settingsTab.display();
		this.close();
	}
}
