<script lang="ts">
	import { settingsStore } from "@/stores/main-store";
	import { Setting, type ToggleComponent } from "obsidian";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	let content: HTMLElement;
	let devLogToggle: ToggleComponent;
	let loadSyncToggle: ToggleComponent;

	onMount(() => {
		if(!content) return;

		new Setting(content).setName("Development Logs")
			.addToggle((tgl) => {
				devLogToggle = tgl;
				tgl.setValue(get(settingsStore).devLogs);
				tgl.onChange(async (value) => {
					settingsStore.update((s) => {
						s.devLogs = value
						return s;
					});
				});
			});

		new Setting(content).setName("Load Synchronously")
			.addToggle((tgl) => {
				loadSyncToggle = tgl;
				tgl.setValue(get(settingsStore).doLoadSynchronously);
				tgl.onChange(async (value) => {
					settingsStore.update((s) => {
						s.doLoadSynchronously = value
						return s;
					});
				});
			});

	});

</script>
<div bind:this={content}></div>
