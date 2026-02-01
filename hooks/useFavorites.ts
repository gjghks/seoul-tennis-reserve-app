'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Favorite {
  id: string;
  user_id: string;
  svc_id: string;
  svc_name: string;
  district: string;
  place_name: string | null;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      setFavorites(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((svcId: string) => {
    return favorites.some(f => f.svc_id === svcId);
  }, [favorites]);

  const favoriteIds = favorites.map(f => f.svc_id);

  return {
    favorites,
    favoriteIds,
    loading,
    isFavorite,
    refetch: fetchFavorites,
  };
}
