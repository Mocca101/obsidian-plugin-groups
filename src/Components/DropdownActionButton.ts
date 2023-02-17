import { setIcon } from 'obsidian';
import HtmlComponent from './BaseComponents/HtmlComponent';

interface DropdownActionButtonOptions {
	mainLabel: MainLabelOptions;
	dropDownOptions: DropdownOption[];
	minWidth?: string;
	drpIcon?: string;
}

export default class DropdownActionButton extends HtmlComponent<DropdownActionButtonOptions> {
	private drpList: HTMLElement;

	constructor(
		parentElement: HTMLElement,
		options: DropdownActionButtonOptions
	) {
		super(parentElement, options);

		this.generateComponent();
	}

	protected generateMain() {
		this.mainEl = this.parentEl.createEl('button', {
			cls: 'pg-drp-btn pg-has-dropdown-single',
		});
	}

	protected generateDynamicContent() {
		if (!this.mainEl) {
			return;
		}

		const { dropDownOptions, mainLabel, drpIcon, minWidth } = this.options;
		if (minWidth) {
			this.mainEl.style.minWidth = minWidth;
		}

		const activeOptionBtn = this.mainEl.createSpan({
			cls: 'pg-drp-btn-main-label',
		});
		this.setElementTextOrIcon(
			activeOptionBtn,
			mainLabel.label,
			mainLabel.icon
		);

		if (drpIcon) {
			const iconSpan = this.mainEl.createSpan();
			setIcon(iconSpan, drpIcon);
			iconSpan.style.paddingTop = '12px';
		} else {
			this.mainEl.createSpan({ text: '▼' });
		}

		this.drpList = this.mainEl.createEl('ul', { cls: 'pg-dropdown' });
		dropDownOptions.forEach((option) => {
			const item = this.drpList.createEl('li', {
				cls: 'pg-dropdown-item',
			});
			this.setElementTextOrIcon(item, option.label, option.icon);

			item.onClickEvent(() => {
				option.func();
			});
		});
	}

	private setElementTextOrIcon(
		element: HTMLElement,
		label: string,
		icon?: string
	) {
		if (icon) {
			setIcon(element.createSpan(), icon);
		} else {
			element.setText(label);
		}
	}
}

export interface DropdownOption {
	label: string;
	func: () => void;
	icon?: string;
}

interface MainLabelOptions {
	label: string;
	icon?: string;
}
