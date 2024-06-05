<script lang="ts">
	import { settingsStore } from "@/stores/main-store";
	import { Setting } from "obsidian";
	import { onMount } from "svelte";

	let content: HTMLDivElement;

	onMount(() => {
		if(!content) return;

		new Setting(content)
			.setName("Generate Commands for Groups")
			.addToggle((tgl) => {
				tgl.setValue($settingsStore.generateCommands ?? false);
				tgl.onChange(async (value) => {
					$settingsStore.generateCommands = value;
				});
			});

		new Setting(content)
			.setName("Notice upon un-/loading groups")
			.setDesc("Show a notice in the statusbar when groups are loaded or unloaded")
			.addDropdown((drp) => {
				drp
					.addOption("none", "None")
					.addOption("short", "Short")
					.addOption("normal", "Normal");
				drp.setValue($settingsStore.showNoticeOnGroupLoad ?? "none");
				drp.onChange(async (value) => {
					switch (value) {
						case "normal":
							$settingsStore.showNoticeOnGroupLoad = "normal";
							break;
						case "short":
							$settingsStore.showNoticeOnGroupLoad = "short";
							break;
						default:
							$settingsStore.showNoticeOnGroupLoad = "none";
							break;
					}
				});
			});

		new Setting(content).setName("Statusbar Menu").addDropdown((drp) => {
			drp
				.addOption("None", "None")
				.addOption("Icon", "Icon")
				.addOption("Text", "Text");
			drp.setValue($settingsStore.showStatusbarIcon ?? "None");
			drp.onChange(async (value) => {
				switch (value) {
					case "Icon":
						$settingsStore.showStatusbarIcon = "Icon";
						break;
					case "Text":
						$settingsStore.showStatusbarIcon = "Text";
						break;
					default:
						$settingsStore.showStatusbarIcon = "None";
						break;
				}
			});
		});
	});

</script>
<div bind:this={content} />
