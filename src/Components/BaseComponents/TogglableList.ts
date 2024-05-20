import { type ButtonComponent, Setting } from "obsidian";
import type { Named } from "../../Utils/Types";
import SettingsList from "./SettingsList";

export interface ToggleListOptions<ItemType extends Named> {
	items: ItemType[];

	/**
	 * The function needs to be a reference or a '() =>' function to make sure that 'this.' references the parent object if needed
	 * @param item
	 */
	toggle: (item: ItemType) => void;

	/**
	 * The function needs to be a reference or a '() =>' function to make sure that 'this.' references the parent object if needed
	 * @param item
	 */
	getToggleState: (item: ItemType) => boolean;
}

export default class TogglableList<ItemType extends Named>
	extends SettingsList<ItemType, ToggleListOptions<ItemType>>
	implements IToggleableList<ItemType>
{
	generateListItem(listEl: HTMLElement, item: ItemType): Setting {
		const settingItem = new Setting(listEl);

		settingItem.setName(item.name);

		this.addToggleButton(settingItem, item);

		return settingItem;
	}

	addToggleButton(setting: Setting, item: ItemType): void {
		setting.addButton((btn) => {
			const currentState = this.getItemState(item);
			this.setToggleIcon(btn, currentState);
			btn.onClick(() => {
				this.toggleItem(item);
				this.setToggleIcon(btn, this.getItemState(item));
			});
		});
	}

	toggleItem(item: ItemType): void {
		this.options.toggle(item);
	}

	getItemState(item: ItemType): boolean {
		return this.options.getToggleState(item);
	}

	setToggleIcon(btn: ButtonComponent, value: boolean): void {
		btn.setIcon(value ? "check-circle" : "circle");
	}
}

export interface IToggleableList<ItemType> {
	toggleItem(item: ItemType, value: boolean): void;

	addToggleButton(setting: Setting, item: ItemType): void;

	getItemState(item: ItemType): boolean;

	setToggleIcon(btn: ButtonComponent, value: boolean): void;
}
