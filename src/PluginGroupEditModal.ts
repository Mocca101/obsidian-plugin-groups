import {App, Modal, Setting} from "obsidian";
import {PluginInfo} from "./Types";
import GroupSettingsTab from "./GroupSettingsTab";
import {getAllAvailablePlugins} from "./Utilities";
import ConfirmationPopupModal from "./ConfirmationPopupModal";
import PluginGroupsMain from "../main";
import {PluginGroup} from "./PluginGroup";
import {PgPlugin} from "./PgPlugin";

export default class PluginGroupEditModal extends Modal {

	groupToEdit: PluginGroup;

	settingsTab: GroupSettingsTab;

	plugin: PluginGroupsMain;

	availablePlugins: PgPlugin[];

	delayElement: Setting;
	selectionList: HTMLElement;
	pluginListElements : Map<string, Setting> = new Map<string, Setting>();



	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
		this.plugin = settingsTab.plugin;
		this.availablePlugins = getAllAvailablePlugins();
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl('h2', {text: 'Edit Group'});

		new Setting(contentEl)
			.setName('Name')
			.addText(txt => {
				txt.setValue(this.groupToEdit.name)
				txt.onChange(val => this.groupToEdit.name = val);
			})

		new Setting(contentEl)
			.setName('Startup Group')
			.addToggle(tgl => {
				tgl.onChange(value => {
					this.groupToEdit.enableAtStartup = value;
					if(this.delayElement) {
						value ? this.delayElement.settingEl.show() : this.delayElement.settingEl.hide();
					}
				});
				tgl.setValue(this.groupToEdit.enableAtStartup);
			});

		this.delayElement = new Setting(contentEl)
			.setName('Delay')
			.addSlider(slider => {
				slider.setValue(this.groupToEdit.delay);
				slider.setLimits(0, 20, 1)
				slider.onChange(value => {
					this.groupToEdit.delay = value;
					this.delayElement.setDesc(value.toString());
				})
			})
			.setDesc(this.groupToEdit.delay.toString());

		if(!this.groupToEdit.enableAtStartup) {
			this.delayElement.settingEl.hide();
		}

		new Setting(contentEl)
			.setName('Hide Plugin List')
			.addToggle(tgl => {
				tgl.onChange(value => {
					if(this.selectionList) {
						value ? this.selectionList.hide() : this.selectionList.show()
					}
				})
			})

		this.GenerateSelectionList(contentEl);

		this.GenerateFooter(contentEl);
	}

	private GenerateSelectionList(parentElement: HTMLElement) {

		this.selectionList = parentElement.createEl('div');

		this.selectionList.createEl('h5', {text: 'Plugins'})

		new Setting(this.selectionList)
			.setName('Search')
			.addText(txt => {
				txt.setPlaceholder('Search for Plugin...')
				txt.onChange(search => {
					this.searchPlugins(search);
				})
			})

		const pluginList = this.selectionList.createEl('div');
		pluginList.addClass('group-edit-modal-plugin-list');

		this.pluginListElements = new Map<string, Setting>();

		const includedPluginNames = (this.groupToEdit.plugins).map(p => p.name)

		this.sortPlugins(this.availablePlugins)
			.forEach(plugin => { const setting = new Setting(pluginList)
					.setName(plugin.name)
					.addToggle(tgl => {
						tgl.onChange(doInclude => {
							this.togglePluginForGroup(plugin, doInclude);
						})
						tgl.setValue(includedPluginNames.contains(plugin.name))
					});

				this.pluginListElements.set(plugin.id, setting);
		})
	}

	private searchPlugins(search: string) {
		const hits = this.availablePlugins
			.filter(p => p.name.toLowerCase().contains(search.toLowerCase()))
			.map(p => p.id);
		this.pluginListElements.forEach(plugin => plugin.settingEl.hide());
		hits.forEach(id => this.pluginListElements.get(id)?.settingEl.show());
	}

	private GenerateFooter(parentElement: HTMLElement) {
		const footer = parentElement.createEl('div');

		footer.addClass('group-edit-modal-footer');

		new Setting(footer)
			.addButton(btn => {
				btn.setButtonText('Delete');
				btn.onClick(() => new ConfirmationPopupModal(this.app,
					'You are about to delete: ' + this.groupToEdit.name,
					void 0,
					'Delete',
					() => this.deleteGroup()).open());
			})
			.addButton(btn => {
				btn.setButtonText('Cancel');
				btn.onClick(() => this.close());
			})
			.addButton(btn => {
				btn.setButtonText('Save');
				btn.onClick(() => this.saveChanges());
			})
			.settingEl.addClass('modal-footer');
	}

	sortPlugins(plugins: PgPlugin[]) : PgPlugin[] {
		return plugins.sort((a, b) => {
			const aInGroup = this.isInGroup(a);
			const bInGroup = this.isInGroup(b);
			if(aInGroup && !bInGroup) return -1;
			else if(!aInGroup && bInGroup) return 1;
			else {
				return a.name.localeCompare(b.name);
			}
		})
	}

	isInGroup(plugin: PluginInfo) :boolean {
		return this.groupToEdit.plugins.map(p => p.id).contains(plugin.id);
	}

	togglePluginForGroup(plugin: PgPlugin, doInclude: boolean) {
		if(doInclude) {
			this.groupToEdit.addPgComponent(plugin);
		} else {
			this.groupToEdit.removePgComponent(plugin);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	async saveChanges() {
		if(this.plugin.settings.groupsMap.has(this.groupToEdit.id)) {
			await this.editGroup(this.groupToEdit);
		} else {
			await this.addGroup(this.groupToEdit)
		}
	}

	async addGroup(group: PluginGroup) {
		this.plugin.settings.groupsMap.set(group.id, group);

		this.plugin.addCommand({
			id: 'plugin-groups-enable'+group.id.toLowerCase(),
			name: 'Plugin Groups: Enable ' + group.name,
			icon: 'power',
			checkCallback: (checking: boolean) => {
				if(!this.plugin.settings.groupsMap.has(group.id)) return false;
				if(checking) return true;
				group.enable();

			}
		});

		this.plugin.addCommand({
			id: 'plugin-groups-disable'+group.id.toLowerCase(),
			name: 'Plugin Groups: Disable ' + group.name,
			icon: 'power-off',
			checkCallback: (checking: boolean) => {
				if(!this.plugin.settings.groupsMap.has(group.id)) return false;
				if(checking) return true;
				group.disable();
			}
		})

		await this.persistChangesAndClose();
	}

	async editGroup(group: PluginGroup) {
		this.plugin.settings.groupsMap.set(group.id, group);
		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		await this.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}


	async deleteGroup() {
		this.plugin.settings.groupsMap.delete(this.groupToEdit.id);
		await this.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}
}

