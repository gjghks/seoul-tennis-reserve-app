'use client';

import { useState, useCallback } from 'react';

export interface RecentCourt {
  svcId: string;
  svcName: string;
  district: string;
  placeName: string;
  districtSlug: string;
  viewedAt: number;
}

const STORAGE_KEY = 'seoul-tennis-recent-courts';
const MAX_RECENT_COURTS = 20;

export function useRecentCourts() {
  const [recentCourts, setRecentCourts] = useState<RecentCourt[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isHydrated] = useState(() => typeof window !== 'undefined');

  const addRecentCourt = useCallback((court: RecentCourt) => {
    if (typeof window === 'undefined') return;

    try {
      setRecentCourts((prev) => {
        const filtered = prev.filter((c) => c.svcId !== court.svcId);
        const updated = [{ ...court, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT_COURTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Silently fail on storage errors
    }
  }, []);

  const clearRecentCourts = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentCourts([]);
    } catch {
      // Silently fail on storage errors
    }
  }, []);

  return {
    recentCourts,
    addRecentCourt,
    clearRecentCourts,
    isHydrated,
  };
}
