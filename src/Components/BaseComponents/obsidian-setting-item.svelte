<script lang="ts">
	import { onMount } from "svelte";

	export let name: string;
	export let description: string = "";
	export let tooltip: string | undefined = undefined;

</script>
<div class="setting-item">
	<div class="setting-item-info">
		<div class="setting-item-name" aria-label="{tooltip}">
			{name}
		</div>
		<div class="setting-item-description">
			{description}
		</div>
	</div>
	<div class="setting-item-control">
		<slot />
	</div>
</div>
