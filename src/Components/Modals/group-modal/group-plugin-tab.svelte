<script lang="ts">
import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
import type { PgPlugin } from "@/DataStructures/PgPlugin";
import type { PluginGroup } from "@/DataStructures/PluginGroup";
import { availablePlugins as allPlugins, pluginsGroupMap, settingsStore } from "@/stores/main-store";
import { DropdownMenu } from "bits-ui";
import { LucideCheckCircle, LucideCircle, LucideFilter } from "lucide-svelte";
import MultiSelectList from "@/Components/BaseComponents/multi-select-list.svelte";
	import SettingsGroup from "@/Components/Settings/settings-group.svelte";

type SelectableGroup = Pick<PluginGroup, "id" | "name">;
type PluginWithGroups = PgPlugin & { groups: Array<PluginGroup> };

export let groupToEdit: PluginGroup;

let dropdownTarget: HTMLDivElement;

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

const filterPlugins = (plugins: Array<PluginWithGroups>, includedGroups: Array<SelectableGroup>, excludedGroups: Array<SelectableGroup>) => {
	if(includedGroups.length === 0 && excludedGroups.length === 0) return plugins;

	const includedFilterIds = includedGroups.map(g => g.id);
	const excludedFilterIds = excludedGroups.map(g => g.id);

	return plugins
		// Included
		.filter(plugin => includedFilterIds.every(id => plugin.groups.some(g => g.id === id)))
		// Ecxluded
		.filter(plugin => !excludedFilterIds.some(id => plugin.groups.some(g => g.id === id)));
}

// biome-ignore lint/style/useConst: It is reassigned through binding
let includeGroups: Array<SelectableGroup> = [];
// biome-ignore lint/style/useConst: It is reassigned through binding
let excludeGroups: Array<SelectableGroup> = []; // TODO: Implement Excluded Groups

// ==============================
// 				Included Plugins
// ==============================

$: includedPlugins = groupToEdit.plugins.map(toPluginWithGroups);
$: filteredIncludedPlugins = filterPlugins(includedPlugins, includeGroups, excludeGroups);

// ==============================
// 				Available Plugins
// ==============================

$: availablePlugins = $allPlugins
		.filter(p => !groupToEdit.plugins.find(gp => gp.id === p.id))
		.map(toPluginWithGroups);

$: filteredAvailablePlugins = filterPlugins(availablePlugins, includeGroups, excludeGroups);



</script>

<!-- Search (filter list by entered text)-->
<!-- Select to Filter out by groups (which groups already have the plugin) -->
	 <!-- Chip list with the selected groupfilters -->
<!-- Select for Sort -->



<SettingsGroup title="Filters" collapsibleOpen={false}>
	<div class="flex gap-2" >
		<MultiSelectList
			class="w-36"
			title="Include:"
			bind:selectedElements={includeGroups}
			availableElements={allGroups}
			labelKey="name"
			noSelectionText="No Group selected"
			/>

		<MultiSelectList
			class="w-36"
			title="Exclude:"
			bind:selectedElements={excludeGroups}
			availableElements={allGroups}
			labelKey="name"
			noSelectionText="No Group selected"
			/>
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
