<script lang="ts">
	// Thank you https://github.com/ErickRuano/clerk-svelte
	import { onDestroy, onMount } from 'svelte';
	import { clerk } from './clerk';

	let signUpElement: HTMLDivElement;

	let unsubscribe = () => {};

	onMount(() => {
		unsubscribe = clerk.subscribe((Clerk) => {
			if (Clerk) {
				Clerk.mountSignUp(signUpElement);
			}
		});
	});

	onDestroy(unsubscribe);
</script>

<div bind:this={signUpElement} />
