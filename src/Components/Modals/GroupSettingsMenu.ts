import HtmlComponent from "../BaseComponents/HtmlComponent";
import GroupSettings from "../Settings/GroupSettings";

type GroupSettingMenuOptions = {};

export default class GroupSettingsMenu extends HtmlComponent<GroupSettingMenuOptions> {
	constructor(parentEl: HTMLElement, options: GroupSettingMenuOptions) {
		super(parentEl, options);
		this.generateComponent();
	}

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv({ cls: "pg-settings-window" });
	}

	protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

		new GroupSettings(this.mainEl, { maxListHeight: 340 });

		this.updatePosition();
	}

	public updatePosition() {
		if (!this.mainEl) {
			return;
		}

		this.mainEl.style.transform = "translate(0px, 0px)";

		let xOffset = -this.mainEl.getBoundingClientRect().width / 2;
		const yOffset = -this.mainEl.clientHeight / 2 - 30;

		const diff =
			window.innerWidth - this.mainEl.getBoundingClientRect().right - 16;

		if (diff < 0) {
			xOffset = diff;
		}

		this.mainEl.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
	}
}
