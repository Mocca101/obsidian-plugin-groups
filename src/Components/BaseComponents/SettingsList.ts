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
		this.generateMain();
		this.generateDynamicContent();
	}

	abstract generateListItem(listEl: HTMLElement, item: ItemType): Setting;

	protected generateMain(): void {
		this.mainEl = this.parentEl.createEl('div');
		this.mainEl.addClass('pg-settings-list');
	}

	protected generateDynamicContent() {
		this.options.items.forEach((item) => {
			if (!this.mainEl) {
				return;
			}

			this.generateListItem(this.mainEl, item);
		});
	}

	protected clear() {
		if (this.mainEl && this.mainEl.hasClass('pg-settings-list')) {
			this.mainEl.textContent = '';
		}
	}
}
