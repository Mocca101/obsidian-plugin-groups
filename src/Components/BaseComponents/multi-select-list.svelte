<script lang="ts" generics="T">
	import { Select } from "bits-ui";
	import { scale } from "svelte/transition";
	import type { Selected } from "bits-ui";
	import { LucideCheck, LucidePlusCircle, LucideX } from "lucide-svelte";

	let selectPortal: HTMLDivElement;

	export let selectedElements: Array<T>|undefined;
	export let availableElements: Array<T>;

	export let title: string;
	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let noSelectionText:string = "None";
	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let selectTitle:string | null = null;


	/**
	 * The property of the element that should be displayed as label.
	 * @requires T[labelKey] to be a string
	 */
	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let labelKey: keyof T | undefined = undefined;

	$: avElements = availableElements.map(e => {
		if (typeof e === 'string' || e instanceof String) {
			return {
				label: e as string,
				value: e
			}
		}

		if(!labelKey) throw new Error("labelKey is required when selectedElements is not an array of strings");


		return {
			label: e[labelKey] as string,
			value: e
		}
	});

	$: selElements = (!selectedElements ? [] : selectedElements).map(e => {
		if (typeof e === 'string' || e instanceof String) {
			return {
				label: e as string,
				value: e
			}
		}

		if(!labelKey) throw new Error("labelKey is required when selectedElements is not an array of strings");

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

	const removeElement = (element: T) => {
		if(!selectedElements) return;
		selectedElements = selectedElements.filter(e => e !== element);
	}

</script>

<div class="{$$restProps.class || ''}">
	<Select.Root
		multiple
		portal={selectPortal}
		selected={selElements}
		onSelectedChange={onSelectedChange}
	>
		<div class="flex justify-between">
			<span>
				{title}
			</span>
			<Select.Trigger class="mb-1">
				{#if selectTitle}
					{selectTitle}
				{:else}
					<LucidePlusCircle size=14/>
				{/if}
			</Select.Trigger>
		</div>
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

	<div class="flex flex-wrap gap-1 items-center">
		<slot name="preChiplist" />
		{#if selElements.length > 0}
			{#each selElements as element}
				<button class="h-fit group px-2 py-1 border border-solid rounded-full" on:click={() => removeElement(element.value)}>
					<span>
						{element.label}
					</span>
					<span class="sr-only">
						Remove {element.label}
					</span>
					<LucideX
						size=14
						class="
							p-0 m-0 ml-1
							group-focus:border group-focus:border-solid group-focus:rounded-full
							group-hover:border group-hover:border-solid group-hover:rounded-full"
						/>
				</button>
			{/each}
		{:else}
		<div class="h-fit px-2 py-1 border border-solid rounded-full" style="font-size: var(--font-ui-small);">
			{noSelectionText}
		</div>
		{/if}
	</div>
</div>
