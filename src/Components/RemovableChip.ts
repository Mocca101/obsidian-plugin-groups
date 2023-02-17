import { setIcon } from 'obsidian';
import HtmlComponent from './BaseComponents/HtmlComponent';

interface RemovableChipOptions {
	label: string;
	onClose: () => void;
}
export default class RemovableChip extends HtmlComponent<RemovableChipOptions> {
	constructor(parentEl: HTMLElement, options: RemovableChipOptions) {
		super(parentEl);
		this.parentEl = parentEl;
		this.options = options;

		this.render();
	}

	protected generateDynamicContent(): void {
		if (!this.mainEl) {
			return;
		}

		this.mainEl.createSpan({ text: this.options.label });
		const closeBtn = this.mainEl.createDiv({ cls: 'pg-chip-close-btn' });
		setIcon(closeBtn, 'x', 1);
		closeBtn.onClickEvent(() => {
			this.options.onClose();
			this.mainEl?.remove();
		});
	}

	protected generateMain(): void {
		this.mainEl = this.parentEl.createDiv({ cls: 'pg-chip' });
	}
}
