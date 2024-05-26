<script lang="ts">
	import AdvancedSettings from "@/Components/Settings/advanced-settings.svelte";
	import DeviceSettings from "@/Components/Settings/device-settings.svelte";
	import GeneralSettings from "@/Components/Settings/general-settings.svelte";
	import SettingsGroup from "@/Components/Settings/settings-group.svelte";

</script>
<h1>Plugin Groups</h1>
<SettingsGroup title="General Settings">
	<GeneralSettings />
</SettingsGroup>
<SettingsGroup title="Device Settings">
	<DeviceSettings />
</SettingsGroup>
<SettingsGroup title="Advanced Settings">
	<AdvancedSettings />
</SettingsGroup>
