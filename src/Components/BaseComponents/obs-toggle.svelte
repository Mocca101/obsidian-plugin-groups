<script lang="ts">
	import { ToggleComponent } from "obsidian";
	import { onMount } from "svelte";

	export let value: boolean;
	let content: HTMLDivElement;

	onMount(() => {
		if(!content) return;

		new ToggleComponent(content)
			.onChange((newVal) => {
				value = newVal;
			})
	});
</script>
<div bind:this={content} />
