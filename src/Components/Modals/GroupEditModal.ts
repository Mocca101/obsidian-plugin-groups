import { type App, Modal, Setting } from "obsidian";
import { PluginGroup } from "../../DataStructures/PluginGroup";
import GroupEditGeneralTab from "../../GroupEditModal/GroupEditGeneralTab";
import GroupEditGroupsTab from "../../GroupEditModal/GroupEditGroupsTab";
import GroupEditPluginsTab from "../../GroupEditModal/GroupEditPluginsTab";
import CommandManager from "../../Managers/CommandManager";
import Manager from "../../Managers/Manager";
import { generateGroupID } from "../../Utils/Utilities";
import ConfirmationPopupModal from "../BaseComponents/ConfirmationPopupModal";
import TabGroupComponent from "../BaseComponents/TabGroupComponent";
import type GroupSettings from "../Settings/GroupSettings";
import { settingsStore } from "@/stores/main-store";
import { get } from "svelte/store";

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
					nameSettingNameEl.setText(`Editing "${this.groupToEdit.name}"`);
				});
			})
			.nameEl.createEl("h2", {
				text: `Editing "${this.groupToEdit.name}"`,
			});

		const tabGroup: TabGroupComponent = new TabGroupComponent(modalEl, {
			tabs: [
				{
					title: "General",
					content: new GroupEditGeneralTab(this.groupToEdit, contentEl)
						.containerEl,
				},
				{
					title: "Plugins",
					content:
						new GroupEditPluginsTab(contentEl, {
							group: this.groupToEdit,
						}).mainEl ??
						modalEl.createSpan("Plugins Not Loaded, please contact Dev."),
				},
				{
					title: "Groups",
					content: new GroupEditGroupsTab(this.groupToEdit, contentEl)
						.containerEl,
				},
			],
		});

		this.generateFooter(modalEl);
	}

	private generateFooter(parentElement: HTMLElement) {
		const footer = parentElement.createEl("div");

		footer.addClass("pg-edit-modal-footer");

		new Setting(footer)
			.addButton((btn) => {
				btn.setButtonText("Delete");
				btn.onClick(() =>
					new ConfirmationPopupModal(
						this.app,
						`You are about to delete: ${this.groupToEdit.name}`,
						void 0,
						"Delete",
						() => this.deleteGroup()
					).open()
				);
			})
			.addButton((btn) => {
				btn.setButtonText("Cancel");
				btn.onClick(() => this.close());
			})
			.addButton((btn) => {
				btn.setButtonText("Save");
				btn.onClick(() => this.saveChanges());
			})
			.addExtraButton((btn) => {
				btn
					.setIcon("copy")
					.setTooltip("Duplicate this group")
					.onClick(() => this.duplicate());
			})
			.settingEl.addClass("modal-footer");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();

		if (
			get(settingsStore).groupsMap.has(this.groupToEdit.id) &&
			this.discardChanges
		) {
			Object.assign(this.groupToEdit, JSON.parse(this.groupToEditCache));
		}
	}

	async saveChanges() {
		this.discardChanges = false;
		if (get(settingsStore).groupsMap.has(this.groupToEdit.id)) {
			await this.editGroup(this.groupToEdit);
		} else {
			await this.addGroup(this.groupToEdit);
		}
	}

	async duplicate() {
		const duplicateGroup = new PluginGroup(this.groupToEdit);
		const groupMap = get(settingsStore).groupsMap;

		if (!groupMap) {
			return;
		}
		duplicateGroup.name += "-Duplicate";
		const genId = generateGroupID(duplicateGroup.name);

		if (!genId) {
			return;
		}
		duplicateGroup.id = genId;

		await this.addGroup(duplicateGroup);
	}

	async addGroup(group: PluginGroup) {
		settingsStore.update((s) => {
			s.groupsMap.set(group.id, group);
			return s;
		})

		CommandManager.getInstance().AddGroupCommands(group.id);

		await this.persistChangesAndClose();
	}

	async editGroup(group: PluginGroup) {
		settingsStore.update((s) => {
			s.groupsMap.set(group.id, group);
			return s;
		})
		CommandManager.getInstance().updateCommand(group.id);
		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		this.groupSettings.render();
		this.close();
	}

	async deleteGroup() {		
		settingsStore.update((s) => {
			s.groupsMap.delete(this.groupToEdit.id);
			return s;
		})
		this.groupSettings.render();
		this.close();
	}
}
