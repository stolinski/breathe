<script lang="ts">
	import type { NodeJS } from 'node';
	import { action, is_active_action, status } from '$lib/status';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	export let device_info: MediaDeviceInfo;

	let canvas: HTMLCanvasElement;
	let analyser;
	let dataArray;
	let bufferLength;
	let audioCtx: AudioContext | null = null;
	let avg = 0;
	const MAX_COUNT = 4; // Box breathing you breath for 4 seconds
	let counter = 0; // Initialize the counter
	let threshold = 30; // Set your threshold value here
	let is_counting = false; // Toggle to control counting
	let instructions = "Press start when you are ready to begin. You'll do great!";

	const MAX_AMPLITUDE = 255; // Adjust this based on the maximum amplitude you're receiving
	const LOG_BASE = 10; // Adjust this for the desired logarithmic scaling

	$: if (is_counting) {
		if (avg > threshold) {
			$status === 'BREATHING';
		} else {
			$status !== 'BREATHING';
		}
	}

	onMount(() => {
		return () => {
			stopCounting();
		};
	});

	function logScale(value: number) {
		return Math.log(value + 1) / Math.log(LOG_BASE);
	}

	async function get_stream() {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: { deviceId: device_info.deviceId }
		});
		if (audioCtx) {
			audioCtx.close(); // Close the existing AudioContext if it exists
		}
		audioCtx = new AudioContext();

		const source = audioCtx.createMediaStreamSource(stream);
		analyser = audioCtx.createAnalyser();
		analyser.fftSize = 2048;
		bufferLength = analyser.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);
		source.connect(analyser);
		return source;
	}

	let stream_promise = get_stream();

	function draw_meter() {
		if (canvas) {
			const context = canvas.getContext('2d');
			if (context) {
				analyser.getByteFrequencyData(dataArray);
				context.clearRect(0, 0, canvas.width, canvas.height);
				let sum = dataArray.reduce((acc, val) => acc + val, 0);
				let average = sum / bufferLength;

				const scaledAverage = (logScale(average) / logScale(MAX_AMPLITUDE)) * canvas.width; // Draw the animation based on the average volume
				avg = scaledAverage;

				context.shadowColor = '#396cd8';
				context.shadowBlur = 15;
				context.shadowOffsetX = 5;
				context.shadowOffsetY = -2;
				context.fillStyle = '#396cd8';
				context.fillRect(0, 0, scaledAverage, canvas.height + 10);
				requestAnimationFrame(draw_meter);
			}
		}
	}

	get_stream().then(() => {
		draw_meter();
	});

	// Function to check the dynamic value and increment the counter
	function checkAndCount() {
		if (is_counting) {
			const dynamicValue = avg;
			if (is_active_action()) {
				if (dynamicValue > threshold) {
					counter++; // Increment the counter if the value is over the threshold
					instructions = "Nice! you're doin' a great job. 👍";
				} else {
					instructions = `${$action?.toLocaleLowerCase()} with your mouth near the microphone`;
				}
			} else {
				if (dynamicValue < threshold) {
					counter++; // Increment the counter if the value is over the threshold
					instructions = `Way to do that ${$action?.toLocaleLowerCase()}`;
				} else {
					instructions = `${$action?.toLocaleLowerCase()} and try not to make any noise`;
				}
			}

			if (counter >= MAX_COUNT) {
				next_step_count();
			}
		}
	}

	// Set up an interval to check the value every second
	let intervalId: NodeJS.Timeout | null = null;

	function startCounting() {
		counter = 0;
		is_counting = true;
		$status = 'BREATHING';
		action.next_step();
		intervalId = setInterval(checkAndCount, 1000);
	}

	function next_step_count() {
		counter = 0;
		action.next_step();
	}

	function stopCounting() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}
</script>

{#await stream_promise then stream}
	<div transition:slide>
		<canvas width="300" height="20" bind:this={canvas} class="meter" />
		<input type="range" name="threshold" id="threshold" bind:value={threshold} min={0} max={200} />
		<p class="note">
			Adjust the threshold to your mic level. Drag the slider to a level you can maintain while
			inhaling or exhaling.
		</p>
	</div>
{:catch}
	<p>Audio Failed to load</p>
{/await}

{#if ['READY', 'BREATHING'].includes($status)}
	<p>
		{instructions}
	</p>

	<button disabled={$status === 'BREATHING'} class="start" on:click={startCounting}
		>{#if $status === 'BREATHING'}
			<span>{$action}</span>
			<br />
			{counter}{:else}Start{/if}</button
	>
{/if}

{#if $status === 'DEVICES_LOADED'}
	<button on:click={() => ($status = 'READY')}>Next ↠</button>
{/if}

<style>
	.meter {
		background: #fff;
		border-radius: 5px;
		width: 100%;
	}

	.start {
		--size: 160px;
		font-size: 2rem;
		background: var(--accent);
		text-transform: lowercase;
		margin: 0 auto;
		padding: 0;
		width: var(--size);
		height: var(--size);
		border-radius: var(--size);
		box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(0, 0, 0, 0.2),
			0 1px 2px rgba(255, 255, 255, 0.3) inset;
		color: white;
		font-weight: 400;
		text-shadow: 1px 1px 3px inset black;
	}
	.start span {
		font-style: italic;
	}

	.start:disabled {
		opacity: 0.7;
		pointer-events: none;
	}

	input[type='range'] {
		box-shadow: none;
		width: 100%;
	}

	.note {
		font-size: 0.8rem;
		margin: 0;
		opacity: 0.7;
		text-align: left;
	}
</style>
