import HtmlComponent from '../BaseComponents/HtmlComponent';
import { Setting, TextComponent } from 'obsidian';
import Manager from '../../Managers/Manager';

export interface AdvancedSettingOptions {}

export default class AdvancedSettings extends HtmlComponent<AdvancedSettingOptions> {
	newGroupName: string;

	groupNameField: TextComponent;

	constructor(parentEL: HTMLElement, options: AdvancedSettingOptions) {
		super(parentEL, options);
		this.generateComponent();
	}

	protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

		this.mainEl.createEl('h5', { text: 'Advanced Settings' });

		new Setting(this.mainEl)
			.setName('Development Logs')
			.addToggle((tgl) => {
				tgl.setValue(Manager.getInstance().devLog);
				tgl.onChange((value) => {
					Manager.getInstance().devLog = value;
					Manager.getInstance().saveSettings();
				});
			});

		new Setting(this.mainEl)
			.setName('Load Synchronously')
			.addToggle((tgl) => {
				tgl.setValue(Manager.getInstance().doLoadSynchronously);
				tgl.onChange((value) => {
					Manager.getInstance().doLoadSynchronously = value;
					Manager.getInstance().saveSettings();
				});
			});
	}

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv();
	}
}
