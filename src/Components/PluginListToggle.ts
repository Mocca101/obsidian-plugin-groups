import { PgPlugin } from '../DataStructures/PgPlugin';
import { ButtonComponent, Setting } from 'obsidian';
import { PluginGroup } from '../DataStructures/PluginGroup';

export default class PluginListToggle {
	pluginListEl: HTMLElement;

	private pluginListTarget: EventTarget = new EventTarget();

	private plugins: PgPlugin[];

	private ownerGroup?: PluginGroup;

	private parentEL: HTMLElement;

	constructor(
		parentEL: HTMLElement,
		pluginsToDisplay: PgPlugin[],
		actionOption?: ActionOption
	) {
		this.plugins = pluginsToDisplay;
		this.parentEL = parentEL;

		if (actionOption) {
			this.ownerGroup = actionOption?.group;

			this.pluginListTarget.addEventListener(
				'listToggleClicked',
				(evt: CustomEvent) => {
					actionOption.onClickAction(evt.detail);
				}
			);
		}
		this.generateList();
	}

	public updateList(pluginsToDisplay: PgPlugin[]) {
		this.plugins = pluginsToDisplay;
		this.render();
	}

	public render() {
		this.pluginListEl.remove();
		this.generateList();
	}

	private generateList() {
		this.pluginListEl = this.parentEL.createEl('div');
		this.pluginListEl.addClass('group-edit-modal-plugin-list');

		this.plugins.forEach((plugin) => {
			const setting = new Setting(this.pluginListEl).setName(plugin.name);
			if (this.ownerGroup) {
				const btn: ButtonComponent = new ButtonComponent(
					setting.settingEl
				);
				this.setIconForPluginBtn(btn, plugin.id);
				btn.onClick(() => {
					this.pluginListTarget.dispatchEvent(
						new CustomEvent('listToggleClicked', { detail: plugin })
					);
					this.setIconForPluginBtn(btn, plugin.id);
				});
			}
		});
	}

	private setIconForPluginBtn(btn: ButtonComponent, pluginId: string) {
		if (!this.ownerGroup) {
			return;
		}

		btn.setIcon(
			this.ownerGroup.plugins.map((p) => p.id).contains(pluginId)
				? 'check-circle'
				: 'circle'
		);
	}
}

interface ActionOption {
	group: PluginGroup;
	onClickAction: (plugin: PgPlugin) => void;
}
