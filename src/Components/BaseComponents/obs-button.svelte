<script lang="ts">
	import type {} from "svelte";

	export let title: string | null = null;
	export let icon: any | null = null;
	export let onClick: () => void;

</script>
<button on:click={onClick} >
	{#if title}
		{title}
	{:else if icon}
		<svelte:component this={icon} class="svg-icon" />
	{/if}
</button>
