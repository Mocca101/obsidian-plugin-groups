import type { Setting } from "obsidian";
import type { PgPlugin } from "../DataStructures/PgPlugin";
import Manager from "../Managers/Manager";
import DescriptionsList, { type ItemAndDescription } from "./DescriptionsList";
import PluginModal from "./Modals/PluginModal";
import { get } from "svelte/store";
import { pluginInstance } from "@/stores/main-store";

export default class EditPluginList extends DescriptionsList<PgPlugin> {
	onEditFinished?: () => void;

	constructor(
		parentEL: HTMLElement,
		options: { items: ItemAndDescription<PgPlugin>[] },
		onEditFinished?: () => void
	) {
		super(parentEL, options);
		this.onEditFinished = onEditFinished;
	}

	override generateListItem(
		listEl: HTMLElement,
		plugin: ItemAndDescription<PgPlugin>
	): Setting {
		const item = super.generateListItem(listEl, plugin);

		item.addButton((btn) => {
			btn.setIcon("pencil");
			btn.onClick(() => {
				new PluginModal(
					get(pluginInstance).app,
					plugin.item,
					() => {
						if (this.onEditFinished) {
							this.onEditFinished();
						}
					}
				).open();
			});
		});

		return item;
	}
}
