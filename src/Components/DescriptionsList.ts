import SettingsList from './BaseComponents/SettingsList';
import { Setting } from 'obsidian';
import { Named } from '../Utils/Types';

export default class DescriptionsList<
	ItemType extends Named
> extends SettingsList<
	ItemAndDescription<ItemType>,
	{ items: ItemAndDescription<ItemType>[] }
> {
	constructor(
		parentEL: HTMLElement,
		options: { items: ItemAndDescription<ItemType>[] }
	) {
		super(parentEL, options);
	}

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
