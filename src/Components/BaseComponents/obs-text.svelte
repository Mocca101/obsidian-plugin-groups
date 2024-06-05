<script lang="ts">
	export let value: string;
	export let placeholder: string = "";

</script>
<input type="text" spellcheck="false" placeholder={placeholder} bind:value={value} />
