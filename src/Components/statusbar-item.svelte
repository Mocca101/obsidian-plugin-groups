<script lang="ts">
  import { Popover} from "bits-ui";
	import GroupSettings from "./Settings/group-settings.svelte";
	import { settingsStore } from "@/stores/main-store";
	import { Boxes } from "lucide-svelte";
 
</script>
 {#if $settingsStore.showStatusbarIcon !== "None"}
	<Popover.Root>
		<Popover.Trigger
			asChild
			let:builder
		>
			<div
				class="
					status-bar-item-icon mod-clickable 
					hover:bg-[var(--background-modifier-hover)] hover:text-[var(--text-normal)]" 
				use:builder.action {...builder}
			>
				{#if $settingsStore.showStatusbarIcon === "Icon"}
						<Boxes size="12" />
				{:else if $settingsStore.showStatusbarIcon === "Text"}
					<span >
						Plugins
					</span>
				{/if}
			</div>
		</Popover.Trigger>
		<Popover.Content
			sideOffset={12}
			side="top"
			class="menu"
		>
		<div class="m-4">
			<GroupSettings />
		</div>
		</Popover.Content>
	</Popover.Root>
{/if}
