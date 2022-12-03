import {App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting} from 'obsidian';

// Remember to rename these classes and interfaces!


interface PluginInfo {
	id: string,
	name: string,
}

interface PluginGroup {
	name: string;
	plugins: PluginInfo[];
	active: boolean;
}

interface PluginGroupsSettings {

	groups: PluginGroup[];

}

const DEFAULT_SETTINGS: PluginGroupsSettings = {
	groups: []
}

export default class PluginGroupsMain extends Plugin {
	settings: PluginGroupsSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BasicGroupSettingsTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class PluginGroupEditModal extends Modal {
	availablePlugins: PluginInfo[];

	groupToEdit: PluginGroup;

	settingsTab: BasicGroupSettingsTab

	constructor(app: App, settingsTab: BasicGroupSettingsTab, availablePlugin: PluginInfo[], group: PluginGroup) {
		super(app);
		this.settingsTab = settingsTab;
		this.availablePlugins = availablePlugin;
		this.groupToEdit = group;
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.empty();

		contentEl.createEl('h2', {text: 'Creating group: ' +  this.groupToEdit.name});


		this.availablePlugins.forEach(info => {
			new Setting(contentEl)
				.setName(info.name)
				.addToggle(tgl => {
					tgl.onChange(doInclude => {
						this.togglePluginForGroup(info, doInclude);
					})
					tgl.setValue(this.groupToEdit.plugins.contains(info))
				})
		})

		new Setting(contentEl).addButton(btn => {
			btn.setButtonText('Cancel');
			btn.onClick(() => this.close());
		})
		new Setting(contentEl).addButton(btn => {
			btn.setButtonText('Save');
			btn.onClick(() => this.saveAndClose());
		})
	}

	async saveAndClose() {
		await this.saveChanges();
		this.close();
	}

	togglePluginForGroup(plugin: PluginInfo, doInclude: boolean) {

		if(doInclude) {
			if(this.groupToEdit.plugins.contains(plugin))	return;

			this.groupToEdit.plugins.push(plugin);
		}
		else {
			if(!this.groupToEdit.plugins.contains(plugin)) return;

			this.groupToEdit.plugins.remove(plugin);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	async saveChanges() {
		this.settingsTab.plugin.settings.groups.push(this.groupToEdit);

		await this.settingsTab.plugin.saveSettings();
		this.settingsTab.display();
	}
}

class BasicGroupSettingsTab extends PluginSettingTab {
	plugin: PluginGroupsMain;

	newGroupName: string;

	availablePlugins: PluginInfo[];


	constructor(app: App, plugin: PluginGroupsMain) {
		super(app, plugin);
		this.plugin = plugin;
		this.loadAvailablePlugins();

	}

	display(): void {
		this.loadAvailablePlugins();

		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h5', {text: 'Groups'});

		new Setting(containerEl)
			.setName('Groups')
			.setDesc('Your plugin Groups')
			.addText(text => text
				.setPlaceholder('Group name')
				.onChange(val => {
					this.newGroupName = val;
				})
			)
			.addButton(btn => btn
				.setIcon('plus')
				.onClick(() => this.addNewGroup())
				)

		for (let i = 0; i < this.plugin.settings.groups.length; i++) {
			const group = this.plugin.settings.groups[i];

			new Setting(containerEl)
				.setName(group.name)
				.addToggle(tgl => {
					tgl.setValue(group.active);
					tgl.onChange(() => this.toggleGroup(i))
				})
				.addButton(btn => {
					btn.setIcon('minus')
					btn.onClick(() => this.removeGroup(group))
				})
		}

	}

	async toggleGroup(groupID: number) {
		this.plugin.settings.groups[groupID].active = !this.plugin.settings.groups[groupID].active;
		await this.plugin.saveSettings();
		this.display();
	}

	async addNewGroup() {

		const newGroup: PluginGroup = {
			name: this.newGroupName,
			plugins: [],
			active: false
		};

		new PluginGroupEditModal(this.app, this, this.availablePlugins, newGroup).open();


		this.newGroupName = '';
	}

	async removeGroup(group: PluginGroup) {
		this.plugin.settings.groups.remove(group);

		console.log('Removed group', group);

		await this.plugin.saveSettings();
		this.display();
	}

	loadAvailablePlugins() {
		// @ts-ignore
		const manifests = this.app.plugins.manifests;

		const plugins: PluginInfo[] = [];


		for(const manifest in manifests) {
			const info: PluginInfo = {
				id: manifests[manifest].id,
				name: manifests[manifest].name,
			}
			plugins.push(info)
		}

		this.availablePlugins = plugins;
	}

}
