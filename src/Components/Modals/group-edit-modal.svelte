<script lang="ts">
	import { PluginGroup } from "@/DataStructures/PluginGroup";
	import { Copy } from "lucide-svelte";
	import { settingsStore } from "@/stores/main-store";
	import { onMount, createEventDispatcher } from "svelte";
	import CommandManager from "@/Managers/CommandManager";
	import { generateGroupID } from "@/Utils/Utilities";
	import { get } from "svelte/store";
	import { Tabs } from "bits-ui"
	import GroupGeneral from "./group-modal/group-general.svelte";

	export let groupToEdit: PluginGroup;

	const dispatch = createEventDispatcher();

	const tabs = [
		{
			title: "General",
			content: GroupGeneral
		},
		{
			title: "Plugins",
			content: "Plugin Settings",
		},
		{
			title: "Groups",
			content: "Group Settings"
		}

	]

	let groupToEditCache: string;
	let discardChanges = true;

	onMount(() => {
		groupToEditCache = JSON.stringify(groupToEdit);
	});

	const close = () => {
		if (discardChanges && $settingsStore.groupsMap.has(groupToEdit.id)) {
			groupToEdit = JSON.parse(groupToEditCache);
		}
		dispatch('close-modal');
	};

	const saveChanges = async () => {
		discardChanges = false;
		if ($settingsStore.groupsMap.has(groupToEdit.id)) {
			await editGroup(groupToEdit);
		} else {
			await addGroup(groupToEdit);
		}
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
		const groupMap = get(settingsStore).groupsMap;

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
		{#each tabs as {title, content}}
			<Tabs.Trigger value={title}
				class="h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted"
			>
				{title}
			</Tabs.Trigger>
		{/each}

	</Tabs.List>
		<Tabs.Content value="General" class="m-4">
			<svelte:component this={GroupGeneral} {groupToEdit} />
		</Tabs.Content>
</Tabs.Root>

<div class="flex gap-2">
	<div class="flex-grow"/>
	<button on:click={deleteGroup}>Delete</button>
	<button on:click={close}>Cancel</button>
	<button on:click={saveChanges}>Save</button>
	<button on:click={duplicate} aria-label="Duplicate this group"><Copy size="12" /><span class="sr-only">Duplicate Group</span></button>
</div>
