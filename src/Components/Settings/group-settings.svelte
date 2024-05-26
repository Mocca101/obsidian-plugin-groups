<script lang="ts">
	import { PluginGroup } from "@/DataStructures/PluginGroup";
	import { generateGroupID } from "@/Utils/Utilities";
	import { type ButtonComponent, Setting, type TextComponent } from "obsidian";
	import { onMount } from "svelte";
	import GroupEditModal from "../Modals/GroupEditModal";
	import { pluginInstance } from "@/stores/main-store";
	import { get } from "svelte/store";

	let content: HTMLElement;

	let setting: Setting;
	let addButton: ButtonComponent;
	let groupNameField: TextComponent;

	let newGroupName = "";

	const onNewGroupNameChange = (val: string) => {
		if (!addButton) return;

		if(val.trim().length > 0)
			addButton.setDisabled(false);
		else
			addButton.setDisabled(true);
	};

	$: onNewGroupNameChange(newGroupName);

	onMount(() => {
		if(!content) return;
		setting = new Setting(content)
			.setName("Add Group")
			.addText((text) => {
				groupNameField = text;
				groupNameField
					.setPlaceholder("Enter group name...")
					.setValue(newGroupName)
					.onChange((val) => {
						newGroupName = val;
					})
					.inputEl.onkeydown = async (e) => {
						if (e.key === "Enter")
							await addNewGroup();
					};
			})
			.addButton((btn) => {
				addButton = btn;
				btn.setIcon("plus").onClick(() => addNewGroup());
				addButton.setDisabled(true);
			});
	});

	async function addNewGroup() {
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
		// TODO:
		// new GroupEditModal(
		// 	get(pluginInstance).app,
		// 	this,
		// 	newGroup
		// ).open();
		newGroupName = "";
		if (groupNameField) {
			groupNameField.setValue("");
		}
	}

	function editGroup(group: PluginGroup) {
		// TODO:
		// new GroupEditModal(
		// 	get(pluginInstance).app,
		// 	this,
		// 	group
		// ).open();
	}

</script>
<div bind:this={content} />
