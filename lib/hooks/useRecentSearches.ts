import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'tennis-recent-searches';
const MAX_SEARCHES = 5;

let listeners: Array<() => void> = [];
let cachedSnapshot: string[] = [];
const SERVER_SNAPSHOT: string[] = [];

function readStorage(): string[] {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Initialize cache
cachedSnapshot = readStorage();

function getSnapshot(): string[] {
  return cachedSnapshot;
}

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  cachedSnapshot = readStorage();
  for (const listener of listeners) {
    listener();
  }
}

function writeStorage(searches: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch (e) {
    console.error('Failed to save recent searches', e);
  }
  emitChange();
}

export function useRecentSearches() {
  const searches = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addSearch = useCallback((term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;
    const filtered = searches.filter((s) => s !== trimmedTerm);
    const newSearches = [trimmedTerm, ...filtered].slice(0, MAX_SEARCHES);
    writeStorage(newSearches);
  }, [searches]);

  const removeSearch = useCallback((term: string) => {
    const newSearches = searches.filter((s) => s !== term);
    writeStorage(newSearches);
  }, [searches]);

  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear recent searches', e);
    }
    emitChange();
  }, []);

  return { searches, addSearch, removeSearch, clearAll };
}
