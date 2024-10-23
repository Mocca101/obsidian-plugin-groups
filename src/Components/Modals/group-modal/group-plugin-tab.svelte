<script lang="ts">
import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
import type { PgPlugin } from "@/DataStructures/PgPlugin";
import type { PluginGroup } from "@/DataStructures/PluginGroup";
import { availablePlugins as allPlugins, pluginsGroupMap, settingsStore } from "@/stores/main-store";

import { LucideCheckCircle, LucideCircle } from "lucide-svelte";
import MultiSelectList from "@/Components/BaseComponents/multi-select-list.svelte";
import SettingsGroup from "@/Components/Settings/settings-group.svelte";
import ObsText from "@/Components/BaseComponents/obs-text.svelte";
import ChipList from "@/Components/chip-list.svelte";

type SelectableGroup = Pick<PluginGroup, "id" | "name">;
type PluginWithGroups = PgPlugin & { groups: Array<PluginGroup> };

export let groupToEdit: PluginGroup;

const allGroups: Array<SelectableGroup> = Array.from($settingsStore.groupsMap.values()).map(g => ({ id: g.id, name: g.name }));

// ==============================
// 				Helper Functions
// ==============================

const toPluginWithGroups = (plugin: PgPlugin) => {
	return {
		...plugin,
		groups: Array.from($pluginsGroupMap.get(plugin.id) ?? [])
			.reduce((acc, g) => {
				const group = $settingsStore.groupsMap.get(g);
				if(group) acc.push(group);
				return acc;
			}, [] as Array<PluginGroup>)
	}
}

// ==============================
// 				Group Editing
// ==============================

const addPluginToGroup = (plugin: PgPlugin) => {
	groupToEdit.plugins = [...groupToEdit.plugins, plugin];
}

const removePluginFromGroup = (plugin: PgPlugin) => {
	groupToEdit.plugins = groupToEdit.plugins.filter(p => p.id !== plugin.id);
}

// ==============================
// 				Filtering
// ==============================

// biome-ignore lint/style/useConst: Reassigned through binding
let pluginNameFilter = "";

const filterPlugins = (
		plugins: Array<PluginWithGroups>,
		filterGroups: Array<SelectableGroup>,
		nameFilter: string,
	) => {
	if(filterGroups.length === 0 && nameFilter.length === 0) return plugins;

	const includedFilterIds = filterGroups.map(g => g.id);

	return plugins
		// Filter by Name
		.filter(plugin => plugin.name.toLowerCase().includes(nameFilter.toLowerCase()))
		// Filter out Group
		.filter(plugin => {
			return !includedFilterIds.some(id => plugin.groups.some(g => g.id === id));
		});
}

// biome-ignore lint/style/useConst: It is reassigned through binding
let filterGroups: Array<SelectableGroup> = [];

// ==============================
// 				Included Plugins
// ==============================

$: includedPlugins = groupToEdit.plugins.map(toPluginWithGroups);
$: filteredIncludedPlugins = filterPlugins(includedPlugins, filterGroups, pluginNameFilter);

// ==============================
// 				Available Plugins
// ==============================

$: availablePlugins = $allPlugins
		.filter(p => !groupToEdit.plugins.find(gp => gp.id === p.id))
		.map(toPluginWithGroups);

$: filteredAvailablePlugins = filterPlugins(availablePlugins, filterGroups, pluginNameFilter);

</script>


<SettingsGroup title="Filters" collapsibleOpen={false}>
	<ObsidianSettingItem title="Search Plugin">
		<ObsText bind:value={pluginNameFilter} placeholder="Enter Name..." />
	</ObsidianSettingItem>

	<div class="setting-item">
		<div class="flex gap-2">
			<MultiSelectList
				title="Groups"
				bind:selectedElements={filterGroups}
				availableElements={allGroups}
				selectTitle="Filter by Group"
				labelKey="name"
			/>
			<ChipList
				bind:selectedElements={filterGroups}
				labelKey="name"
				noSelectionText="None"
				/>
		</div>
		</div>
</SettingsGroup>


<SettingsGroup title="Included Plugins" >
		<div class="max-h-64 overflow-scroll">
		{#each filteredIncludedPlugins as plugin, i}
		<ObsidianSettingItem
			title={plugin.name}
			description={plugin.groups.map(g => g.name).join(", ")}
		>
			<ObsButton
				icon={LucideCheckCircle}
				onClick={() => removePluginFromGroup(plugin)} />
			</ObsidianSettingItem>
		{/each}
		{#if filteredIncludedPlugins.length === 0}
			<p>No Plugins in this Group or matching the filter criteria.</p>
		{/if}
	</div>
</SettingsGroup>


<SettingsGroup title="Available Plugins" >
	<div class="max-h-64 overflow-scroll">
		{#each filteredAvailablePlugins as plugin, i}
		<ObsidianSettingItem
			title={plugin.name}
			description={plugin.groups.map(g => g.name).join(", ")}
		>
			<ObsButton
				icon={LucideCircle}
				onClick={() => addPluginToGroup(plugin)} />
		</ObsidianSettingItem>
		{/each}
		{#if filteredAvailablePlugins.length === 0}
			<p>No Plugins available or matching the filter criteria.</p>
		{/if}
	</div>
</SettingsGroup>
