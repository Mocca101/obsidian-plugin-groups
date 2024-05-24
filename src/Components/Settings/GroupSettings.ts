import { Setting, type TextComponent } from "obsidian";
import { PluginGroup } from "../../DataStructures/PluginGroup";
import Manager from "../../Managers/Manager";
import { generateGroupID, makeCollapsible } from "../../Utils/Utilities";
import HtmlComponent from "../BaseComponents/HtmlComponent";
import GroupEditModal from "../Modals/GroupEditModal";
import { pluginInstance, settingsStore } from "@/stores/main-store";
import { get } from "svelte/store";

export interface GroupSettingOptions {
	collapsible?: boolean;
	startOpened?: boolean;
	maxListHeight?: number;
}

export default class GroupSettings extends HtmlComponent<GroupSettingOptions> {
	newGroupName: string;

	groupNameField: TextComponent;

	constructor(parentEL: HTMLElement, options: GroupSettingOptions) {
		super(parentEL, options);
		this.generateComponent();
	}

	protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

		const header = this.mainEl.createEl("h5", { text: "Groups" });

		const content = this.mainEl.createDiv();

		if (this.options.collapsible) {
			makeCollapsible(header, content, this.options.startOpened);
		}

		let addBtnEl: HTMLButtonElement;

		new Setting(content)
			.setName("Add Group")
			.addText((text) => {
				this.groupNameField = text;
				this.groupNameField
					.setPlaceholder("Enter group name...")
					.setValue(this.newGroupName)
					.onChange((val) => {
						this.newGroupName = val;
						if (addBtnEl) {
							val.replace(" ", "").length > 0
								? addBtnEl.removeClass("btn-disabled")
								: addBtnEl.addClass("btn-disabled");
						}
					}).inputEl.onkeydown = async (e) => {
					if (e.key === "Enter") {
						await this.addNewGroup();
					}
				};
			})
			.addButton((btn) => {
				btn.setIcon("plus").onClick(() => this.addNewGroup());
				addBtnEl = btn.buttonEl;
				addBtnEl.addClass("btn-disabled");
			});

		const listContainer = content.createDiv();
		listContainer.style.overflow = "scroll";
		listContainer.style.maxHeight = `${
			this.options.maxListHeight?.toString() ?? ""
		}px`;

		this.GenerateGroupList(listContainer);
	}

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv();
	}

	GenerateGroupList(groupParent: HTMLElement) {
		get(settingsStore).groupsMap.forEach((group) => {
			const groupSetting = new Setting(groupParent)
				.setName(group.name)
				.addButton((btn) => {
					btn.setButtonText("Enable");
					btn.setIcon("power");
					btn.onClick(async () => {
						await group.enable();
					});
					group.groupActive()
						? btn.buttonEl.removeClass("btn-disabled")
						: btn.buttonEl.addClass("btn-disabled");
				})
				.addButton((btn) => {
					btn.setButtonText("Disable");
					btn.setIcon("power-off");
					btn.onClick(() => group.disable());
					group.groupActive()
						? btn.buttonEl.removeClass("btn-disabled")
						: btn.buttonEl.addClass("btn-disabled");
				})
				.addButton((btn) => {
					btn.setIcon("pencil");
					btn.onClick(() => this.editGroup(group));
				});
			if (group.loadAtStartup) {
				const descFrag = new DocumentFragment();
				const startupEl = descFrag.createEl("span");
				startupEl.createEl("b", {
					text: "Startup: ",
				});
				startupEl.createEl("span", {
					text: `Delayed by ${group.delay} seconds`,
				});

				if (!group.groupActive()) {
					const activeEl = descFrag.createEl("span");
					activeEl.createEl("br");
					activeEl.createEl("b", { text: "Inactive: " });
					activeEl.createEl("span", {
						text: "Not enabled for current Device",
					});
				}

				groupSetting.setDesc(descFrag);
			}
		});
	}

	async addNewGroup() {
		const id = generateGroupID(this.newGroupName);

		if (!id) {
			console.error(
				"Failed to create Group, please choose a different Name as there have been to many groups with the same name"
			);
			return;
		}

		const newGroup = new PluginGroup({
			id: id,
			name: this.newGroupName,
		});
		new GroupEditModal(
			get(pluginInstance).app,
			this,
			newGroup
		).open();
		this.newGroupName = "";
		if (this.groupNameField) {
			this.groupNameField.setValue("");
		}
	}

	editGroup(group: PluginGroup) {
		new GroupEditModal(
			get(pluginInstance).app,
			this,
			group
		).open();
	}
}
