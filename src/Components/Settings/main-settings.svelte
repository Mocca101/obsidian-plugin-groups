<script lang="ts">
	import { Collapsible } from "bits-ui";
	import GeneralSettings from "./general-settings.svelte";
	import { ChevronDown, ChevronUp } from "lucide-svelte";
  let collapsibleOpen = true;


</script>
<h1>Plugin Groups</h1>
<Collapsible.Root bind:open={collapsibleOpen}>
	<Collapsible.Trigger class="flex justify-between w-full mb-2 py-2">
		<h4>General Settings</h4>
		{#if collapsibleOpen}
			<ChevronDown size="24" />
		{:else}
				<ChevronUp size="24" />
		{/if}
	</Collapsible.Trigger>
	<Collapsible.Content class="p-2">
		<GeneralSettings />
	</Collapsible.Content>
</Collapsible.Root>
