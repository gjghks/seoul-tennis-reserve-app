'use client';

import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface AlertSetting {
  id: string;
  alert_type: 'favorite_available' | 'district_available';
  target_id: string;
  target_name: string;
  district_slug: string | null;
  enabled: boolean;
  created_at: string;
}

const fetcher = async (url: string): Promise<AlertSetting[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.alerts ?? [];
};

export function useAlertSettings() {
  const { user } = useAuth();

  const { data: alerts, error, isLoading, mutate } = useSWR<AlertSetting[]>(
    user ? '/api/alerts' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );

  const toggleAlert = async (
    alertType: AlertSetting['alert_type'],
    targetId: string,
    targetName: string,
    districtSlug?: string
  ): Promise<boolean> => {
    if (!user) return false;

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertType, targetId, targetName, districtSlug }),
    });

    if (!res.ok) return false;
    await mutate();
    return true;
  };

  const removeAlert = async (alertId: string): Promise<boolean> => {
    if (!user) return false;

    const res = await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
    if (!res.ok) return false;
    await mutate();
    return true;
  };

  const isAlertEnabled = (alertType: AlertSetting['alert_type'], targetId: string): boolean => {
    return alerts?.some(
      (a) => a.alert_type === alertType && a.target_id === targetId && a.enabled
    ) ?? false;
  };

  return {
    alerts: alerts ?? [],
    isLoading,
    error,
    toggleAlert,
    removeAlert,
    isAlertEnabled,
    mutate,
  };
}
