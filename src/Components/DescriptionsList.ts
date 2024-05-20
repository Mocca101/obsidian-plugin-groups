import { Setting } from "obsidian";
import type { Named } from "../Utils/Types";
import SettingsList from "./BaseComponents/SettingsList";

export default class DescriptionsList<
	ItemType extends Named,
> extends SettingsList<
	ItemAndDescription<ItemType>,
	{ items: ItemAndDescription<ItemType>[] }
> {
	generateListItem(
		listEl: HTMLElement,
		plugin: ItemAndDescription<ItemType>
	): Setting {
		const item = new Setting(listEl).setName(plugin.item.name);
		if (plugin.description) {
			item.setDesc(plugin.description);
		}
		return item;
	}
}

export interface ItemAndDescription<ItemType extends Named> {
	item: ItemType;
	description?: string;
}
