<script lang="ts">
import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
import type { PgPlugin } from "@/DataStructures/PgPlugin";
import type { PluginGroup } from "@/DataStructures/PluginGroup";
import { availablePlugins, pluginsGroupMap, settingsStore } from "@/stores/main-store";
import { DropdownMenu } from "bits-ui";
import { LucideCheckCircle, LucideCircle, LucideFilter } from "lucide-svelte";


export let groupToEdit: PluginGroup;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ExtendedPgPlugin = PgPlugin & { isSelected: boolean, icon: any, groups?: string };

$: includedPlugins = groupToEdit.plugins;
$: nonIncludedPlugins = $availablePlugins.filter(p => !groupToEdit.plugins.find(gp => gp.id === p.id));

const groupsOfPlugin = (plugin: PgPlugin) =>
	Array.from($pluginsGroupMap.get(plugin.id) ?? [])
	.map(g => $settingsStore.groupsMap.get(g)?.name)
	.join(", ");

const addPluginToGroup = (plugin: PgPlugin) => {
	groupToEdit.plugins = [...groupToEdit.plugins, plugin];
}

const removePluginFromGroup = (plugin: PgPlugin) => {
	groupToEdit.plugins = groupToEdit.plugins.filter(p => p.id !== plugin.id);
}

let dropdownTarget: HTMLDivElement;

</script>

<!-- Search (filter list by entered text)-->
<!-- Select to Filter out by groups (which groups already have the plugin) -->
	 <!-- Chip list with the selected groupfilters -->
<!-- Select for Sort -->

<!-- Bulk Actions Button (or select) De-/Select all -->

<ObsidianSettingItem title="">

	<div bind:this={dropdownTarget} />

	<DropdownMenu.Root portal={dropdownTarget}>
		<DropdownMenu.Trigger>
			<LucideFilter size="12" />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content
				class="menu p-4"
				sideOffset={8}>
			<DropdownMenu.Item class="
				flex h-10 select-none
				items-center
				px-3 rounded-lg
				text-sm font-medium
				data-[highlighted]:bg-[var(--interactive-hover)]
				">
				Select All
			</DropdownMenu.Item>
			<DropdownMenu.Separator />

			<DropdownMenu.Item class="
				flex h-10 select-none
				items-center
				px-3 rounded-lg
				text-sm font-medium
				data-[highlighted]:bg-[var(--interactive-hover)]
				">
				Deselect All
			</DropdownMenu.Item>

		</DropdownMenu.Content>
	</DropdownMenu.Root>
</ObsidianSettingItem>


<h4>Included Plugins</h4>

<div class="max-h-64 overflow-scroll">
	{#each includedPlugins as plugin, i}
	<ObsidianSettingItem
		title={plugin.name}
		description={groupsOfPlugin(plugin)}
	>
		<ObsButton
			icon={LucideCheckCircle}
			onClick={() => removePluginFromGroup(plugin)} />
		</ObsidianSettingItem>
	{/each}
</div>

<h4>Available Plugins </h4>
<div class="max-h-64 overflow-scroll">
	{#each nonIncludedPlugins as plugin, i}
	<ObsidianSettingItem
		title={plugin.name}
		description={groupsOfPlugin(plugin)}
	>
		<ObsButton
			icon={LucideCircle}
			onClick={() => addPluginToGroup(plugin)} />
	</ObsidianSettingItem>
	{/each}
</div>
