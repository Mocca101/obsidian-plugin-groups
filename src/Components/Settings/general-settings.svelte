<script lang="ts">
	import Manager from "@/Managers/Manager";
	import { Setting } from "obsidian";
	import { onMount } from "svelte";
	
	let content: HTMLDivElement;

	onMount(() => {
		if(!content) return;

		new Setting(content)
			.setName("Generate Commands for Groups")
			.addToggle((tgl) => {
				tgl.setValue(Manager.getInstance().generateCommands ?? false);
				tgl.onChange(async (value) => {
					Manager.getInstance().shouldGenerateCommands = value;
					await Manager.getInstance().saveSettings();
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
				drp.setValue(Manager.getInstance().showNoticeOnGroupLoad ?? "none");
				drp.onChange(async (value) => {
					switch (value) {
						case "normal":
							Manager.getInstance().showNoticeOnGroupLoad = "normal";
							break;
						case "short":
							Manager.getInstance().showNoticeOnGroupLoad = "short";
							break;
						default:
							Manager.getInstance().showNoticeOnGroupLoad = "none";
							break;
					}
					await Manager.getInstance().saveSettings();
				});
			});

		new Setting(content).setName("Statusbar Menu").addDropdown((drp) => {
			drp
				.addOption("None", "None")
				.addOption("Icon", "Icon")
				.addOption("Text", "Text");
			drp.setValue(Manager.getInstance().showStatusbarIcon ?? "None");
			drp.onChange(async (value) => {
				switch (value) {
					case "Icon":
						Manager.getInstance().showStatusbarIcon = "Icon";
						break;
					case "Text":
						Manager.getInstance().showStatusbarIcon = "Text";
						break;
					default:
						Manager.getInstance().showStatusbarIcon = "None";
						break;
				}
				await Manager.getInstance().saveSettings();
				Manager.getInstance().updateStatusbarItem();
			});
		});
	});

</script>
<div bind:this={content} />
