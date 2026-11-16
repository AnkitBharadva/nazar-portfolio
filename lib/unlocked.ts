"use client";

/**
 * Tiny external store for the set of unsealed project ids, persisted in
 * localStorage. Read through `useSyncExternalStore` so server rendering
 * (all sealed) and the hydrated client never mismatch.
 */

const KEY = "nazar-unlocked";

let unlocked = new Set<string>();
const listeners = new Set<() => void>();

/**
 * Cached snapshot array. `useSyncExternalStore` compares snapshots with
 * `Object.is`, so returning a fresh array on every call reads as "changed"
 * on every render and React loops forever ("Maximum update depth
 * exceeded"). The snapshot is rebuilt only when the set actually changes.
 */
const EMPTY_SNAPSHOT: string[] = [];
let snapshot: string[] = EMPTY_SNAPSHOT;

function refreshSnapshot(): void {
  snapshot = [...unlocked];
}

function load(): void {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      unlocked = new Set(parsed.filter((v): v is string => typeof v === "string"));
      refreshSnapshot();
    }
  } catch {
    // Private mode or corrupt data — start sealed.
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...unlocked]));
  } catch {
    // Private mode — unlocking still works for the session.
  }
}

function emit(): void {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") load();

export function subscribeUnlocked(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUnlockedSnapshot(): string[] {
  return snapshot;
}

export function getUnlockedServerSnapshot(): string[] {
  return EMPTY_SNAPSHOT;
}

export function unlockId(id: string): void {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  refreshSnapshot();
  persist();
  emit();
}

export function unlockAllIds(ids: string[]): void {
  unlocked = new Set(ids);
  refreshSnapshot();
  persist();
  emit();
}

export function resealAllIds(): void {
  unlocked = new Set();
  refreshSnapshot();
  persist();
  emit();
}
