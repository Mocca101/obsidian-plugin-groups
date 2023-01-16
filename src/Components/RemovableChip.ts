import {setIcon} from "obsidian";
import HtmlComponent from "./BaseComponents/HtmlComponent";


export default class  extends HtmlComponent {


	label: string;

	onClose: () => void;

	constructor(parentEl: HTMLElement, label: string, onClose: () => void ) {
		super(parentEl);
		this.parentEl = parentEl;
		this.label = label;
		this.onClose = onClose;

		this.render();
	}

	override update(options: {label?: string, onClose?: () => void }) {
		this.label = options.label ?? this.label;
		this.onClose = options.onClose ?? this.onClose;
	}

	protected generateComponent() {
		this.mainEl = this.parentEl.createDiv({cls: 'pg-chip'});
		this.mainEl.createSpan({text:this.label})
		const closeBtn = this.mainEl.createDiv({cls: 'pg-chip-close-btn'});
		setIcon(closeBtn, 'x', 1);
		closeBtn.onClickEvent(() => {
			this.onClose();
			this.mainEl?.remove();
		})
	}
}
