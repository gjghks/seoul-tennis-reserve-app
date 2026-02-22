import { getQueryFeatures } from '@/lib/utils/courtSearch';

type SearchEventName = 'search_open' | 'search_select' | 'search_no_results';

interface SearchEventParams {
  source: string;
  query_length_bucket?: string;
  query_script?: string;
  is_choseong_only?: boolean;
  result_count?: number;
  selected_rank?: number;
  district?: string;
  court_id?: string;
  search_variant?: string;
  ranking_profile?: string;
  algo_version?: string;
}

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  }
}

export const buildSearchTelemetry = (query: string): Omit<SearchEventParams, 'source'> => {
  const features = getQueryFeatures(query);

  return {
    query_length_bucket: features.lengthBucket,
    query_script: features.scriptType,
    is_choseong_only: features.isChoseongOnly,
  };
};

export const trackSearchEvent = (eventName: SearchEventName, params: SearchEventParams): void => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, { ...params });
};
