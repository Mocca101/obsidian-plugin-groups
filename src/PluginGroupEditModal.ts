import {App, Modal, SearchComponent, Setting} from "obsidian";
import {PluginGroup, PluginInfo} from "./Types";
import GroupSettingsTab from "./GroupSettingsTab";
import {disablePluginsOfGroup, enablePluginsOfGroup, getAllAvailablePlugins} from "./Utilities";
import ConfirmationPopupModal from "./ConfirmationPopupModal";
import PluginGroupsMain from "../main";

export default class PluginGroupEditModal extends Modal {

	groupToEdit: PluginGroup;

	settingsTab: GroupSettingsTab;

	plugin: PluginGroupsMain;

	pluginToggleIds: string[];


	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
		this.plugin = settingsTab.plugin;
		this.pluginToggleIds = [];
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


		const plugins = contentEl.createEl('div');

		plugins.createEl('h5', { text: 'Plugins'})

		new Setting(plugins)
			.setName('Search')
			.addText(txt => {
				txt.setPlaceholder('Search for Plugin...')
				txt.onChange(search => {
					const hits = this.pluginToggleIds.filter(el => el.contains(search));
					this.pluginToggleIds.forEach(id => contentEl.find('#' + id).hide());
					hits.forEach(id => contentEl.find('#'+id).show());
				})
			})

		const pluginList = plugins.createEl('div');
		pluginList.addClass('group-edit-modal-plugin-list');


		const includedPluginNames = (this.groupToEdit.plugins).map(p => p.name)

		this.sortPlugins(getAllAvailablePlugins()).forEach(plugin => {
			new Setting(pluginList)
				.setName(plugin.name)
				.addToggle(tgl => {
					tgl.onChange(doInclude => {
						this.togglePluginForGroup(plugin, doInclude);
					})
					tgl.setValue(includedPluginNames.contains(plugin.name))
				})
				.settingEl.id = plugin.id;
			this.pluginToggleIds.push(plugin.id)
		})

		const footer = contentEl.createEl('div');

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

	sortPlugins(plugins: PluginInfo[]) : PluginInfo[] {
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

	togglePluginForGroup(plugin: PluginInfo, doInclude: boolean) {
		const pluginIds: string[] = this.groupToEdit.plugins.map(p => p.id);

		const pluginInd = pluginIds.indexOf(plugin.id)

		if(doInclude) {
			if(pluginInd !== -1) return;
			this.groupToEdit.plugins.push(plugin);
		}
		else {
			if(pluginInd === -1) return;
			this.groupToEdit.plugins.splice(pluginInd, 1);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	async saveChanges() {
		const groupNames = this.plugin.settings.groups.map(g => g.name);
		const groupInd = groupNames.indexOf(this.groupToEdit.name);

		if(groupInd === -1) {
			await this.addGroup(this.groupToEdit)
		} else {
			await this.editGroup(groupInd);
		}
	}

	async addGroup(group: PluginGroup) {
		this.plugin.settings.groups.push(group);

		this.plugin.addCommand({
			id: 'plugin-groups-enable'+group.name.toLowerCase(),
			name: 'Plugin Groups: Enable ' + group.name,
			icon: 'power',
			checkCallback: (checking: boolean) => {
				if(!this.plugin.settings.groups.map(g => g.name).contains(group.name)) return false;
				if(checking) return true;
				enablePluginsOfGroup(group);

			}
		});

		this.plugin.addCommand({
			id: 'plugin-groups-disable'+group.name.toLowerCase(),
			name: 'Plugin Groups: Disable ' + group.name,
			icon: 'power-off',
			checkCallback: (checking: boolean) => {
				if(!this.plugin.settings.groups.map(g => g.name).contains(group.name)) return false;
				if(checking) return true;
				disablePluginsOfGroup(group);
			}
		})

		await this.persistChangesAndClose();
	}

	async editGroup(groupIndex: number) {
		this.plugin.settings.groups[groupIndex] = this.groupToEdit;
		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		await this.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}


	async deleteGroup() {
		this.plugin.settings.groups.remove(this.groupToEdit);
		await this.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}
}

