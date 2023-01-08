import {setIcon} from "obsidian";


export default class RemovableChip {

	private parentEl: HTMLElement;

	chipEl: HTMLElement;

	label: string;

	onClose: () => void;

	constructor(parentEl: HTMLElement, label: string, onClose: () => void ) {
		this.parentEl = parentEl;
		this.label = label;
		this.onClose = onClose;

		this.render();
	}

	private render() {
		this.chipEl = this.parentEl.createDiv({cls: 'pg-chip'});
		this.chipEl.createSpan({text:this.label})
		const closeBtn = this.chipEl.createDiv({cls: 'pg-chip-close-btn'});
		setIcon(closeBtn, 'x', 1);
		closeBtn.onClickEvent(() => {
			this.onClose();
			this.chipEl.remove();
		})
	}
}
