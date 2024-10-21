<script lang="ts" generics="T">
	import { Select } from "bits-ui";
	import { scale } from "svelte/transition";
	import type { Selected } from "bits-ui";
	import { LucideCheck, LucidePlusCircle, LucideX } from "lucide-svelte";

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

	const removeElement = (element: T) => {
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
				<button class="group p-2 border border-solid rounded-full" on:click={() => removeElement(element.value)}>
					{element.label}
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
			<div>
				{noSelectionText}
			</div>
		{/if}
	</div>
</div>
