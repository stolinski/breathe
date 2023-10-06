<script lang="ts">
	import TimeClock from '$lib/TimeClock.svelte';
	import '$lib/styles.css';
	let logged_in = false;
	let anon = false;
</script>

<header>
	<h1>Breathe</h1>
	<TimeClock />
</header>
<main class="container" style="display: grid;">
	{#if logged_in || anon}
		<slot />
	{:else}
		<h2>Welcome, are you ready to breathe?</h2>
		<p>Create an account to track, or anonymous just to try.</p>

		<button>Login</button>
		<p>or</p>
		<button
			on:click={() => {
				anon = true;
			}}>Anonymous</button
		>
	{/if}
</main>

<footer>
	<!-- <button class="subtle" on:click={refresh_devices}>↻ | Refresh Devices</button> -->
	<h3>Helpful Links</h3>
	<ul>
		<li>
			<a
				href="https://learningevaluationcenter.org/box-breathing-a-mindfulness-technique-for-parents-of-teens-with-anxiety/"
				>What is box breathing?</a
			>
		</li>
		<li>
			<a href="https://syntax.fm/show/670/anxiety-and-uncertainty-with-dr-courtney-tolinski"
				>Anxiety and Uncertainty with Dr. Courtney Tolinski on Syntax.fm</a
			>
		</li>
		<li><a href="https://syntax.fm">Syntax Podcast</a></li>
	</ul>

	<p>© Til' Infinity Scott Tolinski</p>
</footer>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	h1 {
		margin-top: 0;
		text-shadow: 1px 1px 0 oklch(60% 0.229 262.97);
		transition: 2s ease-in-out text-shadow;
		font-weight: 100;
		font-style: italic;
	}
	h1:hover {
		text-shadow: 10px 10px 4px oklch(60% 0.229 262.97);
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		max-width: 600px;
		align-self: center;
	}
</style>
