<script lang="ts">
	import { type ButtonComponent, Setting } from "obsidian";
	import { onMount } from "svelte";
	import ConfirmationPopupModal from "./BaseComponents/ConfirmationPopupModal";
	import { currentDeviceStore, pluginInstance, settingsStore } from "@/stores/main-store";

	let content: HTMLDivElement;

	export let device: string;

	let deviceSetting: Setting;
	let delteButton: ButtonComponent;
	let setCurrentButton: ButtonComponent;

	function updateDevice() {
		if(!deviceSetting) return;

		if(!setCurrentButton) {
			deviceSetting.addButton((btn) => {
				setCurrentButton = btn;
				setCurrentButton.setButtonText("Set as Current");
				setCurrentButton.onClick(() => {
						$currentDeviceStore = device;
					});
			});
		}

		if(!delteButton) {
			deviceSetting
				.addButton((btn) => {
				delteButton = btn;
				delteButton.setIcon("trash");
			});
		}


		if($currentDeviceStore === device) {
			deviceSetting.setDesc("Current Device");
			setCurrentButton.buttonEl.hide();

			delteButton.onClick(() => new ConfirmationPopupModal(
					$pluginInstance.app,
					"This is the currently active device, are you sure?",
					void 0,
					"Delete",
					() => {
						ResetCurrentDevice();
					}
				).open()
			);
			return;
		}

		deviceSetting.setDesc("");
		setCurrentButton.buttonEl.show();

		delteButton.onClick(() => new ConfirmationPopupModal(
				$pluginInstance.app,
				`You are about to delete: ${device}`,
				void 0,
				"Delete",
				async () => {
					$settingsStore.devices = $settingsStore.devices.filter((d) => d !== device);
				}
			).open()
		);
	}

	function ResetCurrentDevice() {
		const currentDevice: string | null = $currentDeviceStore;

		if (!currentDevice) return;
		$settingsStore.devices = $settingsStore.devices.filter((d) => d !== currentDevice);
		$currentDeviceStore = null;
	}

	onMount(() => {
		if(!content) return;
		deviceSetting = new Setting(content).setName(device);
		updateDevice();
	});

	currentDeviceStore.subscribe(() => {
		updateDevice();
	});

</script>
<div bind:this={content} />
