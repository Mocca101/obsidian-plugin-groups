import type { Setting } from "obsidian";
import type { PgPlugin } from "../DataStructures/PgPlugin";
import ReorderableList from "./BaseComponents/ReorderableList";

export default class ReorderablePluginList extends ReorderableList<
	PgPlugin,
	{ items: PgPlugin[] }
> {
	generateListItem(listEl: HTMLElement, item: PgPlugin): Setting {
		const itemEl = super.generateListItem(listEl, item).setName(item.name);

		return itemEl;
	}
}
