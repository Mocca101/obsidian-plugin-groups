<script lang="ts">
	import { PluginGroup } from "@/DataStructures/PluginGroup";
	import { Copy } from "lucide-svelte";
	import { settingsStore } from "@/stores/main-store";
	import { onMount, createEventDispatcher } from "svelte";
	import CommandManager from "@/Managers/CommandManager";
	import { generateGroupID } from "@/Utils/Utilities";
	import { Tabs } from "bits-ui"
	import GroupGeneral from "./group-modal/group-general.svelte";
	import GroupPluginTab from "./group-modal/group-plugin-tab.svelte";

	export let groupToEdit: PluginGroup;

	const dispatch = createEventDispatcher();

	const tabs = [
		{
			title: "General",
			content: GroupGeneral
		},
		{
			title: "Plugins",
			content: GroupPluginTab,
		},
		{
			title: "Groups",
			content: GroupPluginTab
		}

	]

	let groupToEditCache: string;

	onMount(() => {
		groupToEditCache = JSON.stringify(groupToEdit);
	});

	const close = () => {
		dispatch('close-modal');
	};

	const saveChanges = async () => {
		if ($settingsStore.groupsMap.has(groupToEdit.id)) {
			await editGroup(groupToEdit);
		} else {
			await addGroup(groupToEdit);
		}
		close();
	}

	const discardChanges = async () => {
		if (!$settingsStore.groupsMap.has(groupToEdit.id)) {
			return;
		}
		groupToEdit = JSON.parse(groupToEditCache);
		await editGroup(groupToEdit);
		close();
	}

	const addGroup = async (group: PluginGroup) => {
		settingsStore.update((s) => {
			s.groupsMap.set(group.id, group);
			return s;
		})

		CommandManager.getInstance().AddGroupCommands(group.id);
	}

	const editGroup = async (group: PluginGroup) => {
		settingsStore.update((s) => {
			s.groupsMap.set(group.id, group);
			return s;
		})
		CommandManager.getInstance().updateCommand(group.id);
	}

	const duplicate= async () => {
		const duplicateGroup = new PluginGroup(groupToEdit);
		const groupMap = $settingsStore.groupsMap;

		if (!groupMap) return;

		duplicateGroup.name += "-Duplicate";
		const genId = generateGroupID(duplicateGroup.name);

		if (!genId)	return;

		duplicateGroup.id = genId;

		await addGroup(duplicateGroup);
	}

	const deleteGroup = async () => {
		settingsStore.update((s) => {
			s.groupsMap.delete(groupToEdit.id);
			return s;
		})
		close();
	}

</script>
<h4>Editing <span class="underline underline-offset-4" contenteditable bind:textContent={groupToEdit.name} /></h4>
<Tabs.Root>
	<Tabs.List
	class="
		grid w-full grid-cols-3
		gap-1 rounded-9px
		bg-dark-10 p-1
		text-sm font-semibold
		leading-[0.01em] shadow-mini-inset
		dark:border dark:border-neutral-600/30 dark:bg-background"
	>
		{#each tabs as {title}}
			<Tabs.Trigger value={title}
				class="h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted"
			>
				{title}
			</Tabs.Trigger>
		{/each}

	</Tabs.List>
	{#each tabs as {title, content}}
		<Tabs.Content value={title} class="m-4">
			<svelte:component this={content} bind:groupToEdit={groupToEdit} />
		</Tabs.Content>
	{/each}
</Tabs.Root>

<div class="flex gap-2">
	<div class="flex-grow"/>
	<button on:click={deleteGroup}>Delete</button>
	<button on:click={discardChanges}>Cancel</button>
	<button on:click={saveChanges}>Save</button>
	<button on:click={duplicate} aria-label="Duplicate this group"><Copy size="12" /><span class="sr-only">Duplicate Group</span></button>
</div>
