<script lang="ts">
	import Manager from "@/Managers/Manager";
	import { getCurrentlyActiveDevice, setCurrentlyActiveDevice } from "@/Utils/Utilities";
	import { Setting } from "obsidian";
	import { onMount } from "svelte";
	import ConfirmationPopupModal from "./BaseComponents/ConfirmationPopupModal";
	
	let content: HTMLDivElement;

	export let device: string;

	onMount(() => {
		if(!content) return;

		const deviceSetting = new Setting(content).setName(device);
			if (getCurrentlyActiveDevice() === device) {
				deviceSetting.setDesc("Current Device").addButton((btn) => {
					btn.setIcon("trash");
					btn.onClick(() =>
						new ConfirmationPopupModal(
							Manager.getInstance().pluginInstance.app,
							"This is the currently active device, are you sure?",
							void 0,
							"Delete",
							() => {
								ResetCurrentDevice();
							}
						).open()
					);
				});
			} else {
				deviceSetting
					.addButton((btn) => {
						btn.setButtonText("Set as Current");
						btn.onClick(() => {
							setCurrentlyActiveDevice(device);
							// this.display();
						});
					})
					.addButton((btn) => {
						btn.setIcon("trash");
						btn.onClick(() =>
							new ConfirmationPopupModal(
								Manager.getInstance().pluginInstance.app,
								`You are about to delete: ${device}`,
								void 0,
								"Delete",
								async () => {
									Manager.getInstance().devices.remove(device);
									await Manager.getInstance().saveSettings();
									// this.display();
								}
							).open()
						);
					});
			}
	});

	function ResetCurrentDevice() {
		const device: string | null = getCurrentlyActiveDevice();

		if (!device) {
			return;
		}
		Manager.getInstance().devices.remove(device);
		setCurrentlyActiveDevice(null);
		// this.display();
	}

</script>
<div bind:this={content} />
