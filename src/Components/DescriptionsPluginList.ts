import SettingsList from './BaseComponents/SettingsList';
import { PgPlugin } from '../DataStructures/PgPlugin';
import { Setting } from 'obsidian';

export default class DescriptionsPluginList extends SettingsList<
	PluginAndDesc,
	{ items: PluginAndDesc[] }
> {
	constructor(parentEL: HTMLElement, options: { items: PluginAndDesc[] }) {
		super(parentEL, options);
	}

	generateListItem(listEl: HTMLElement, plugin: PluginAndDesc): Setting {
		const item = new Setting(listEl).setName(plugin.plugin.name);
		if (plugin.description) {
			item.setDesc(plugin.description);
		}
		return item;
	}
}

export interface PluginAndDesc {
	plugin: PgPlugin;
	description?: string;
}
