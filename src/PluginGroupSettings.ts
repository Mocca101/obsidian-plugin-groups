import GroupSettings from "@/Components/Settings/GroupSettings";
import PluginSettings from "@/Components/Settings/PluginsSettings";
import {
	PluginSettingTab,
} from "obsidian";

import MainSettings from "@/Components/Settings/main-settings.svelte"
import { loadNewPlugins } from "./Utils/plugin-utils";

export default class PluginGroupSettings extends PluginSettingTab {
	async display(): Promise<void> {
		await loadNewPlugins();

		const { containerEl } = this;

		containerEl.empty();

		const target = containerEl.createDiv();

		const svelteBaseComponent = new MainSettings({target})


		new GroupSettings(containerEl, {
			collapsible: true,
			startOpened: true,
		});

		new PluginSettings(containerEl, { collapsible: true });
	}

}
