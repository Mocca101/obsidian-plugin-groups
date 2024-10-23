<script lang="ts">
  import ObsToggle from "@/Components/BaseComponents/obs-toggle.svelte";
	import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
	import type { GroupStartupBehaviour, PluginGroup } from "@/DataStructures/PluginGroup";
	import { LucideCheck } from "lucide-svelte";
	import { Select } from "bits-ui";
	import { settingsStore } from "@/stores/main-store";
	import { scale } from "svelte/transition";
	import type { Selected } from "bits-ui";
	import ObsSlider from "@/Components/BaseComponents/obs-slider.svelte";
	import MultiSelectList from "@/Components/BaseComponents/multi-select-list.svelte";
	import ChipList from "@/Components/chip-list.svelte";

	export let groupToEdit: PluginGroup;

	const behaviourOptions: Array<Selected<GroupStartupBehaviour>> = [
		{ value: "none", label: "None" },
		{ value: "enable", label: "Enable" },
		{ value: "disable", label: "Disable" }
	];

	let startupBehaviourPortal: HTMLDivElement;

	$: selectedStartupBehaviour = behaviourOptions
		.find(behaviour => behaviour.value === groupToEdit.onStartupBehaviour)
		|| { value: "none", label: "None"	} as Selected<GroupStartupBehaviour>;

	const updateStartupBehaviour = (behaviour: Selected<GroupStartupBehaviour> | undefined) => {
		if(!behaviour) {
			groupToEdit.onStartupBehaviour = "none";
			return;
		}
		groupToEdit.onStartupBehaviour = behaviour.value;
	}

</script>


<div>
	<ObsidianSettingItem
		title="Commands"
		description="Add Commands to enable/disable this group"
	>
		<ObsToggle bind:value={groupToEdit.generateCommands} />
	</ObsidianSettingItem>
	<ObsidianSettingItem
		title="Auto Add"
		description="Automatically add new plugins to this group"
	>
		<ObsToggle bind:value={groupToEdit.autoAdd} />
	</ObsidianSettingItem>


	<ObsidianSettingItem title="Devices">
		<MultiSelectList
			title="Devices"
			bind:selectedElements={groupToEdit.assignedDevices}
			availableElements={$settingsStore.devices}
			selectTitle="Select Device(s)"
			class="pr-[var(--size-4-2)]"
		/>
		<div slot="description" class="flex items-center gap-1">
			<span>Active on: </span><ChipList bind:selectedElements={groupToEdit.assignedDevices} noSelectionText="All devices" />
		</div>

	</ObsidianSettingItem>

	<ObsidianSettingItem
		title="Behaviour on Startup"
	>
		<Select.Root items={behaviourOptions} portal={startupBehaviourPortal} selected={selectedStartupBehaviour} onSelectedChange={updateStartupBehaviour} >
			<Select.Trigger class="w-28">
				<Select.Value placeholder="Select startup behaviour" />
			</Select.Trigger>
			<div bind:this={startupBehaviourPortal} />
			<Select.Content
				class="menu"
				transition={scale}
				sideOffset={8}
			>
				{#each behaviourOptions as behaviour}
					<Select.Item
						class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-muted"
						value={behaviour.value}
						label={behaviour.label}
					>
						{behaviour.label}
						<Select.ItemIndicator class="ml-auto" asChild={false}>
							<LucideCheck size=12 />
						</Select.ItemIndicator>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</ObsidianSettingItem>

	{#if groupToEdit.onStartupBehaviour !== "none"}
		<ObsidianSettingItem
		title="Startup Delay"
			description={`Delay this group by ${groupToEdit.delay}s`}
		>
			<ObsSlider bind:value={groupToEdit.delay} tooltip={`${groupToEdit.delay}s`} />
		</ObsidianSettingItem>
	{/if}
	</div>
