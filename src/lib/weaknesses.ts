import type { Card, Pair } from "../data/pairs";
import { shuffle } from "./theme";

const WEAKNESS_KEY = "archpull-weaknesses";
export const WEAKNESS_SESSION_TITLE = "Revisão de fraquezas";

export interface WeaknessEntry {
  a: string;
  b: string;
  match: boolean;
  explanation?: string;
  errors: number;
  themeTitle: string;
}

type WeaknessStore = Record<string, WeaknessEntry>;

// Canonical key: sort concepts so order doesn't matter
function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|||");
}

function loadStore(): WeaknessStore {
  try {
    const raw = localStorage.getItem(WEAKNESS_KEY);
    return raw ? (JSON.parse(raw) as WeaknessStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: WeaknessStore): void {
  try {
    localStorage.setItem(WEAKNESS_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

export function recordWrongPairs(pairs: Pair[], themeTitle: string): void {
  if (pairs.length === 0) return;
  const store = loadStore();
  for (const pair of pairs) {
    const key = pairKey(pair.a, pair.b);
    const existing = store[key];
    store[key] = {
      a: pair.a,
      b: pair.b,
      match: pair.match,
      explanation: pair.explanation,
      errors: (existing?.errors ?? 0) + 1,
      themeTitle,
    };
  }
  saveStore(store);
}

export function getWeaknesses(): WeaknessEntry[] {
  return Object.values(loadStore()).sort((a, b) => b.errors - a.errors);
}

export function hasWeaknesses(): boolean {
  return Object.keys(loadStore()).length > 0;
}

// Builds a Card[] session from the N most-errored pairs
export function buildWeaknessSession(limit = 12): Card[] {
  const entries = getWeaknesses().slice(0, limit);
  if (entries.length === 0) return [];

  const intro: Card = {
    kind: "info",
    front: WEAKNESS_SESSION_TITLE,
    back: `Estes são os ${entries.length} pares que você mais errou nos temas anteriores.\n\nNão há info cards aqui: só os pares, em ordem aleatória.\n\nConcentre-se na explicação de cada um antes de avançar.`,
  };

  const shuffled = shuffle(entries);
  const pairs: Card[] = shuffled.map((e) => ({
    a: e.a,
    b: e.b,
    match: e.match,
    explanation: e.explanation,
  }));

  return [intro, ...pairs];
}
