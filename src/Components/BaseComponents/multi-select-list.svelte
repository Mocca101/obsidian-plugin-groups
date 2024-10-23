<script lang="ts" generics="T">
	import { Select } from "bits-ui";
	import { scale } from "svelte/transition";
	import type { Selected } from "bits-ui";
	import { LucideCheck, LucidePlusCircle } from "lucide-svelte";

	let selectPortal: HTMLDivElement;

	export let selectedElements: Array<T>|undefined;
	export let availableElements: Array<T>;

	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let selectTitle:string | null = null;


	/**
	 * The property of the element that should be displayed as label.
	 * @requires T[labelKey] to be a string
	 */
	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let labelKey: keyof T | undefined = undefined;

	const mapToSelected: (e: T) => Selected<T> = e => {
		if (typeof e === 'string' || e instanceof String) {
			return { label: e as string, value: e }
		}

		if(!labelKey) throw new Error("labelKey is required when selectedElements is not an array of strings");

		return { label: e[labelKey] as string, value: e }
	}

	$: avElements = availableElements.map(e => {
		return mapToSelected(e);
	});

	$: selElements = (!selectedElements ? [] : selectedElements).map(e => {
		return mapToSelected(e);
	});

	const updateSelection = (selection: Array<Selected<T>> | undefined) => {
		if(!selection) {
			selectedElements = [];
			return;
		}
		selectedElements = selection.map(e => e.value);
	}

</script>

<div class="{$$restProps.class || ''}">
	<Select.Root
		multiple
		portal={selectPortal}
		selected={selElements}
		onSelectedChange={updateSelection}
	>
		<Select.Trigger class="mb-1">
			{#if selectTitle}
				{selectTitle}
			{:else}
				<LucidePlusCircle size=14/>
			{/if}
		</Select.Trigger>
		<div bind:this={selectPortal} />
		<Select.Content
			class="menu contain-content"
			transition={scale}
			sideOffset={8}
			sameWidth={false}
		>
			{#each avElements as availableElement}
				<Select.Item
					class="p-2 rounded data-[highlighted]:bg-[var(--interactive-hover)] flex w-full items-center"
					value={availableElement.value}
					label={availableElement.label}
				>
					{availableElement.label}
					<Select.ItemIndicator class="ml-auto" asChild={false}>
						<LucideCheck size=12 />
					</Select.ItemIndicator>
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
