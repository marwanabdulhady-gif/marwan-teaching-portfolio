import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

/**
 * A tiny History-API router (no dependency) for the three pages of the site:
 *
 *   /         profile, EdTech designs, AI studio, enquiries
 *   /courses  visual math models + the lesson library
 *   /games    FIKR Math Arcade + live rooms
 *
 * Any other path renders the home page.
 */
export type RoutePath = '/' | '/courses' | '/games';

const PAGES: RoutePath[] = ['/', '/courses', '/games'];
const NAV_EVENT = 'teach:navigate';

/** Which page each in-page section lives on (used when it isn't mounted yet). */
const SECTION_PAGE: Record<string, RoutePath> = {
  hero: '/',
  about: '/',
  gallery: '/',
  experience: '/',
  designs: '/',
  studio: '/',
  work: '/',
  'visual-math': '/courses',
  resources: '/courses',
  lab: '/games',
};

/** Top-bar items that open a whole page rather than scrolling to a section. */
export const PAGE_NAV: Record<string, RoutePath> = {
  resources: '/courses',
  lab: '/games',
};

let pendingSection: string | null = null;

export function normalizePath(path: string): RoutePath {
  const clean = path.replace(/\/+$/, '') || '/';
  return (PAGES as string[]).includes(clean) ? (clean as RoutePath) : '/';
}

export const currentPath = (): RoutePath => normalizePath(window.location.pathname);

export function usePath(): RoutePath {
  const [path, setPath] = useState<RoutePath>(currentPath);
  useEffect(() => {
    const sync = () => setPath(currentPath());
    window.addEventListener('popstate', sync);
    window.addEventListener(NAV_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(NAV_EVENT, sync);
    };
  }, []);
  return path;
}

/** Scroll to an element under the fixed nav, using Lenis when it is running. */
function scrollToElement(el: HTMLElement, offset = 88, immediate = false) {
  const lenis = (window as any).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -offset, immediate });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: immediate ? 'auto' : 'smooth' });
}

export function scrollToTop(immediate = false) {
  const lenis = (window as any).__lenis;
  if (lenis) lenis.scrollTo(0, { immediate });
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
}

/** Go to a page. With a section id it scrolls there once the page has mounted. */
export function navigate(path: RoutePath, section?: string) {
  const target = normalizePath(path);
  if (target === currentPath()) {
    if (section) scrollToSection(section);
    else scrollToTop();
    return;
  }
  pendingSection = section ?? null;
  window.history.pushState({}, '', target);
  window.dispatchEvent(new Event(NAV_EVENT));
}

/**
 * Scroll to a section wherever it lives: right here if it is on screen's page,
 * otherwise switch page first and scroll once it has mounted.
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    scrollToElement(el);
    return;
  }
  const page = SECTION_PAGE[id];
  if (page && page !== currentPath()) navigate(page, id);
}

/** Called by the app after each page change to settle the scroll position. */
export function settleScroll(initial: boolean) {
  const id = pendingSection ?? (initial ? window.location.hash.slice(1) : '');
  pendingSection = null;
  if (!initial) scrollToTop(true); // never animate from the previous page's offset
  if (!id) return;
  // Images and fonts keep shifting the layout for a moment after mount, so the
  // first measurement is off. Jump there, then re-aim until it holds still.
  const aim = (immediate: boolean) => {
    const el = document.getElementById(id);
    if (!el) return;
    const off = el.getBoundingClientRect().top - 88;
    if (Math.abs(off) > 6) scrollToElement(el, 88, immediate);
  };
  window.setTimeout(() => aim(false), 160);
  window.setTimeout(() => aim(true), 700);
  window.setTimeout(() => aim(true), 1400);
}

/** Run `fn` once the page that owns a feature has mounted (e.g. open a lesson). */
export function afterPageMount(page: RoutePath, fn: () => void) {
  if (currentPath() === page) {
    fn();
    return;
  }
  navigate(page);
  window.setTimeout(fn, 260);
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: RoutePath;
  /** Optional section id to scroll to after arriving. */
  section?: string;
}

/** An anchor that navigates in-app, but still opens in a new tab on ctrl/middle-click. */
export function Link({ to, section, onClick, children, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to, section);
  };
  return (
    <a href={section ? `${to}#${section}` : to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
