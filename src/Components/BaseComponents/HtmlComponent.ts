

export default abstract class HtmlComponent {
	mainEl?: HTMLElement;

	options: unknown;

	protected parentEl: HTMLElement;
	protected constructor(parentElement: HTMLElement, options?: unknown) {
		this.parentEl = parentElement;
		if(options) {
			this.options = options;
		}
	}

	abstract update(options: unknown) : void;

	render() {
		this.mainEl?.remove();
		this.generateComponent();
	}

	protected abstract generateComponent() : void;

}


