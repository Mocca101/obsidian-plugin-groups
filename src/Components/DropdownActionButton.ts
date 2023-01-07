import {setIcon} from "obsidian";


export default class DropdownActionButton {

	containerEL: HTMLElement;

	private drpList: HTMLElement;

	private parentEl: HTMLElement;

	mainLabel: MainLabelOptions;

	dropdownOptions: DropdownOption[];

	minWidth: string | undefined;

	drpIcon: string | undefined;


	constructor(parentEl: HTMLElement, mainLabel: MainLabelOptions, dropdownOptions: DropdownOption[],
				options?: {
					drpIcon?: string,
					width?: string
				}) {

		this.mainLabel = mainLabel;
		this.dropdownOptions = dropdownOptions;
		this.parentEl = parentEl;

		this.minWidth = options?.width;
		this.drpIcon = options?.drpIcon;

		this.render();
	}

	public rerender() {
		this.containerEL.remove();
		this.render();
	}

	private render() {
		this.containerEL = this.parentEl.createEl('button', {cls: 'pg-drp-btn'});
		if(this.minWidth) {
			this.containerEL.style.minWidth = this.minWidth;
		}
		this.containerEL.onClickEvent(() => this.toggleDropdown());

		const activeOptionBtn = this.containerEL.createSpan({cls: 'pg-drp-btn-main-label'});
		this.setElementTextOrIcon(activeOptionBtn, this.mainLabel.label, this.mainLabel.icon)

		if(this.drpIcon) {
			setIcon(this.containerEL.createSpan(), this.drpIcon);
		} else {
			this.containerEL.createSpan({text: '▼'})
		}

		this.drpList = this.containerEL.createEl('ul', {cls: 'pg-drp-btn-list'});
		this.dropdownOptions.forEach(option => {
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
					if (!this.containerEL.contains(event.targetNode) && this.drpList.hasClass('is-active')) {
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
