<script lang="ts">
	import type { PluginGroup } from "@/DataStructures/PluginGroup";
	import { Setting } from "obsidian";
	import { onMount } from "svelte";

	export let groupToEdit: PluginGroup;

	export let groupToEditCache: string;
	export let discardChanges = true;


	let content: HTMLElement;
	let setting: Setting;

	onMount(() => {
		if(!content) return;
		setting = new Setting(content).setName("");

	});

</script>

<div bind:this={content} />
