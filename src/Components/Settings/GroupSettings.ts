import HtmlComponent from '../BaseComponents/HtmlComponent';
import { Setting, TextComponent } from 'obsidian';
import Manager from '../../Managers/Manager';
import { generateGroupID } from '../../Utils/Utilities';
import { PluginGroup } from '../../DataStructures/PluginGroup';
import GroupEditModal from '../../GroupEditModal';

export interface GroupSettingOptions {}

export default class GroupSettings extends HtmlComponent<GroupSettingOptions> {
	newGroupName: string;

	groupNameField: TextComponent;

	constructor(parentEL: HTMLElement, options: GroupSettingOptions) {
		super(parentEL, options);
		this.generateComponent();
	}

	protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

		this.mainEl.createEl('h5', { text: 'Groups' });

		let addBtnEl: HTMLButtonElement;

		new Setting(this.mainEl)
			.setName('Add Group')
			.addText((text) => {
				this.groupNameField = text;
				this.groupNameField
					.setPlaceholder('Enter group name...')
					.setValue(this.newGroupName)
					.onChange((val) => {
						this.newGroupName = val;
						if (addBtnEl) {
							val.replace(' ', '').length > 0
								? addBtnEl.removeClass('btn-disabled')
								: addBtnEl.addClass('btn-disabled');
						}
					}).inputEl.onkeydown = async (e) => {
					if (e.key === 'Enter') {
						await this.addNewGroup();
					}
				};
			})
			.addButton((btn) => {
				btn.setIcon('plus').onClick(() => this.addNewGroup());
				addBtnEl = btn.buttonEl;
				addBtnEl.addClass('btn-disabled');
			});

		this.GenerateGroupList(this.mainEl);
	}

	protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv();
	}

	GenerateGroupList(groupParent: HTMLElement) {
		Manager.getInstance().groupsMap.forEach((group) => {
			const groupSetting = new Setting(groupParent)
				.setName(group.name)
				.addButton((btn) => {
					btn.setButtonText('Enable');
					btn.setIcon('power');
					btn.onClick(async () => {
						await group.enable();
					});
					group.groupActive()
						? btn.buttonEl.removeClass('btn-disabled')
						: btn.buttonEl.addClass('btn-disabled');
				})
				.addButton((btn) => {
					btn.setButtonText('Disable');
					btn.setIcon('power-off');
					btn.onClick(() => group.disable());
					group.groupActive()
						? btn.buttonEl.removeClass('btn-disabled')
						: btn.buttonEl.addClass('btn-disabled');
				})
				.addButton((btn) => {
					btn.setIcon('pencil');
					btn.onClick(() => this.editGroup(group));
				});
			if (group.loadAtStartup) {
				const descFrag = new DocumentFragment();
				const startupEl = descFrag.createEl('span');
				startupEl.createEl('b', {
					text: 'Startup: ',
				});
				startupEl.createEl('span', {
					text: 'Delayed by ' + group.delay + ' seconds',
				});

				if (!group.groupActive()) {
					const activeEl = descFrag.createEl('span');
					activeEl.createEl('br');
					activeEl.createEl('b', { text: 'Inactive: ' });
					activeEl.createEl('span', {
						text: 'Not enabled for current Device',
					});
				}

				groupSetting.setDesc(descFrag);
			}
		});
	}

	async addNewGroup() {
		const id = generateGroupID(this.newGroupName);

		if (!id) {
			console.error(
				'Failed to create Group, please choose a different Name as there have been to many groups with the same name'
			);
			return;
		}

		const newGroup = new PluginGroup({
			id: id,
			name: this.newGroupName,
		});
		new GroupEditModal(
			Manager.getInstance().pluginInstance.app,
			this,
			newGroup
		).open();
		this.newGroupName = '';
		if (this.groupNameField) {
			this.groupNameField.setValue('');
		}
	}

	editGroup(group: PluginGroup) {
		new GroupEditModal(
			Manager.getInstance().pluginInstance.app,
			this,
			group
		).open();
	}
}
