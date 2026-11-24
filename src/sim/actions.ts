import { createRng, type RNG } from './rng';
import { clamp, clonePet } from './state';
import { makeSick, resolveCalls } from './step';
import { TUNING } from './tuning';
import type { Action, GameId, PetState, SimEvent, StepResult } from './types';

export type PlayBlock = 'too-young' | 'asleep' | 'tired' | 'sick' | 'egg' | 'gone' | null;

/** Why the pet can't play right now (or null if it can). */
export function playBlock(s: PetState): PlayBlock {
  if (s.status !== 'alive') return 'gone';
  if (s.stage === 'egg') return 'egg';
  if (s.stage === 'baby') return 'too-young';
  if (s.sleep) return 'asleep';
  if (s.sick) return 'sick';
  if (s.stats.energy < TUNING.play.minEnergy) return 'tired';
  return null;
}

/** Apply a player action at `now`. Pure. */
export function applyAction(state: PetState, action: Action, now: number): StepResult {
  const s = clonePet(state);
  const r = createRng(s.rngState);
  const ev: SimEvent[] = [];
  if (s.status === 'alive' || isMeta(action)) run(s, action, now, r, ev);
  if (s.status === 'alive') resolveCalls(s, now, ev);
  s.rngState = r.state;
  return { state: s, events: ev };
}

function isMeta(a: Action) {
  return a.type === 'setLifeMode' || a.type === 'setTimezone' || a.type === 'name';
}

function run(s: PetState, a: Action, now: number, r: RNG, ev: SimEvent[]) {
  const st = s.stats;
  switch (a.type) {
    case 'name': {
      const name = a.name.trim().slice(0, 16);
      if (!name) return;
      s.name = name;
      ev.push({ type: 'NAMED', at: now, name });
      return;
    }
    case 'feed': {
      if (s.stage === 'egg') return void ev.push({ type: 'REFUSED', at: now, why: 'too-young' });
      if (s.sleep) return void ev.push({ type: 'REFUSED', at: now, why: 'asleep' });
      if (st.hunger >= TUNING.fullThreshold) {
        return void ev.push({ type: 'REFUSED', at: now, why: 'full' });
      }
      if (
        s.stage === 'teen' &&
        st.hunger < 75 &&
        r.chance(TUNING.teenRefuseChance * (1 - st.discipline / 100))
      ) {
        s.disciplineUntil = now + TUNING.disciplineOpportunityMs;
        return void ev.push({ type: 'REFUSED', at: now, why: 'moody' });
      }
      const food = TUNING.food[a.food];
      st.hunger = clamp(st.hunger + food.hunger);
      st.weight += food.weight;
      s.praiseUntil = now + TUNING.praise.windowMs;
      s.counters.meals++;
      ev.push({ type: 'ATE', at: now, food: a.food });
      return;
    }
    case 'snack': {
      if (s.stage === 'egg') return void ev.push({ type: 'REFUSED', at: now, why: 'too-young' });
      if (s.sleep) return void ev.push({ type: 'REFUSED', at: now, why: 'asleep' });
      st.happiness = clamp(st.happiness + TUNING.snack.happiness);
      st.weight += TUNING.snack.weight;
      s.snackLog = s.snackLog.filter((t) => now - t < TUNING.snackWindowMs);
      s.snackLog.push(now);
      s.counters.snacks++;
      ev.push({ type: 'SNACKED', at: now });
      if (s.snackLog.length > TUNING.snackLimit && !s.sick) {
        ev.push({ type: 'STOMACHACHE', at: now });
        makeSick(s, now, r, 'stomachache', ev);
      }
      return;
    }
    case 'play': {
      const block = playBlock(s);
      if (block) {
        if (block === 'too-young' || block === 'asleep' || block === 'tired' || block === 'sick') {
          ev.push({ type: 'REFUSED', at: now, why: block });
        }
        return;
      }
      const p = TUNING.play;
      st.happiness = clamp(st.happiness + (a.won ? p.winHappiness : p.loseHappiness));
      st.energy = clamp(st.energy - p.energyCost);
      st.weight = Math.max(TUNING.minWeight[s.stage as 'child'], st.weight - p.weightCost);
      st.bond = clamp(st.bond + 0.5);
      s.counters.gamesPlayed++;
      if (a.won) {
        s.counters.gamesWon++;
        s.praiseUntil = now + TUNING.praise.windowMs;
      }
      ev.push({ type: 'PLAYED', at: now, game: a.game as GameId, won: a.won });
      return;
    }
    case 'clean': {
      const removed = s.droppings.length;
      s.droppings = [];
      st.hygiene = clamp(st.hygiene + (removed > 0 ? TUNING.clean.hygiene : 10));
      ev.push({ type: 'CLEANED', at: now, removed });
      return;
    }
    case 'bath': {
      if (s.stage === 'egg') return;
      s.droppings = [];
      st.hygiene = 100;
      s.counters.baths++;
      ev.push({ type: 'BATHED', at: now });
      if (r.chance(TUNING.bath.cloverChance)) ev.push({ type: 'FOUND_CLOVER', at: now });
      return;
    }
    case 'lights': {
      if (s.lightsOn === a.on) return;
      s.lightsOn = a.on;
      ev.push({ type: 'LIGHTS', at: now, on: a.on });
      return;
    }
    case 'medicine': {
      if (s.stage === 'egg') return;
      if (!s.sick) {
        st.happiness = clamp(st.happiness - TUNING.medicineRefuseHappiness);
        return void ev.push({ type: 'MEDICINE_REFUSED', at: now });
      }
      s.sick.dosesNeeded--;
      const cured = s.sick.dosesNeeded <= 0;
      const left = Math.max(0, s.sick.dosesNeeded);
      if (cured) s.sick = null;
      ev.push({ type: 'MEDICINE', at: now, cured, dosesLeft: left });
      return;
    }
    case 'scold': {
      if (s.stage === 'egg' || s.sleep) return;
      s.counters.scolds++;
      const correct = now < s.disciplineUntil;
      if (correct) {
        st.discipline = clamp(st.discipline + TUNING.scold.correctDiscipline);
        s.disciplineUntil = 0;
        s.praiseUntil = now + TUNING.praise.windowMs;
        if (s.call && !s.call.real) {
          const reason = s.call.reason;
          s.call = null;
          ev.push({ type: 'CALL_ENDED', at: now, reason, answered: true });
        }
      } else {
        st.happiness = clamp(st.happiness - TUNING.scold.wrongHappiness);
      }
      ev.push({ type: 'SCOLDED', at: now, correct });
      return;
    }
    case 'praise': {
      if (s.stage === 'egg' || s.sleep) return;
      const meaningful = now < s.praiseUntil;
      if (meaningful) {
        const p = TUNING.praise;
        st.happiness = clamp(st.happiness + p.happiness);
        st.discipline = clamp(st.discipline + p.discipline);
        st.bond = clamp(st.bond + p.bond);
        s.praiseUntil = 0;
        s.counters.praises++;
      }
      ev.push({ type: 'PRAISED', at: now, meaningful });
      return;
    }
    case 'pet': {
      const ready = now - s.lastPetAt >= TUNING.pet.cooldownMs;
      const counted = ready && s.stage !== 'egg' && !s.sleep;
      if (counted) {
        st.happiness = clamp(st.happiness + TUNING.pet.happiness);
        st.bond = clamp(st.bond + TUNING.pet.bond);
        s.lastPetAt = now;
        s.counters.pets++;
      }
      ev.push({ type: 'PETTED', at: now, spot: a.spot, counted });
      return;
    }
    case 'setLifeMode':
      s.lifeMode = a.mode;
      return;
    case 'setTimezone':
      s.tzOffsetMin = a.offsetMin;
      return;
    case 'setPaused': {
      if (a.active === s.pause.active) return;
      if (a.active && s.pause.usedMs >= TUNING.pauseAllowanceMs) {
        return void ev.push({ type: 'PAUSE_EXHAUSTED', at: now });
      }
      s.pause.active = a.active;
      ev.push({ type: 'PAUSE_CHANGED', at: now, active: a.active });
      return;
    }
  }
}
