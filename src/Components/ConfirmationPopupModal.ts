import {App, Modal, Setting} from "obsidian";

export default class ConfirmationPopupModal extends Modal {

	onConfirm: Event = new Event('onConfirm');

	eventTarget: EventTarget;

	headerText: string;

	cancelText: string;

	confirmText: string;

	private onConfirmListener?: EventListener

	constructor(app: App, headerText: string, cancelText?: string, confirmText?: string, onConfirmListener?: EventListener) {
		super(app);
		this.headerText = headerText;
		this.eventTarget = new EventTarget();
		this.cancelText = cancelText ?? 'Cancel';
		this.confirmText = confirmText ?? 'Confirm';

		this.onConfirmListener = onConfirmListener;
		if(this.onConfirmListener) {

			this.eventTarget.addEventListener(this.onConfirm.type, this.onConfirmListener);
		}
	}


	onOpen() {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl('h2', {text: this.headerText});

		new Setting(contentEl)
			.addButton(btn => {
				btn.setButtonText(this.cancelText);
				btn.onClick(() => this.close());
			})
			.addButton(btn => {
				btn.setButtonText(this.confirmText);
				btn.onClick(() => {
					this.eventTarget.dispatchEvent(this.onConfirm);
					if(this.onConfirmListener) {
						this.eventTarget.removeEventListener(this.onConfirm.type, this.onConfirmListener);
					}
					this.close();
				})
			})
	}

}
