import {PgPlugin} from "../../PgPlugin";
import {Setting} from "obsidian";
import HtmlComponent from "./HtmlComponent";

export default abstract class SettingsList extends HtmlComponent{

	protected listItems: unknown[];

	constructor(parentEL: HTMLElement, listItems: unknown[]) {
		super(parentEL);
		this.listItems = listItems;
		this.generateComponent();
	}

	update(listItems: unknown[]) {
		this.listItems = listItems;
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

	abstract generateListItem(listEl: HTMLElement, item: unknown) : Setting;


}
