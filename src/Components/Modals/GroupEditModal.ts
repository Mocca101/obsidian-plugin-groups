import { App, Modal, Setting } from 'obsidian';
import { generateGroupID } from '../../Utils/Utilities';
import ConfirmationPopupModal from '../BaseComponents/ConfirmationPopupModal';
import { PluginGroup } from '../../DataStructures/PluginGroup';
import GroupEditPluginsTab from '../../GroupEditModal/GroupEditPluginsTab';
import GroupEditGroupsTab from '../../GroupEditModal/GroupEditGroupsTab';
import GroupEditGeneralTab from '../../GroupEditModal/GroupEditGeneralTab';
import Manager from '../../Managers/Manager';
import CommandManager from '../../Managers/CommandManager';
import TabGroupComponent from '../BaseComponents/TabGroupComponent';
import GroupSettings from '../Settings/GroupSettings';

export default class GroupEditModal extends Modal {
	groupToEdit: PluginGroup;

	groupToEditCache: string;
	discardChanges = true;

	groupSettings: GroupSettings;

	constructor(app: App, settingsTab: GroupSettings, group: PluginGroup) {
		super(app);
		this.groupSettings = settingsTab;
		this.groupToEdit = group;
		this.groupToEditCache = JSON.stringify(group);
	}

	onOpen() {
		const { modalEl } = this;

		modalEl.empty();

		const contentEl = modalEl.createDiv();

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

		footer.addClass('pg-edit-modal-footer');

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
		this.groupSettings.render();
		this.close();
	}

	async deleteGroup() {
		Manager.getInstance().groupsMap.delete(this.groupToEdit.id);
		await Manager.getInstance().saveSettings();
		this.groupSettings.render();
		this.close();
	}
}
