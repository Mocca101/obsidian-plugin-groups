import {App, Modal, Setting} from "obsidian";
import GroupSettingsTab from "./GroupSettingsTab";
import {generateGroupID} from "./Utilities";
import ConfirmationPopupModal from "./ConfirmationPopupModal";
import PgMain from "../main";
import {PluginGroup} from "./PluginGroup";
import DeviceSelectionModal from "./DeviceSelectionModal";
import GroupEditPluginsTab from "./GroupEditModal/GroupEditPluginsTab";
import GroupEditGroupsTab from "./GroupEditModal/GroupEditGroupsTab";
import GroupEditGeneralTab from "./GroupEditModal/GroupEditGeneralTab";

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
		const {modalEl} = this;

		modalEl.empty();

		const contentEl = modalEl.createEl('div', {cls: 'group-edit-modal-content '})
		// eslint-disable-next-line prefer-const
		let generalSettings: HTMLElement;
		// eslint-disable-next-line prefer-const
		let pluginsSection: HTMLElement;
		// eslint-disable-next-line prefer-const
		let groupsSection: HTMLElement;

		const nameSettingNameEl = new Setting(contentEl)
			.addText(txt => {
				txt.setValue(this.groupToEdit.name)
				txt.onChange(val => {
					this.groupToEdit.name = val;
					nameSettingNameEl.setText("Editing \"" + this.groupToEdit.name + "\"")
				});
			}).nameEl.createEl("h2", {text: "Editing \"" + this.groupToEdit.name + "\""})

		const tabContainer = contentEl.createDiv({cls: "pg-tabs"});

		const generalTab = tabContainer.createDiv({cls: "pg-tab is-active"});
			generalTab.createSpan({text: "General"});
		const pluginsTab = tabContainer.createDiv({cls: "pg-tab"});
			pluginsTab.createSpan({text: "Plugins"});
		const groupsTab = tabContainer.createDiv({cls: "pg-tab"});
			groupsTab.createSpan({text: "Groups"});

		const switchActive = (clicked: string) => {
			generalTab.removeClass("is-active");
			pluginsTab.removeClass("is-active");
			groupsTab.removeClass("is-active");

			generalSettings?.removeClass("is-active");
			pluginsSection?.removeClass("is-active");
			groupsSection?.removeClass("is-active");
			switch (clicked) {
				case "Plugins":
					pluginsSection?.addClass("is-active");
					pluginsTab?.addClass("is-active");
					break;
				case "Groups":
					groupsSection?.addClass("is-active");
					groupsTab.addClass("is-active");
					break;
				default:
					generalSettings?.addClass("is-active");
					generalTab.addClass("is-active");
					break;
			}
		}

		generalTab.onClickEvent(() => switchActive("General"));
		pluginsTab.onClickEvent(() =>  switchActive("Plugins"));
		groupsTab.onClickEvent(() => switchActive("Groups"));

		generalSettings = new GroupEditGeneralTab(this.groupToEdit, contentEl).containerEl;

		pluginsSection = new GroupEditPluginsTab(this.groupToEdit, contentEl).containerEl;

		groupsSection = new GroupEditGroupsTab(this.groupToEdit, contentEl).containerEl;

		this.generateFooter(modalEl);
	}

	private generateFooter(parentElement: HTMLElement) {
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

