import {Setting} from "obsidian";
import HtmlComponent from "./HtmlComponent";

export default abstract class SettingsList<ItemType, OptionsType extends { items: ItemType[]}> extends HtmlComponent<OptionsType>{

	protected listItems: ItemType[];

	constructor(parentEL: HTMLElement, listItems: ItemType[]) {
		super(parentEL);
		this.listItems = listItems;
		this.generateComponent();
	}

	update(options: OptionsType) {
		this.listItems = options.items;
		this.render();
	}

	protected generateComponent() {
		this.mainEl = this.parentEl.createEl('div');
		this.mainEl.addClass('group-edit-modal-plugin-list');

		this.listItems.forEach(item => {
			if(!this.mainEl) { return; }

			this.generateListItem(this.mainEl, item);
		});

	}

	abstract generateListItem(listEl: HTMLElement, item: ItemType) : Setting;


}
