import HtmlComponent from './HtmlComponent';
import TabComponent from './TabComponent';

export default class TabGroupComponent extends HtmlComponent<TabGroupOptions> {
	activeTab: HTMLElement;
	activeContent: HTMLElement;

	constructor(parentEL: HTMLElement, options: TabGroupOptions) {
		super(parentEL, options);
		this.generateComponent();
	}

	protected generateComponent(): void {
		this.mainEl = this.parentEl.createDiv();

		const tabContainer = this.mainEl.createDiv({ cls: 'pg-tabs' });

		const contentContainer = this.mainEl.createDiv();

		this.options.tabs.forEach((tab, index) => {
			const tabEl = tabContainer?.createDiv({ cls: 'pg-tab' });
			tabEl.createSpan({ text: tab.title });

			const contentEl = contentContainer.appendChild(tab.content);
			contentEl.addClass('pg-tabbed-content');
			tabEl.onClickEvent(() => this.switchActiveTab(tabEl, contentEl));

			if (index === 0) {
				this.switchActiveTab(tabEl, contentEl);
			}
		});
	}

	private switchActiveTab(
		newActiveTab: HTMLElement,
		newActiveContent: HTMLElement
	) {
		this.activeTab?.removeClass('is-active');
		this.activeContent?.removeClass('is-active');

		this.activeTab = newActiveTab;
		this.activeContent = newActiveContent;

		this.activeTab?.addClass('is-active');
		this.activeContent?.addClass('is-active');
	}
}

export interface TabGroupOptions {
	tabs: TabComponent[];
}
