import { PluginGroup } from '../DataStructures/PluginGroup';
import RemovableChip from './RemovableChip';

export default class FilteredGroupsList {
	private parentEl: HTMLElement;

	listEL: HTMLElement;

	private groups: Map<string, PluginGroup>;
	private onChipClosed: () => void;

	constructor(
		parentEl: HTMLElement,
		groups: Map<string, PluginGroup>,
		onChipClosed: () => void
	) {
		this.groups = groups;
		this.parentEl = parentEl;
		this.onChipClosed = onChipClosed;

		this.render();
	}

	public update(groups: Map<string, PluginGroup>) {
		console.log('-> Updating list');
		this.listEL.remove();
		this.groups = groups;
		this.render();
	}

	private render() {
		this.listEL = this.parentEl.createDiv({ cls: 'pg-group-filter-list' });
		this.listEL.createSpan({ text: 'Filters:' });

		this.groups.forEach((group) => {
			new RemovableChip(this.listEL, {
				label: group.name,
				onClose: () => {
					this.groups.delete(group.id);
					this.onChipClosed();
				},
			});
		});
	}
}
