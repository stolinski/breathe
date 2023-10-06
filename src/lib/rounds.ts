import { writable } from 'svelte/store';

const new_rounds = () => {
	const { subscribe, update, set } = writable<[number, number]>([0, 4]);

	function count_round() {
		update((state) => {
			state[0] = state[0] + 1;
			return state;
		});
	}
	function reset_round() {
		update((state) => {
			state[0] = 0;
			return state;
		});
	}
	function set_limit(limit: number) {
		update((state) => {
			state[0] = limit;
			return state;
		});
	}

	return {
		set,
		subscribe,
		count_round,
		set_limit,
		reset_round
	};
};

export const rounds = new_rounds();
export const rounds_active = writable(false);
