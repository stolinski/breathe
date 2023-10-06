<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { status } from '$lib/status';
	import { rounds, rounds_active } from '$lib/rounds';
	import AudioFrame from '$lib/AudioFrame.svelte';
	import RoundsCompleted from '$lib/RoundsCompleted.svelte';
	import Success from '$lib/Success.svelte';
	import AnimationContainer from '$lib/AnimationContainer.svelte';

	let audio_inputs = writable<MediaDeviceInfo[]>([]);
	let selected_audio = writable<MediaDeviceInfo | null>(null);

	let load_devices_properties = {
		audio: {
			echoCancellation: false,
			noiseSuppression: false,
			sampleRate: 44100
		}
	};

	function deal_with_error(e, status_toggle: 'NO_STATUS' | null = null) {
		console.error(e);
		if (status_toggle !== 'NO_STATUS') $status = 'ERROR';
	}

	async function refresh_devices() {
		$status = 'LOADING';
		try {
			await navigator.mediaDevices.getUserMedia(load_devices_properties);
			const result = await navigator.mediaDevices.enumerateDevices();

			$audio_inputs = result.filter(
				({ kind, deviceId }) => deviceId !== 'default' && kind === 'audioinput'
			);

			$status = 'DEVICES_LOADED';
		} catch (e) {
			deal_with_error(e);
		}
	}

	async function refresh_permissions() {
		try {
			await navigator.permissions.query({
				name: 'microphone' as PermissionName
			});
		} catch (e) {
			deal_with_error(e, 'NO_STATUS');
		}
	}

	function audio_select(id: string) {
		$selected_audio = $audio_inputs.find((device) => device.deviceId === id);
	}

	onMount(async () => {
		await refresh_permissions();
		await refresh_devices();
	});
</script>

{#if $status === 'SUCCESS'}
	<AnimationContainer>
		<Success />
	</AnimationContainer>
{:else if $rounds_active}
	<AnimationContainer>
		{#if ['READY', 'BREATHING'].includes($status)}
			<RoundsCompleted />
		{:else}
			<div class="audio-inputs">
				<h2>Select Microphone</h2>
				<label>
					Mic Inputs:
					<select on:change={(e) => audio_select(e.target.value)}>
						<option value={null}>None</option>
						{#each $audio_inputs as device}
							<option value={device.deviceId}>
								{device.label}
							</option>
						{/each}
					</select>
				</label>
			</div>
		{/if}

		{#if $selected_audio}
			{#key $selected_audio.deviceId}
				<AudioFrame device_info={$selected_audio} />
			{/key}
		{/if}
	</AnimationContainer>
{:else}
	<AnimationContainer>
		<div>
			<h2>How many rounds this session?</h2>
			<p>A round is one set of inhale, hold, exhale, wait.</p>
			<form action="POST" on:submit|preventDefault={() => ($rounds_active = true)}>
				<input type="number" bind:value={$rounds[1]} />
				<button type="submit">Next ↠</button>
			</form>
		</div>
	</AnimationContainer>
{/if}

<style lang="postcss">
	h3 {
		font-weight: 100;
	}

	select {
		font-family: 'MD IO';
		font-style: italic;
		appearance: none;
		font-size: 16px;
		width: 100%;
		padding: 10px;
		background: linear-gradient(to bottom, rgba(246, 246, 246, 1), rgba(246, 246, 246, 1));
		border: solid 1px rgba(0, 0, 0, 0.07);
		border-top: solid 1px rgba(255, 255, 255, 0.5);
		border-radius: 5px;
	}
	label {
		text-align: left;
		display: block;
	}
</style>
