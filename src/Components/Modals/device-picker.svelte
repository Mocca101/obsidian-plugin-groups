<script lang="ts">
	import { settingsStore } from "@/stores/main-store";
	import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
	import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
	import { LucideCheckCircle, LucideCircle } from "lucide-svelte";
	import { createEventDispatcher } from "svelte";
	export let selectedDevices: Array<string> = [];

	const dispatch = createEventDispatcher();

	$: devicesList = $settingsStore.devices.map((device) => {
		return {
			name: device,
			selected: selectedDevices.includes(device),
		};
	});
	
	const toggleDevice = (device: string) => {
		if(selectedDevices.includes(device)){
			selectedDevices = selectedDevices.filter((d) => d !== device);
		}else{
			selectedDevices = [...selectedDevices, device];
		}
	}

</script>

<div>
	<h6>Existing Devices</h6>

	{#each devicesList as device}
		<ObsidianSettingItem title={device.name}>
			<ObsButton icon={device.selected ? LucideCheckCircle : LucideCircle} onClick={() => toggleDevice(device.name)} />
		</ObsidianSettingItem>

	{/each}
	

	<ObsidianSettingItem title="">
		<ObsButton title="Cancle" onClick={() => dispatch('close-modal')} on:close-modal={() => console.log('test')} />
		<ObsButton title="Confirm" onClick={() => {}} />
	</ObsidianSettingItem>

</div>
