import AdvancedSettings from "@/Components/Settings/AdvancedSettings";
import GroupSettings from "@/Components/Settings/GroupSettings";
import PluginSettings from "@/Components/Settings/PluginsSettings";
import PluginManager from "@/Managers/PluginManager";
import {
	PluginSettingTab,
} from "obsidian";

import MainSettings from "@/Components/Settings/main-settings.svelte"

export default class PluginGroupSettings extends PluginSettingTab {
	async display(): Promise<void> {
		await PluginManager.loadNewPlugins();

		const { containerEl } = this;

		containerEl.empty();

		const target = containerEl.createDiv();

		const svelteBaseComponent = new MainSettings({target})


		new GroupSettings(containerEl, {
			collapsible: true,
			startOpened: true,
		});

		new PluginSettings(containerEl, { collapsible: true });

		new AdvancedSettings(containerEl, { collapsible: true });
	}

}
