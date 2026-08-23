import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface FilterState {
  search: string;
  category: string;
  month: string;         // 'all' | 'YYYY-MM'
  timing: string;        // 'all' | 'upcoming' | 'past'
}

const DEFAULTS: FilterState = {
  search: '',
  category: 'all',
  month: 'all',
  timing: 'all',
};

/**
 * Hook that keeps filter state in sync with URL search params.
 * - `debouncedSearch` lags 300ms behind the live `search` value so typing is snappy.
 * - `toAPIParams()` returns a plain object ready to spread into URLSearchParams for backend calls.
 * - `hasActiveFilters` tells the UI whether to show a "Clear Filters" badge / button.
 */
export function useFilterState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Hydrate from URL on first mount
  const initial: FilterState = {
    search:   searchParams.get('q')        || DEFAULTS.search,
    category: searchParams.get('category') || DEFAULTS.category,
    month:    searchParams.get('month')    || DEFAULTS.month,
    timing:   searchParams.get('timing')   || DEFAULTS.timing,
  };

  const [filters, setFilters] = useState<FilterState>(initial);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const isFirstRender = useRef(true);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(id);
  }, [filters.search]);

  // Sync state → URL (skip on very first render to avoid replacing history on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (filters.search)                     params.set('q', filters.search);
    if (filters.category !== 'all')         params.set('category', filters.category);
    if (filters.month    !== 'all')         params.set('month', filters.month);
    if (filters.timing   !== 'all')         params.set('timing', filters.timing);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULTS });
    setDebouncedSearch('');
  }, []);

  const hasActiveFilters = useMemo(() =>
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.month !== 'all' ||
    filters.timing !== 'all',
  [filters]);

  /** Build a params object that mirrors what a backend API would accept. */
  const toAPIParams = useCallback((): Record<string, string> => {
    const p: Record<string, string> = {};
    if (debouncedSearch)              p.search   = debouncedSearch;
    if (filters.category !== 'all')   p.category = filters.category;
    if (filters.month    !== 'all')   p.month    = filters.month;
    if (filters.timing   !== 'all')   p.timing   = filters.timing;
    return p;
  }, [debouncedSearch, filters.category, filters.month, filters.timing]);

  return {
    filters,
    debouncedSearch,
    setFilter,
    clearFilters,
    hasActiveFilters,
    toAPIParams,
  };
}
