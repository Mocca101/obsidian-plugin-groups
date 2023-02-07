import HtmlComponent from './BaseComponents/HtmlComponent';

export default abstract class TabbedContent<Type> extends HtmlComponent<Type> {
	protected generateComponent(active?: boolean) {
		this.mainEl = this.parentEl.createDiv({ cls: 'pg-tabbed-content' });
		if (active) {
			this.mainEl.addClass('is-active');
		}
	}
}
