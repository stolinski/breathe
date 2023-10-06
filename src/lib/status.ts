import { get, writable } from 'svelte/store';
import { rounds } from './rounds';

export const status = writable<
	| 'INITIAL'
	| 'PERMISSIONS_FAILED'
	| 'DEVICES_LOADED'
	| 'LOADING'
	| 'ERROR'
	| 'CALIBRATING'
	| 'READY'
	| 'BREATHING'
	| 'SUCCESS'
>('INITIAL');

function get_next_state(
	currentStatus: 'INHALE' | 'HOLD' | 'EXHALE' | 'WAIT' | null
): 'INHALE' | 'HOLD' | 'EXHALE' | 'WAIT' | null {
	switch (currentStatus) {
		case 'INHALE':
			return 'HOLD';
		case 'HOLD':
			return 'EXHALE';
		case 'EXHALE':
			return 'WAIT';
		case 'WAIT': {
			rounds.count_round();
			const completed_rounds = get(rounds)[0];
			const total_rounds = get(rounds)[1];
			if (completed_rounds === total_rounds) {
				status.set('SUCCESS');
				return null;
			}
			return 'INHALE';
		}
		case null: // Handle the case when currentStatus is null
			return 'INHALE'; // You can specify the desired default status here
		default:
			throw new Error('Invalid status');
	}
}

const new_action = () => {
	const { subscribe, update, set } = writable<'INHALE' | 'HOLD' | 'EXHALE' | 'WAIT' | null>(null);

	function next_step() {
		update((state) => {
			state = get_next_state(state);
			return state;
		});
	}

	return {
		subscribe,
		update,
		set,
		next_step
	};
};

export const action = new_action();
export const is_active_action = () => {
	const current_action = get(action);
	return ['INHALE', 'EXHALE'].includes(current_action || '');
};
