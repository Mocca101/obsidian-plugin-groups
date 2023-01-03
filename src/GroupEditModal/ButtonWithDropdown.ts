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

		const btn = this.containerEL;

		const activeOptionBtn = btn.createSpan({cls: 'pg-drp-btn-main-label'});
		this.setElementTextOrIcon(activeOptionBtn, mainLabel.label, mainLabel.icon)

		btn.createSpan({text: '▼'})

		this.drpList = btn.createEl('ul', {cls: 'pg-drp-btn-list'});
		dropdownOptions.forEach(option => {
			const item = this.drpList.createEl('li', );
			this.setElementTextOrIcon(item, option.label, option.icon);

			item.onClickEvent(() => {
				option.func();
				this.closeDropdown();
			});
		});

		document.addEventListener('click', (event) => {
			event.target
			if (!btn.contains(event.targetNode)) {
				this.closeDropdown();
			}
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
		this.drpList.hasClass('is-active') ? this.closeDropdown() : this.drpList.addClass('is-active');
	}

	private closeDropdown() {
		this.drpList.removeClass('is-active');
	}

}

interface DropdownOption {
	label: string,
	func: () => void,
	icon?: string
}
