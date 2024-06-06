<script lang="ts">
	import type { PluginGroup } from "@/DataStructures/PluginGroup";
	import ObsidianSettingItem from "@/Components/BaseComponents/obsidian-setting-item.svelte";
	import ObsButton from "@/Components/BaseComponents/obs-button.svelte";
	import { LucidePen } from "lucide-svelte";
	import { SvelteModal } from "@/Components/Modals/svelte-modal";
	import GroupEditModal from "@/Components/Modals/group-edit-modal.svelte";

	export let group: PluginGroup;

	function editGroup() {		
		new SvelteModal(GroupEditModal, () => ({
			groupToEdit: group
		})).open();
	}

</script>
<ObsidianSettingItem name={group.name}>
	<ObsButton icon={LucidePen} onClick={editGroup} tooltip="Edit" />
</ObsidianSettingItem>
