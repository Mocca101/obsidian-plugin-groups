<script lang="ts">
	import { PluginGroup } from "@/DataStructures/PluginGroup";
	import { generateGroupID } from "@/Utils/Utilities";
	import GroupEditModal from "../Modals/group-edit-modal.svelte";
	import { SvelteModal } from "../Modals/svelte-modal";
	import ObsidianSettingItem from "../BaseComponents/obsidian-setting-item.svelte";
	import ObsText from "../BaseComponents/obs-text.svelte";
	import ObsButton from "../BaseComponents/obs-button.svelte";
	import { LucidePlus } from "lucide-svelte";
	import { settingsStore } from "@/stores/main-store";
	import GroupItem from "../group-item.svelte";

	let newGroupName = "";

	$: disableButton = newGroupName.trim().length === 0;

	async function addNewGroup() {
		if(newGroupName.trim().length === 0) return;

		const id = generateGroupID(newGroupName);

		if (!id) {
			console.error(
				"Failed to create Group, please choose a different Name as there have been to many groups with the same name"
			);
			return;
		}

		const newGroup = new PluginGroup({
			id: id,
			name: newGroupName,
		});

		new SvelteModal(GroupEditModal, () => ({
			groupToEdit: newGroup
		})).open();

		newGroupName = "";
	}

</script>
<ObsidianSettingItem title="Add Group">
	<ObsText bind:value={newGroupName} placeholder="Enter group name..." onSubmit={addNewGroup} />
	<ObsButton  icon={LucidePlus} onClick={addNewGroup} disabled={disableButton} />
</ObsidianSettingItem>
{#each $settingsStore.groupsMap as [key, group] }
	<GroupItem group={group} />
{/each}

