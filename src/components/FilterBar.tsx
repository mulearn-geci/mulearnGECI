import React from 'react';
import { Search, X, Calendar, SlidersHorizontal } from 'lucide-react';
import type { FilterState } from '../hooks/useFilterState';

interface FilterBarProps {
  filters: FilterState;
  debouncedSearch: string;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;

  /** Dynamic categories derived from the loaded data. */
  categories: string[];

  /** Month options derived from the loaded data, e.g. ['2026-08', '2026-07'] */
  monthOptions: { value: string; label: string }[];

  /** Show the Upcoming / Past toggle.  Disable for Gallery (it has no future concept). */
  showTimingFilter?: boolean;

  /** Placeholder text inside the search bar. */
  searchPlaceholder?: string;

  /** Total count of results currently shown (for the badge). */
  resultCount?: number;
}

export function FilterBar({
  filters,
  setFilter,
  clearFilters,
  hasActiveFilters,
  categories,
  monthOptions,
  showTimingFilter = false,
  searchPlaceholder = 'Search...',
  resultCount,
}: FilterBarProps) {
  return (
    <div className="w-full space-y-4">
      {/* ─── Row 1: Search + Date + optional timing ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Month / Year picker */}
        {monthOptions.length > 0 && (
          <div className="relative min-w-[160px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={filters.month}
              onChange={e => setFilter('month', e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">All Months</option>
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Upcoming / Past toggle (events only) */}
        {showTimingFilter && (
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
            {[
              { key: 'all',      label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past',     label: 'Past' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter('timing', opt.key)}
                className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filters.timing === opt.key
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Row 2: Category pills + result count + clear ─── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category pills */}
        {categories.length > 1 && (
          <>
            {['all', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter('category', cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filters.category === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tabular-nums">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all cursor-pointer"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Empty State component ─── */
interface EmptyFilterStateProps {
  clearFilters: () => void;
  title?: string;
  description?: string;
}

export function EmptyFilterState({
  clearFilters,
  title = 'No results found',
  description = 'Try adjusting your search or filter criteria.',
}: EmptyFilterStateProps) {
  return (
    <div className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-5">
        <SlidersHorizontal className="h-7 w-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">{description}</p>
      <button
        onClick={clearFilters}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
      >
        <X className="h-4 w-4" />
        Clear All Filters
      </button>
    </div>
  );
}
