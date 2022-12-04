import {App, Modal, Setting} from "obsidian";
import {PluginGroup, PluginInfo} from "./Types";
import GroupSettingsTab from "./GroupSettingsTab";
import {getAllAvailablePlugins} from "./Utilities";
import ConfirmationPopupModal from "./ConfirmationPopupModal";

export default class PluginGroupEditModal extends Modal {
	availablePlugins: PluginInfo[];

	groupToEdit: PluginGroup;

	settingsTab: GroupSettingsTab;


	constructor(app: App, settingsTab: GroupSettingsTab, group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.groupToEdit = group;
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
		const includedPluginNames = (this.groupToEdit.plugins).map(p => p.name)

		getAllAvailablePlugins().forEach(info => {
			new Setting(contentEl)
				.setName(info.name)
				.addToggle(tgl => {
					tgl.onChange(doInclude => {
						this.togglePluginForGroup(info, doInclude);
					})
					tgl.setValue(includedPluginNames.contains(info.name))
				})
		})

		new Setting(contentEl)
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

	}

	togglePluginForGroup(plugin: PluginInfo, doInclude: boolean) {

		const pluginIds: string[] = this.groupToEdit.plugins.map(p => p.id);

		const pluginInd = pluginIds.indexOf(plugin.id)

		if(doInclude) {
			if(pluginInd !== -1)	return;

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
		const groupNames = this.settingsTab.plugin.settings.groups.map(g => g.name);
		const groupInd = groupNames.indexOf(this.groupToEdit.name);

		if(groupInd === -1) {
			this.settingsTab.plugin.settings.groups.push(this.groupToEdit);
			await this.persistChangesAndClose();
		} else {
/*			const modal = new ConfirmationPopupModal(
				this.app,
				'Save Changes to: ' + this.groupToEdit.name,
				void 0,
				'Save',
				() => this.editGroup(groupInd))
			modal.open();*/
			await this.editGroup(groupInd);
		}
	}

	async editGroup(groupIndex: number) {
		this.settingsTab.plugin.settings.groups[groupIndex] = this.groupToEdit;

		await this.persistChangesAndClose();
	}

	async persistChangesAndClose() {
		await this.settingsTab.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}


	async deleteGroup() {
		this.settingsTab.plugin.settings.groups.remove(this.groupToEdit);
		await this.settingsTab.plugin.saveSettings();
		this.settingsTab.display();
		this.close();
	}
}

