import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Suggestions {
    projectIdeas: string[];
    skillSuggestions: string;
    fromCache: boolean;
}

export function useSuggestions() {
    const { user } = useUser();
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = async (force = false) => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const method = force ? 'POST' : 'GET';
            const body = force ? JSON.stringify({ force: true }) : undefined;

            const response = await fetch('/api/suggestions/project', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const result = await response.json();
            setSuggestions(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [user?.id]);

    const refreshSuggestions = () => fetchSuggestions(true);

    return {
        suggestions,
        loading,
        error,
        refreshSuggestions,
    };
}