<script lang="ts">
	import AdvancedSettings from "@/Components/Settings/advanced-settings.svelte";
	import DeviceSettings from "@/Components/Settings/device-settings.svelte";
	import GeneralSettings from "@/Components/Settings/general-settings.svelte";
	import SettingsGroup from "@/Components/Settings/settings-group.svelte";
	import GroupSettings from "@/Components/Settings/group-settings.svelte";

</script>
<h1>Plugin Groups</h1>
<SettingsGroup title="General Settings" collapsibleOpen={false} >
	<GeneralSettings />
</SettingsGroup>
<SettingsGroup title="Device Settings" collapsibleOpen={false} >
	<DeviceSettings />
</SettingsGroup>
<SettingsGroup title="Groups">
	<GroupSettings />
</SettingsGroup>
<SettingsGroup title="Advanced Settings">
	<AdvancedSettings />
</SettingsGroup>
