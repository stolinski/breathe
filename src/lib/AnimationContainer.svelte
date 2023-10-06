<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	in:fade={{ duration: 400, delay: 400 }}
	out:fade={{ duration: 400 }}
	style="grid-row: 1 / -1; grid-column: 1 / -1; display: grid; gap: 20px;"
>
	<slot />
</div>
