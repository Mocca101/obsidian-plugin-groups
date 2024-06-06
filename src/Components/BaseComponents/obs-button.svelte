<script lang="ts">
	export let title: string | null = null;
	export let icon: any | null = null;
	export let onClick: () => void;
	export let disabled: boolean = false;
	export let tooltip: string | null = null;

</script>
<button on:click={onClick} disabled={disabled} aria-label={tooltip} >
	{#if title}
		{title}
	{:else if icon}
		<svelte:component this={icon} class="svg-icon" />
	{/if}
</button>
