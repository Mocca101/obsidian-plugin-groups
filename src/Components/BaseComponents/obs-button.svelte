<script lang="ts">
	export let title: string | null = null;
	export let icon: any | null = null;
	export let onClick: () => void;
	export let disabled: boolean = false;

</script>
<button on:click={onClick} disabled={disabled} >
	{#if title}
		{title}
	{:else if icon}
		<svelte:component this={icon} class="svg-icon" />
	{/if}
</button>
