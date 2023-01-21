
export default abstract class HtmlComponent<OptionsType> {
	mainEl?: HTMLElement;

	options: OptionsType;

	protected parentEl: HTMLElement;
	protected constructor(parentElement: HTMLElement, options?: OptionsType) {
		this.parentEl = parentElement;
		if(options) {
			this.options = options;
		}
	}

	abstract update(options: OptionsType) : void;

	render() {
		this.mainEl?.remove();
		this.generateComponent();
	}

	protected abstract generateComponent() : void;

}


