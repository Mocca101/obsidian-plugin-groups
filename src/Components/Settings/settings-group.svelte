<script lang="ts">
	import { Collapsible } from "bits-ui";
	import { ChevronDown, ChevronUp } from "lucide-svelte";
  let collapsibleOpen = true;

	export let title = "Settings";

</script>
<Collapsible.Root bind:open={collapsibleOpen}>
	<Collapsible.Trigger class="flex justify-between w-full py-2 mb-2">
		<h4>{title}</h4>
		{#if collapsibleOpen}
			<ChevronDown size="24" />
		{:else}
				<ChevronUp size="24" />
		{/if}
	</Collapsible.Trigger>
	<Collapsible.Content class="p-2">
		<slot />
	</Collapsible.Content>
</Collapsible.Root>
