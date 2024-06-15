<script lang="ts">
  import ObsToggle from "@/Components/BaseComponents/obs-toggle.svelte";
	import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
	import type { GroupStartupBehaviour, PluginGroup } from "@/DataStructures/PluginGroup";
	import { LucideCheck } from "lucide-svelte";
	import { Select } from "bits-ui";
	import { settingsStore } from "@/stores/main-store";
	import { scale } from "svelte/transition";
	import { type Selected } from "bits-ui";
	import ObsSlider from "@/Components/BaseComponents/obs-slider.svelte";

	export let groupToEdit: PluginGroup;

	$: selectedDevices = groupToEdit.assignedDevices?.map(device => ({
		value: device,
		label: device
	}));

	let deviceSelectPortal: HTMLDivElement;

	const updateDevices = (devices: Array<Selected<string>> | undefined) => {
		if(!devices) {
			groupToEdit.assignedDevices = [];
			return;
		}
		groupToEdit.assignedDevices = devices.map(device => device.value);
	}

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

	<ObsidianSettingItem
		title="Devices"
	>
		<span slot="description">
			Active on:
			{#if groupToEdit.assignedDevices && groupToEdit.assignedDevices.length > 0}
					{#each groupToEdit.assignedDevices as device}
						<span class="px-1 mr-1 border border-solid rounded">{device}</span>
					{/each}
			{:else}
				<span class="px-1 mr-1 border border-solid rounded">
					All devices
				</span>
			{/if}
		</span>
		<Select.Root multiple portal={deviceSelectPortal} selected={selectedDevices} onSelectedChange={updateDevices} >
			<Select.Trigger>
				Select a Device
			</Select.Trigger>
			<div bind:this={deviceSelectPortal} />
			<Select.Content
				class="menu"
				transition={scale}
				sideOffset={8}
			>
				{#each $settingsStore.devices as device}
					<Select.Item
						class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-muted"
						value={device}
						label={device}
					>
						{device}
						<Select.ItemIndicator class="ml-auto" asChild={false}>
							<LucideCheck size=12 />
						</Select.ItemIndicator>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
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
