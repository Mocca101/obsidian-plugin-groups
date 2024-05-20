import type { Setting } from "obsidian";
import HtmlComponent from "./HtmlComponent";

export default abstract class SettingsList<
	ItemType,
	OptionsType extends { items: ItemType[] },
> extends HtmlComponent<OptionsType> {
	constructor(parentEL: HTMLElement, options: OptionsType) {
		super(parentEL, options);
		this.generateComponent();
	}

	protected generateComponent() {
		this.generateContainer();
		this.generateContent();
	}

	abstract generateListItem(listEl: HTMLElement, item: ItemType): Setting;

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createEl("div");
		this.mainEl.addClass("pg-settings-list");
	}

	protected generateContent() {
		if (!this.mainEl) {
			return;
		}

		const container = this.mainEl;

		this.options.items.forEach((item) => {
			this.generateListItem(container, item);
		});
	}

	protected clear() {
		if (this.mainEl?.hasClass("pg-settings-list")) {
			this.mainEl.textContent = "";
		}
	}
}
