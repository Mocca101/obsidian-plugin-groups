<script lang="ts" generics="T">
	import { Select } from "bits-ui";
	import { scale } from "svelte/transition";
	import type { Selected } from "bits-ui";
	import { LucideCheck, LucidePlusCircle } from "lucide-svelte";

	let selectPortal: HTMLDivElement;

	export let selectedElements: Array<T>;
	export let availableElements: Array<T>;

	export let title: string;
	// biome-ignore lint/style/useConst: Since it can be bound to from outside it needs to be let.
	export let noSelectionText:string = "None";

	/**
	 * The property of the element that should be displayed as label.
	 * @requires T[labelKey] to be a string
	 */
	export let labelKey: keyof T;

	$: avElements = availableElements.map(e => {
		return {
			label: e[labelKey] as string,
			value: e
		}
	});

	$: selElements = selectedElements.map(e => {
		return {
			label: e[labelKey] as string,
			value: e
		}
	});

	const updateSelection = (selection: Array<Selected<T>> | undefined) => {
		if(!selection) {
			selectedElements = [];
			return;
		}
		selectedElements = selection.map(e => e.value);
	}

	const onSelectedChange: (selected: Array<Selected<T>>|undefined) => void = updateSelection;

</script>

<div class="{$$restProps.class || ''}">
	<Select.Root
		multiple
		portal={selectPortal}
		selected={selElements}
		onSelectedChange={onSelectedChange}
	>
		{title}
		<Select.Trigger class="mb-2">
			<LucidePlusCircle size=12/>
		</Select.Trigger>
		<div bind:this={selectPortal} />
		<Select.Content
			class="menu p-4 contain-content"
			transition={scale}
			sideOffset={8}
			sameWidth={false}
		>
			{#each avElements as availableElement}
				<Select.Item
					class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-muted"
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

	<div class="flex flex-wrap gap-1">
		{#if selElements.length > 0}
			{#each selElements as element}
				<div class="px-1 border border-solid rounded">{element.label}</div>
			{/each}
		{:else}
			<div class="px-1 border border-solid rounded">
				{noSelectionText}
			</div>
		{/if}
	</div>
</div>
