import { PluginGroup } from "@/DataStructures/PluginGroup";
import { pluginInstance, settingsStore } from "@/stores/main-store";
import { get } from "svelte/store";
import type { PersistentSettings } from "@/Utils/Types";

export async function loadSettings() {
	const savedSettings: PersistentSettings = await get(pluginInstance).loadData();

	if (!savedSettings) {
		return;
	}

	settingsStore.update((s) => {
		for (const key in s) {
			if (key in savedSettings) {
				// @ts-ignore
				s[key] = savedSettings[key];
			}
		}

		if(!savedSettings.groups || !Array.isArray(savedSettings.groups)) return s;

		s.groupsMap = new Map<string, PluginGroup>();
		for (const g of savedSettings.groups) {
			s.groupsMap.set(g.id, new PluginGroup(g));
		}

		return s;
	});
}
