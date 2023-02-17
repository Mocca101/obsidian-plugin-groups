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
			this.generateDynamicContent();
		}
	}

	protected generateComponent(): void {
		this.generateMain();
		this.generateDynamicContent();
	}

	protected abstract generateMain(): void;

	protected abstract generateDynamicContent(): void;

	protected clear(): void {
		if (this.mainEl) {
			this.mainEl.textContent = '';
		}
	}
}
