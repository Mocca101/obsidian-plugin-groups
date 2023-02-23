import HtmlComponent from '../BaseComponents/HtmlComponent';
import { Setting, TextComponent } from 'obsidian';
import Manager from '../../Managers/Manager';
import { makeCollapsible } from '../../Utils/Utilities';

export interface AdvancedSettingOptions {
	collapsible?: boolean;
}

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

		const header = this.mainEl.createEl('h5', {
			text: 'Advanced Settings',
		});

		const content = this.mainEl.createDiv();

		if (this.options.collapsible) {
			makeCollapsible(header, content);
		}

		new Setting(content).setName('Development Logs').addToggle((tgl) => {
			tgl.setValue(Manager.getInstance().devLog);
			tgl.onChange(async (value) => {
				Manager.getInstance().devLog = value;
				await Manager.getInstance().saveSettings();
			});
		});

		new Setting(content).setName('Load Synchronously').addToggle((tgl) => {
			tgl.setValue(Manager.getInstance().doLoadSynchronously);
			tgl.onChange(async (value) => {
				Manager.getInstance().doLoadSynchronously = value;
				await Manager.getInstance().saveSettings();
			});
		});
	}

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv();
	}
}
