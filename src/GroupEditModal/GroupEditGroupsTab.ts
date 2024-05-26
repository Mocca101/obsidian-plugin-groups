import { Setting } from "obsidian";
import type { PluginGroup } from "@/DataStructures/PluginGroup";
import { settingsStore } from "@/stores/main-store";
import { get } from "svelte/store";

export default class GroupEditGroupsTab {
	containerEl: HTMLElement;

	private groupToEdit: PluginGroup;

	private availableGroups: PluginGroup[];

	private groupListElements: Map<string, Setting> = new Map<string, Setting>();

	constructor(group: PluginGroup, parentEl: HTMLElement) {
		this.groupToEdit = group;

		this.availableGroups = Array.from(
			get(settingsStore).groupsMap.values()
		).filter((g) => g.id !== group.id);

		this.containerEl = this.generateGroupsSection(parentEl);
	}

	private generateGroupsSection(parentElement: HTMLElement): HTMLElement {
		const groupSection: HTMLElement = parentElement.createDiv();

		groupSection.createEl("h5", { text: "Groups" });

		const searchAndList: HTMLElement = groupSection.createEl("div");

		new Setting(searchAndList).setName("Search").addText((txt) => {
			txt.setPlaceholder("Search for Groups...");
			txt.onChange((search) => {
				this.searchGroups(search);
			});
		});

		const groupList = searchAndList.createEl("div");
		groupList.addClass("pg-settings-list");

		this.groupListElements = new Map<string, Setting>();

		this.sortGroups(this.availableGroups).forEach((pluginGroup) => {
			const setting = new Setting(groupList)
				.setName(pluginGroup.name)
				.addButton((btn) => {
					btn
						.setIcon(
							this.groupToEdit.groupIds.contains(pluginGroup.id)
								? "check-circle"
								: "circle"
						)
						.onClick(() => {
							this.toggleGroupForGroup(pluginGroup);
							btn.setIcon(
								this.groupToEdit.groupIds.contains(pluginGroup.id)
									? "check-circle"
									: "circle"
							);
						});
				});
			this.groupListElements.set(pluginGroup.id, setting);
		});
		return groupSection;
	}

	private searchGroups(search: string) {
		const hits = this.availableGroups
			.filter((p) => p.name.toLowerCase().contains(search.toLowerCase()))
			.map((p) => p.id);
		this.groupListElements.forEach((group) => group.settingEl.hide());
		hits.forEach((id) => this.groupListElements.get(id)?.settingEl.show());
	}

	sortGroups(groups: PluginGroup[]): PluginGroup[] {
		return groups.sort((a, b) => {
			const aInGroup = this.isGroupInGroup(a);
			const bInGroup = this.isGroupInGroup(b);
			if (aInGroup && !bInGroup) return -1;
			if (!aInGroup && bInGroup) return 1;

			return a.name.localeCompare(b.name);
		});
	}

	isGroupInGroup(plugin: PluginGroup): boolean {
		return this.groupToEdit.plugins.map((p) => p.id).contains(plugin.id);
	}

	toggleGroupForGroup(group: PluginGroup) {
		if (this.groupToEdit.groupIds.contains(group.id)) {
			return this.groupToEdit.removeGroup(group);
		}
		return this.groupToEdit.addGroup(group);
	}
}
