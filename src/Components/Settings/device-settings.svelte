<script lang="ts">
	import Manager from "@/Managers/Manager";
	import { getCurrentlyActiveDevice, setCurrentlyActiveDevice } from "@/Utils/Utilities";
	import { ButtonComponent, Notice, Setting, TextComponent } from "obsidian";	
	import { onMount } from "svelte";
	import DeviceSettingElement from "../device-setting-element.svelte";
	
	let content: HTMLDivElement;

	let newDeviceName = "";
	let deviceAddBtn: ButtonComponent;
	let newDevNameText: TextComponent;

	let devices: string[] = Manager.getInstance().devices;

	
	onMount(() => {
		if (!content) return;
		
		const deviceNameSetting = new Setting(content).setName("New Device");

		newDevNameText = new TextComponent(deviceNameSetting.controlEl);
		newDevNameText
			.setValue(newDeviceName)
			.onChange((value) => {
				newDeviceName = value;
				if (deviceAddBtn) {
					value.replace(" ", "").length > 0
						? deviceAddBtn.buttonEl.removeClass("btn-disabled")
						: deviceAddBtn.buttonEl.addClass("btn-disabled");
				}
			})
			.setPlaceholder("Device Name").inputEl.onkeydown = async (e) => {
			if (e.key === "Enter") {
				await CreateNewDevice();
			}
		};
	
		deviceNameSetting.addButton((btn) => {
				deviceAddBtn = btn;
				deviceAddBtn
					.setIcon("plus")
					.onClick(async () => {
						await CreateNewDevice();
					})
					.buttonEl.addClass("btn-disabled");
			});
	});

	async function CreateNewDevice() {
		if (!newDeviceName || newDeviceName.replace(" ", "") === "") {
			return;
		}

		if (Manager.getInstance().devices.contains(newDeviceName)) {
			new Notice("Name already in use for other device");
			return;
		}

		Manager.getInstance().devices.push(newDeviceName);
		await Manager.getInstance().saveSettings();

		if (!getCurrentlyActiveDevice()) {
			setCurrentlyActiveDevice(newDeviceName);
		}

		// this.display();

		newDeviceName = "";
		newDevNameText.setValue(newDeviceName);
	};


</script>
<div>
<div bind:this={content} />

	{#each devices as device}
		<DeviceSettingElement device={device} />
	{/each}
</div>
