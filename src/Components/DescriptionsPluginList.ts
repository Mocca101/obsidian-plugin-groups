import SettingsList from "./BaseComponents/SettingsList";
import {PgPlugin} from "../DataStructures/PgPlugin";
import {Setting} from "obsidian";

export default class DescriptionsPluginList extends SettingsList {

	constructor(parentEL: HTMLElement, pluginsToDisplay: PluginAndDesc[]) {
		super(parentEL, pluginsToDisplay);
	}


	override update(pluginsToDisplay: PluginAndDesc[]) {
		super.update(pluginsToDisplay);
	}

	generateListItem(listEl: HTMLElement, plugin: PluginAndDesc): Setting {
		const item = new Setting(listEl)
			.setName(plugin.plugin.name);
		if(plugin.description) {
			item.setDesc(plugin.description);
		}
		return item;
	}
}

export interface PluginAndDesc {
	plugin: PgPlugin,
	description?: string

}
