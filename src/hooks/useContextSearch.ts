'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { settingsIndex } from '@/data/settingsIndex';

type PeopleResult = {
    id: string;
    displayName?: string | null;
    username?: string | null;
    profilePictureUrl?: string | null;
};

type SettingsResult = {
    id: string;
    title: string;
    href: string;
};

type SearchResult = {
    type: 'people' | 'settings';
    items: Array<PeopleResult | SettingsResult>;
};

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
    let t: any;
    return (...args: Parameters<F>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

export function useContextSearch() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const mode: 'collaborate' | 'network' | 'settings' | 'default' = useMemo(() => {
        if (pathname?.startsWith('/collaborate')) return 'collaborate';
        if (pathname?.startsWith('/my-network')) return 'network';
        if (pathname?.startsWith('/settings')) return 'settings';
        return 'default';
    }, [pathname]);

    const placeholder = useMemo(() => {
        switch (mode) {
            case 'collaborate':
                return 'Search people, skills...';
            case 'network':
                return 'Search within your network...';
            case 'settings':
                return 'Search settings...';
            default:
                return 'Search projects, people, skills...';
        }
    }, [mode]);

    const doSearch = useCallback(
        async (q: string) => {
            if (!q || q.trim().length < 2) {
                setResult(null);
                return;
            }
            controllerRef.current?.abort();
            const ac = new AbortController();
            controllerRef.current = ac;
            setLoading(true);

            try {
                if (mode === 'settings') {
                    const query = q.toLowerCase();
                    const items = settingsIndex
                        .filter(
                            (s) =>
                                s.title.toLowerCase().includes(query) ||
                                s.keywords?.some((k) => k.toLowerCase().includes(query)),
                        )
                        .slice(0, 10)
                        .map<SettingsResult>(({ id, title, href }) => ({ id, title, href }));
                    setResult({ type: 'settings', items });
                } else if (mode === 'network') {
                    const res = await fetch(`/api/search/connections?q=${encodeURIComponent(q)}&limit=10`, {
                        signal: ac.signal,
                    });
                    const data = await res.json();
                    const items = (data.users || []) as PeopleResult[];
                    setResult({ type: 'people', items });
                } else {
                    // collaborate or default: global people/skills via Pinecone
                    const res = await fetch(`/api/suggestions/query?q=${encodeURIComponent(q)}&limit=10`, {
                        signal: ac.signal,
                    });
                    const data = await res.json();
                    const items = ((data.users || []).map((u: any) => ({
                        id: u.profile?.id ?? u.userId,
                        displayName: u.profile?.displayName,
                        username: u.profile?.username,
                        profilePictureUrl: u.profile?.profilePictureUrl,
                    })) as PeopleResult[]);
                    setResult({ type: 'people', items });
                }
            } catch (e) {
                if ((e as any).name !== 'AbortError') {
                    console.error('Search error:', e);
                    setResult({ type: mode === 'settings' ? 'settings' : 'people', items: [] });
                }
            } finally {
                setLoading(false);
            }
        },
        [mode],
    );

    const debouncedSearch = useMemo(() => debounce(doSearch, 250), [doSearch]);

    return {
        mode,
        placeholder,
        loading,
        result,
        search: debouncedSearch,
        setResult,
    };
}