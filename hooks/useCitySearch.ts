import { useEffect, useState } from 'react';

import type { City } from '@/domain/prayer';
import { searchCities } from '@/services/prayerApi';

const MIN_CHARS = 3;
const DEBOUNCE_MS = 400;

export function useCitySearch(query: string): { results: City[]; error: string | null } {
  const [results, setResults] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_CHARS) return setResults([]);
    const timer = setTimeout(() => {
      searchCities(q)
        .then((r) => { setResults(r); setError(null); })
        .catch((e: unknown) => { setResults([]); setError(e instanceof Error ? e.message : String(e)); });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);
  return { results, error };
}
