import DescriptionsList, { ItemAndDescription } from './DescriptionsList';
import { Setting } from 'obsidian';
import PluginModal from './Modals/PluginModal';
import Manager from '../Managers/Manager';
import { PgPlugin } from '../DataStructures/PgPlugin';

export default class EditPluginList extends DescriptionsList<PgPlugin> {
	onEditFinished?: () => void;

	constructor(
		parentEL: HTMLElement,
		options: { items: ItemAndDescription<PgPlugin>[] },
		onEditFinished?: () => void
	) {
		super(parentEL, options);
		this.onEditFinished = onEditFinished;
	}

	override generateListItem(
		listEl: HTMLElement,
		plugin: ItemAndDescription<PgPlugin>
	): Setting {
		const item = super.generateListItem(listEl, plugin);

		item.addButton((btn) => {
			btn.setIcon('pencil');
			btn.onClick(() => {
				new PluginModal(
					Manager.getInstance().pluginInstance.app,
					plugin.item,
					() => {
						if (this.onEditFinished) {
							this.onEditFinished();
						}
					}
				).open();
			});
		});

		return item;
	}
}
