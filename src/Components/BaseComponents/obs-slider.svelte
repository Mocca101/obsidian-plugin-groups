<script lang="ts">
	export let value: number = 0;
	export let disabled: boolean = false;
	export let tooltip: string | null = null;

	export let min: number = 0;
	export let max: number = 25;

</script>
<input type="range" bind:value class="slider" min={min} max={max} aria-label={tooltip} disabled={disabled} />
