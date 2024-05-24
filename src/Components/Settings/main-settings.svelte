<script lang="ts">
	import DeviceSettings from "./device-settings.svelte";
	import GeneralSettings from "./general-settings.svelte";
	import SettingsGroup from "./settings-group.svelte";

</script>
<h1>Plugin Groups</h1>
<SettingsGroup title="General Settings">
	<GeneralSettings />
</SettingsGroup>
<SettingsGroup title="Device Settings">
	<DeviceSettings />
</SettingsGroup>
