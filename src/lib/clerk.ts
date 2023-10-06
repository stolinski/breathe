import { writable } from 'svelte/store';
import type Clerk from '@clerk/clerk-js';

export const clerk = writable<Clerk | null>(null);
