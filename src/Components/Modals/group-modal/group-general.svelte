<script lang="ts">
	import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
  import ObsToggle from "@/Components/BaseComponents/obs-toggle.svelte";
	import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
	import type { PluginGroup } from "@/DataStructures/PluginGroup";
	import { LucideCheck, LucideCheckCircle, LucideCircle, LucideEdit3 } from "lucide-svelte";
	import { Popover, Select } from "bits-ui";
	import { settingsStore } from "@/stores/main-store";
	import { scale } from "svelte/transition";

	export let groupToEdit: PluginGroup;

	$: devicesList = $settingsStore.devices.map((device) => {
		return {
			name: device,
			selected: groupToEdit.assignedDevices?.includes(device),
		};
	});

	const toggleDevice = (device: string) => {
		if(groupToEdit.assignedDevices?.includes(device)){
			groupToEdit.assignedDevices = groupToEdit.assignedDevices?.filter((d) => d !== device);
		}else{
			groupToEdit.assignedDevices = groupToEdit.assignedDevices ? [...groupToEdit.assignedDevices, device] : [device];
		}
	}

	let selectBase: HTMLDivElement;

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

	<Select.Root multiple portal={selectBase}>
		<ObsidianSettingItem
		title="Devices"
	>
		<span slot="description">
			{#if groupToEdit.assignedDevices && groupToEdit.assignedDevices.length > 0}
				Active on:
					{#each groupToEdit.assignedDevices as device}
						<span class="tag">{device}</span>
					{/each}
			{:else}
				Active on all devices
			{/if}
		</span>
		<Select.Trigger
			aria-label="Select a Device"
		>
    	<Select.Value class="text-sm" placeholder="Select a Device" />
		</Select.Trigger>
	</ObsidianSettingItem>
	<div bind:this={selectBase} />
		<Select.Content
			class="menu"
			transition={scale}
			sideOffset={8}
		>
			{#each devicesList as device}
				<Select.Item
					class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-muted"
					value={device.selected}
					label={device.name}
				>
					{device.name}
					<Select.ItemIndicator class="ml-auto" asChild={false}>
						<LucideCheck />
					</Select.ItemIndicator>
				</Select.Item>
			{/each}
		</Select.Content>

	</Select.Root>

	<Popover.Root>
		<ObsidianSettingItem
			title="Devices"
		>
			<span slot="description">
				{#if groupToEdit.assignedDevices && groupToEdit.assignedDevices.length > 0}
					Active on:
						{#each groupToEdit.assignedDevices as device}
							<span class="tag">{device}</span>
						{/each}
				{:else}
					Active on all devices
				{/if}
			</span>
			<Popover.Trigger
				asChild
				let:builder
			>
				<div use:builder.action {...builder}>
					<ObsButton icon={LucideEdit3} tooltip="Open Device Picker" onClick={() => {}} />
				</div>
				</Popover.Trigger>
		</ObsidianSettingItem>
		<Popover.Content
			sideOffset={12}
			side="left"
			class="menu"
		>
			<div class="m-2">
				{#each devicesList as device}
					<ObsidianSettingItem title={device.name}>
						<ObsButton icon={device.selected ? LucideCheckCircle : LucideCircle} onClick={() => toggleDevice(device.name)} />
					</ObsidianSettingItem>
				{/each}
			</div>
			<Popover.Arrow />
		</Popover.Content>
	</Popover.Root>
</div>
