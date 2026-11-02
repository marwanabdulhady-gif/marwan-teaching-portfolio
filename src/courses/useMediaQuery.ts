import { useEffect, useState } from 'react';

/** Subscribe to a CSS media query (defaults to false while unknown). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const sync = () => setMatches(list.matches);
    sync();
    list.addEventListener('change', sync);
    return () => list.removeEventListener('change', sync);
  }, [query]);

  return matches;
}

/** True on screens where the map uses lanes instead of a vertical timeline. */
export const useIsWide = () => useMediaQuery('(min-width: 1024px)');
