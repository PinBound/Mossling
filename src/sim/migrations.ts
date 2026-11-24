import { createPet, SAVE_VERSION } from './state';
import type { PetState } from './types';

/** The on-disk save. `meta` belongs to the game layer (journal, settings) and is migrated there. */
export interface SaveData {
  version: number;
  savedAt: number;
  /** sim clock minus real clock (non-zero only after Dev Panel time travel) */
  clockOffsetMs: number;
  pet: PetState;
  meta: unknown;
}

type Raw = Record<string, unknown>;
type Migration = (save: Raw) => Raw;

/**
 * migrations[n] upgrades a version-n save to version n+1.
 * v1 was the pre-release format: no babysitter pause, no lifetime counters, no clock offset.
 */
export const MIGRATIONS: Record<number, Migration> = {
  1: (save) => {
    const pet = { ...(save.pet as Raw) };
    const fresh = createPet({ now: 0, seed: 1 });
    pet.pause ??= fresh.pause;
    pet.counters ??= fresh.counters;
    pet.offline = null;
    pet.callCooldownUntil ??= {};
    pet.version = 2;
    return { ...save, version: 2, clockOffsetMs: save.clockOffsetMs ?? 0, pet };
  },
};

export class SaveError extends Error {}

export function migrateSave(input: unknown): SaveData {
  if (!input || typeof input !== 'object') throw new SaveError('Not a Mossling save.');
  let save = input as Raw;
  let v = typeof save.version === 'number' ? save.version : NaN;
  if (!Number.isInteger(v) || v < 1) throw new SaveError('This save has no version.');
  if (v > SAVE_VERSION) throw new SaveError('This save is from a newer version of Mossling.');
  if (!save.pet || typeof save.pet !== 'object')
    throw new SaveError('This save has no Mossling in it.');
  while (v < SAVE_VERSION) {
    const m = MIGRATIONS[v];
    if (!m) throw new SaveError(`No migration from version ${v}.`);
    save = m(save);
    v = save.version as number;
  }
  const pet = save.pet as PetState;
  if (pet.species !== 'mossling' || typeof pet.form !== 'string' || !pet.stats) {
    throw new SaveError('The Mossling in this save is unreadable.');
  }
  return {
    version: SAVE_VERSION,
    savedAt: Number(save.savedAt) || 0,
    clockOffsetMs: Number(save.clockOffsetMs) || 0,
    pet,
    meta: save.meta ?? null,
  };
}
