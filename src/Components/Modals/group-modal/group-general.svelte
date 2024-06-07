<script lang="ts">
	import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
  import ObsToggle from "@/Components/BaseComponents/obs-toggle.svelte";
	import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
	import type { PluginGroup } from "@/DataStructures/PluginGroup";
	import { LucideEdit3 } from "lucide-svelte";
	import { SvelteModal } from "@/Components/Modals/svelte-modal";
	import DevicePicker from "@/Components/Modals/device-picker.svelte";

	export let groupToEdit: PluginGroup;


	$: isDeviceSpecific = groupToEdit.assignedDevices && groupToEdit.assignedDevices.length > 0;
	$: activeOn = isDeviceSpecific ? `Active on ${groupToEdit.assignedDevices?.join(", ")}` : "Active on all devices";

	function openDeviceModal() {
		new SvelteModal(DevicePicker, () => ({
		})).open();
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
		description={activeOn}>
		<ObsButton icon={LucideEdit3} onClick={openDeviceModal} tooltip="Open Device Picker" />
	</ObsidianSettingItem>
</div>
