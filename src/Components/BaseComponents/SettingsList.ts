import { Setting } from 'obsidian';
import HtmlComponent from './HtmlComponent';

export default abstract class SettingsList<
	ItemType,
	OptionsType extends { items: ItemType[] }
> extends HtmlComponent<OptionsType> {
	constructor(parentEL: HTMLElement, options: OptionsType) {
		super(parentEL, options);
		this.generateComponent();
	}

	protected generateComponent() {
		this.mainEl = this.parentEl.createEl('div');
		this.mainEl.addClass('group-edit-modal-plugin-list');

		this.options.items.forEach((item) => {
			if (!this.mainEl) {
				return;
			}

			this.generateListItem(this.mainEl, item);
		});
	}

	abstract generateListItem(listEl: HTMLElement, item: ItemType): Setting;
}
