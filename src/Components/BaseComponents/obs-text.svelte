<script lang="ts">
	export let value: string;
	export let placeholder: string = "";
	export let onSubmit: () => void = () => {};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			onSubmit();
		}
	};


</script>
<input type="text" spellcheck="false" placeholder={placeholder} bind:value={value} on:keydown={onKeyDown} />
