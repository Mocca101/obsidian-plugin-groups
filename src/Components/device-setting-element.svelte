<script lang="ts">
	import { type ButtonComponent, Setting } from "obsidian";
	import { onMount } from "svelte";
	import ConfirmationPopupModal from "./BaseComponents/ConfirmationPopupModal";
	import { currentDeviceStore, pluginInstance, settingsStore } from "@/stores/main-store";
	import ObsidianSettingItem from "./BaseComponents/obsidian-setting-item.svelte";
	import { LucideTrash2 } from "lucide-svelte";
	import ObsButton from "./BaseComponents/obs-button.svelte";

	let content: HTMLDivElement;

	export let device: string;

	let deviceSetting: Setting;
	let delteButton: ButtonComponent;
	let setCurrentButton: ButtonComponent;

	$: isCurrentDevice = $currentDeviceStore === device;

	$: deletionText = isCurrentDevice ? "This is the currently active device, are you sure?" : `You are about to delete: ${device}`;

	$: deletionFuntion = isCurrentDevice ? DeleteCurrentDevice : deleteDevice;

	const deleteDevice = () => {
		$settingsStore.devices = $settingsStore.devices.filter((d) => d !== device);
	}

	const createDeletionModal = () => new ConfirmationPopupModal(
			$pluginInstance.app,
			deletionText,
			void 0,
			"Delete",
			() => {
				deletionFuntion();
			}
		).open();

	function DeleteCurrentDevice() {
		const currentDevice: string | null = $currentDeviceStore;

		if (!currentDevice) return;
		$settingsStore.devices = $settingsStore.devices.filter((d) => d !== currentDevice);
		$currentDeviceStore = null;
	}

</script>
<ObsidianSettingItem name={device} description={isCurrentDevice ? 'Current Device' : ''}>
	{#if !isCurrentDevice}
		<ObsButton title="Set as Current" onClick={() => {$currentDeviceStore = device;}} />
	{/if}
	<ObsButton onClick={createDeletionModal} icon={LucideTrash2} />
</ObsidianSettingItem>
