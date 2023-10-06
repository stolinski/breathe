<script lang="ts">
	import { rounds } from './rounds';
	$: completed_rounds = $rounds[0];
	$: total_rounds = $rounds[1];
</script>

<h2>Rounds</h2>
<div class="rounds">
	{#each Array(total_rounds) as _, index (index)}
		<input
			tabindex="-1"
			type="checkbox"
			checked={index < completed_rounds}
			on:click|preventDefault={() => {}}
			readonly
		/>
	{/each}
</div>

<style>
	.rounds {
		display: flex;
		justify-content: center;
		gap: 20px;
	}
</style>
