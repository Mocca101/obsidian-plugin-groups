import {PgPlugin} from "../PgPlugin";
import {ButtonComponent, Setting} from "obsidian";
import {PluginGroup} from "../PluginGroup";


export default class PluginList {

	pluginListEl: HTMLElement;

	private pluginListTarget: EventTarget = new EventTarget();

	private plugins: PgPlugin[];

	private ownerGroup?: PluginGroup;

	private parentEL: HTMLElement;

	constructor(parentEL: HTMLElement, pluginsToDisplay: PgPlugin[], ownerGroup?:PluginGroup, onListItemToggled?: (plugin: PgPlugin) => void) {
		this.plugins = pluginsToDisplay;
		this.ownerGroup = ownerGroup;
		this.parentEL = parentEL;
		if(ownerGroup && onListItemToggled) {
			this.pluginListTarget.addEventListener('listToggleClicked', (evt: CustomEvent) => {
				onListItemToggled(evt.detail)
			});
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

		this.plugins
			.forEach(plugin => {
				const setting = new Setting(this.pluginListEl)
					.setName(plugin.name);
				const btn: ButtonComponent = new ButtonComponent(setting.settingEl);
				this.setIconForPluginBtn(btn, plugin.id);
				if(this.ownerGroup) {
					btn.onClick(() => {
						this.pluginListTarget.dispatchEvent(new CustomEvent('listToggleClicked', {detail: plugin}));
						this.setIconForPluginBtn(btn, plugin.id);
					})
				}
			})
	}

	private setIconForPluginBtn(btn: ButtonComponent, pluginId: string) {
		if (!this.ownerGroup) { return; }

		btn.setIcon(this.ownerGroup.plugins.map(p => p.id).contains(pluginId) ? 'check-circle' : 'circle')
	}



}
