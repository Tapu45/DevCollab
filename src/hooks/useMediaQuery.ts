import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a media query matches.
 * @param query - The media query string (e.g., '(min-width: 640px)').
 * @returns boolean - True if the query matches, false otherwise.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        // Handle SSR: Ensure window is available
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        // Set initial state
        setMatches(media.matches);

        // Listener for changes
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        media.addEventListener('change', listener);

        // Cleanup
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
}