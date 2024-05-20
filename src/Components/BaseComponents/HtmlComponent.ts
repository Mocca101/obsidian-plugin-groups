export default abstract class HtmlComponent<OptionsType> {
	mainEl?: HTMLElement;

	options: OptionsType;

	protected parentEl: HTMLElement;
	protected constructor(parentElement: HTMLElement, options?: OptionsType) {
		this.parentEl = parentElement;
		if (options) {
			this.options = options;
		}
	}

	update(options?: OptionsType): void {
		if (options) {
			this.options = options;
		}
		this.render();
	}

	render() {
		if (!this.mainEl) {
			this.generateComponent();
		} else {
			this.clear();
			this.generateContent();
		}
	}

	protected generateComponent(): void {
		this.generateContainer();
		this.generateContent();
	}

	protected abstract generateContainer(): void;

	protected abstract generateContent(): void;

	protected clear(): void {
		if (this.mainEl) {
			this.mainEl.textContent = "";
		}
	}
}
