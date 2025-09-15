'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';

export type SearchItemBase = {
  id: string;
  // Rendering hints (optional, up to sources)
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  href?: string;
};

export type SearchResult<T extends SearchItemBase = SearchItemBase> = {
  type: string; // e.g., 'people', 'settings', 'projects'
  items: T[];
  priority?: number; // higher → shown earlier
};

export type SearchSource = {
  id: string; // unique per page/source
  label?: string;
  search: (query: string, signal?: AbortSignal) => Promise<SearchResult | null>;
};

type Ctx = {
  registerSource: (source: SearchSource) => void;
  unregisterSource: (id: string) => void;
  search: (q: string) => void;
  loading: boolean;
  results: SearchResult[];
  clear: () => void;
};

const SearchCtx = createContext<Ctx | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const sourcesRef = useRef<Map<string, SearchSource>>(new Map());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const acRef = useRef<AbortController | null>(null);

  const registerSource = useCallback((source: SearchSource) => {
    sourcesRef.current.set(source.id, source);
  }, []);

  const unregisterSource = useCallback((id: string) => {
    sourcesRef.current.delete(id);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    acRef.current?.abort();
    const ac = new AbortController();
    acRef.current = ac;

    setLoading(true);
    try {
      const sources = Array.from(sourcesRef.current.values());
      const promises = sources.map((s) =>
        s.search(q, ac.signal).catch(() => null),
      );
      const res = await Promise.all(promises);
      const merged = (res.filter(Boolean) as SearchResult[]).sort(
        (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
      );
      setResults(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      registerSource,
      unregisterSource,
      search,
      loading,
      results,
      clear,
    }),
    [registerSource, unregisterSource, search, loading, results, clear],
  );

  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchCtx);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}

export function useRegisterSearchSource(source: SearchSource) {
  const { registerSource, unregisterSource } = useSearch();
  useEffect(() => {
    registerSource(source);
    return () => unregisterSource(source.id);
  }, [registerSource, unregisterSource, source]);
}
