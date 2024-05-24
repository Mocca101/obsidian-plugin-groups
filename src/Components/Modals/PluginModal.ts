import { type App, Modal, Setting } from "obsidian";
import type { PgPlugin } from "../../DataStructures/PgPlugin";
import type { PluginGroup } from "../../DataStructures/PluginGroup";
import Manager from "../../Managers/Manager";
import TogglableList from "../BaseComponents/TogglableList";
import { settingsStore } from "@/stores/main-store";
import { get } from "svelte/store";

export default class PluginModal extends Modal {
	private pluginToEdit: PgPlugin;

	private memberGroupIds: string[];

	private memberGroupsIdsCache: string[];

	private onCloseActions?: () => void;

	discardChanges = true;

	constructor(app: App, pluginToEdit: PgPlugin, onCloseActions?: () => void) {
		super(app);
		this.pluginToEdit = pluginToEdit;
		this.onCloseActions = onCloseActions;

		this.memberGroupIds = Manager.getInstance()
			.getGroupsOfPlugin(pluginToEdit.id)
			.map((g) => g.id);

		this.memberGroupsIdsCache = this.memberGroupIds.map((id) => id);
	}

	onOpen() {
		const { modalEl } = this;

		modalEl.empty();

		const contentEl = modalEl.createDiv();

		const title = contentEl.createEl("h4");
		title.textContent = "Editing Plugin: ";
		title.createEl("b").textContent = this.pluginToEdit.name;

		if (this.memberGroupIds) {
			const groupsList = new TogglableList<PluginGroup>(contentEl, {
				items: Array.from(get(settingsStore).groupsMap.values()),
				getToggleState: (item) => {
					return this.getToggleState(item);
				},
				toggle: (item) => {
					this.toggleItem(item);
				},
			});
		}
		this.generateFooter(contentEl);
	}

	toggleItem(item: PluginGroup) {
		if (!this.memberGroupIds.contains(item.id)) {
			this.memberGroupIds.push(item.id);
		} else {
			this.memberGroupIds.remove(item.id);
		}
	}

	getToggleState(item: PluginGroup): boolean {
		return this.memberGroupIds?.contains(item.id);
	}

	onClose() {
		const { contentEl } = this;

		if (this.onCloseActions) {
			this.onCloseActions();
		}

		contentEl.empty();
	}

	private generateFooter(parentElement: HTMLElement) {
		const footer = parentElement.createEl("div");

		footer.addClass("pg-edit-modal-footer");

		new Setting(footer)
			.addButton((btn) => {
				btn.setButtonText("Cancel");
				btn.onClick(() => this.close());
			})
			.addButton((btn) => {
				btn.setButtonText("Save");
				btn.onClick(() => this.saveChanges());
			})
			.settingEl.addClass("modal-footer");
	}

	private async saveChanges() {
		const removedGroupIds = this.memberGroupsIdsCache.filter(
			(id) => !this.memberGroupIds.includes(id)
		);

		removedGroupIds.forEach((id) =>
			get(settingsStore).groupsMap.get(id)?.removePlugin(this.pluginToEdit)
		);

		const addedGroupIds = this.memberGroupIds.filter(
			(id) => !this.memberGroupsIdsCache.includes(id)
		);

		addedGroupIds.forEach((id) => {
			get(settingsStore).groupsMap.get(id)?.addPlugin(this.pluginToEdit);
		});

		await Manager.getInstance().saveSettings();

		this.close();
	}
}
