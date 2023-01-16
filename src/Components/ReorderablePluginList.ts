import ReorderableList from "./BaseComponents/ReorderableList";
import {Setting} from "obsidian";
import {PgPlugin} from "../PgPlugin";

export default class ReorderablePluginList extends ReorderableList {

	generateListItem(listEl: HTMLElement, item: PgPlugin): Setting {
		const itemEl = super.generateListItem(listEl, item)
			.setName(item.name);

		return itemEl;
	}

}
