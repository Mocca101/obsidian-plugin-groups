import GroupSettings from '../Settings/GroupSettings';
import HtmlComponent from '../BaseComponents/HtmlComponent';

interface GroupSettingMenuOptions {}

export default class GroupSettingsMenu extends HtmlComponent<GroupSettingMenuOptions> {
	constructor(parentEl: HTMLElement, options: GroupSettingMenuOptions) {
		super(parentEl, options);
		this.generateComponent();
	}

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv({ cls: 'pg-settings-window' });
		const parentRect = this.parentEl.getBoundingClientRect();
		this.mainEl.style.bottom =
			window.innerHeight - parentRect.top + 10 + 'px';
		this.mainEl.style.right =
			window.innerWidth - parentRect.right + 10 + 'px';
	}

	protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

		new GroupSettings(this.mainEl, {});
	}
}
