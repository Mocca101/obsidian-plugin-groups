import {setIcon} from "obsidian";


export default class ButtonWithDropdown {

	containerEL: HTMLElement;

	private drpList: HTMLElement;

	constructor(parentEl: HTMLElement, mainLabel: {label: string, icon?: string}, dropdownOptions: DropdownOption[],
				options?: {
					drpIcon?: string,
					maxWidth?: string
				}) {

		this.containerEL = parentEl.createEl('button', {cls: 'pg-drp-btn'});
		if(options?.maxWidth) {
			this.containerEL.style.maxWidth = options.maxWidth;
		}
		this.containerEL.onClickEvent(() => this.toggleDropdown());

		const activeOptionBtn = this.containerEL.createSpan({cls: 'pg-drp-btn-main-label'});
		this.setElementTextOrIcon(activeOptionBtn, mainLabel.label, mainLabel.icon)

		this.containerEL.createSpan({text: '▼'})

		this.drpList = this.containerEL.createEl('ul', {cls: 'pg-drp-btn-list'});
		dropdownOptions.forEach(option => {
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

interface DropdownOption {
	label: string,
	func: () => void,
	icon?: string
}
