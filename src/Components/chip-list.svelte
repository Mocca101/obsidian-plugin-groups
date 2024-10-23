<script lang="ts" generics="T">
	import { LucideX } from "lucide-svelte";
	import type { Selected } from "bits-ui";

	export let selectedElements: Array<T>|undefined;	/**
	 * The property of the element that should be displayed as label.
	 * @requires T[labelKey] to be a string
	 */
	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let labelKey: keyof T | undefined = undefined;
	// biome-ignore lint/style/useConst: Can be bound to from outside
	export let noSelectionText:string = "None";


	const removeElement = (element: T) => {
		if(!selectedElements) return;
		selectedElements = selectedElements.filter(e => e !== element);
	}

	const mapToSelected: (e: T) => Selected<T> = e => {
		if (typeof e === 'string' || e instanceof String) {
			return { label: e as string, value: e }
		}

		if(!labelKey) throw new Error("labelKey is required when selectedElements is not an array of strings");

		return { label: e[labelKey] as string, value: e }
	}


	$: selElements = (!selectedElements ? [] : selectedElements).map(e => {
		return mapToSelected(e);
	});

</script>

<div class="flex flex-wrap gap-1 items-center {$$restProps.class || ''}">
	{#if selElements && selElements.length > 0}
		{#each selElements as element}
			<button class="h-fit group px-2 py-1 rounded-full" on:click={() => removeElement(element.value)}>
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
	<div class="h-fit" >
		{noSelectionText}
	</div>
	{/if}
</div>
