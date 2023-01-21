import {setIcon} from "obsidian";
import HtmlComponent from "./BaseComponents/HtmlComponent";

interface DropdownActionButtonOptions {
	mainLabel: MainLabelOptions;
	dropDownOptions: DropdownOption[];
	minWidth?: string;
	drpIcon?: string;

}


export default class DropdownActionButton extends HtmlComponent<DropdownActionButtonOptions>{

	private drpList: HTMLElement;

	constructor(parentElement: HTMLElement, options: DropdownActionButtonOptions) {
		super(parentElement, options);

		this.generateComponent();
	}

	protected generateComponent(): void {
		this.mainEl = this.parentEl.createEl('button', {cls: 'pg-drp-btn'});
		if(this.options.minWidth) {
			this.mainEl.style.minWidth = this.options.minWidth;
		}
		this.mainEl.onClickEvent(() => this.toggleDropdown());

		const activeOptionBtn = this.mainEl.createSpan({cls: 'pg-drp-btn-main-label'});
		this.setElementTextOrIcon(activeOptionBtn, this.options.mainLabel.label, this.options.mainLabel.icon)

		if(this.options.drpIcon) {
			const iconSpan = this.mainEl.createSpan();
			setIcon(iconSpan, this.options.drpIcon);
			iconSpan.style.paddingTop = '12px'
		} else {
			this.mainEl.createSpan({text: '▼'})
		}

		this.drpList = this.mainEl.createEl('ul', {cls: 'pg-drp-btn-list'});
		this.options.dropDownOptions.forEach(option => {
			const item = this.drpList.createEl('li', );
			this.setElementTextOrIcon(item, option.label, option.icon);

			item.onClickEvent(evt => {
				evt.stopPropagation();
				option.func();
				this.closeDropdown();
			});
		});
	}

	private setElementTextOrIcon(element: HTMLElement, label: string, icon?: string) {
		if(icon) {
			setIcon(element.createSpan(), icon);
		} else {
			element.setText(label);
		}
	}

	private toggleDropdown() {
		this.drpList.hasClass('is-active') ? this.closeDropdown() : this.openDropdown();
	}

	private closeDropdown() {
		this.drpList.removeClass('is-active');
	}

	private openDropdown() {
		this.drpList.addClass('is-active');
		const outsideClickController = new AbortController();
		document.addEventListener('click', (event) => {
					if (!this.mainEl?.contains(event.targetNode) && this.drpList.hasClass('is-active')) {
						this.closeDropdown();
						outsideClickController.abort();
					}
				}
			, outsideClickController);

	}

}

export interface DropdownOption {
	label: string,
	func: () => void,
	icon?: string
}

interface MainLabelOptions {
	label: string,
	icon?: string
}
