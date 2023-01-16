import SettingsList from "./SettingsList";
import {PgPlugin} from "../../PgPlugin";
import {setIcon, Setting} from "obsidian";

export default abstract class ReorderableList extends SettingsList{

	moveItemUp(item: unknown) : void {
		const currentIndex = this.findIndexInItems(item);

		if(currentIndex < this.listItems.length - 1 && currentIndex > -1) {
			this.listItems[currentIndex] = this.listItems[currentIndex + 1];
			this.listItems[currentIndex + 1] = item
		}
		this.render();
	}

	moveItemDown(item: unknown) : void {
		const currentIndex = this.findIndexInItems(item);

		if(currentIndex > 0) {
			this.listItems[currentIndex] = this.listItems[currentIndex - 1];
			this.listItems[currentIndex - 1] = item;
		}
		this.render();
	}

	protected findIndexInItems(item: unknown) : number {
		return this.listItems.findIndex(listItem => listItem === item);
	}

	generateListItem(listEl: HTMLElement, item: unknown): Setting {
		const itemEl = new Setting(listEl)
			.addButton(btn => {
				setIcon(btn.buttonEl,'arrow-down');
				btn.onClick(() => {
					this.moveItemUp(item);
				})
			})
			.addButton(btn => {
				setIcon(btn.buttonEl,'arrow-up');
				btn.onClick(() => {
					this.moveItemDown(item);
				})
			});

		return itemEl;
	}

}
