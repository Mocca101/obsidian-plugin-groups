<script lang="ts">
	export let title: string;
	export let description: string = "";
	export let tooltip: string | undefined = undefined;

</script>
<div class="setting-item">
	<div class="setting-item-info">
		<div class="setting-item-name" aria-label="{tooltip}">
			{title}
		</div>
		<div class="setting-item-description">
			{#if description === ""}
				<slot name="description" />
			{/if}
			{description}
		</div>
	</div>
	<div class="setting-item-control">
		<slot />
	</div>
</div>
