import type { Note } from '../types';

export type AppView = 'home' | 'category' | 'note';

export interface AppRouteState {
  view: AppView;
  activeCategory: string | null;
  activeNoteId: string | null;
}

const HOME_ROUTE: AppRouteState = {
  view: 'home',
  activeCategory: null,
  activeNoteId: null,
};

export function getHomeRoute(): AppRouteState {
  return HOME_ROUTE;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, '%20'));
  } catch {
    return value;
  }
}

function getSafeQueryParam(search: string, key: string) {
  const rawSearch = search.startsWith('?') ? search.slice(1) : search;
  if (!rawSearch) return null;

  for (const pair of rawSearch.split('&')) {
    if (!pair) continue;

    const [rawKey, ...rawValueParts] = pair.split('=');
    const decodedKey = safeDecodeURIComponent(rawKey ?? '');

    if (decodedKey !== key) continue;

    return safeDecodeURIComponent(rawValueParts.join('='));
  }

  return null;
}

export function resolveRouteFromSearch(search: string, notes: Note[]): AppRouteState {
  const noteId = getSafeQueryParam(search, 'note');
  const category = getSafeQueryParam(search, 'category');

  if (noteId) {
    const note = notes.find((item) => item.id === noteId);
    if (note) {
      return {
        view: 'note',
        activeNoteId: note.id,
        activeCategory: note.category,
      };
    }
  }

  if (category) {
    const hasCategory = notes.some((item) => item.category === category);
    if (hasCategory) {
      return {
        view: 'category',
        activeCategory: category,
        activeNoteId: null,
      };
    }
  }

  return HOME_ROUTE;
}

export function buildUrlForRoute(route: AppRouteState): string {
  const url = new URL(window.location.href);
  url.search = '';

  if (route.view === 'note' && route.activeNoteId) {
    url.searchParams.set('note', route.activeNoteId);
  } else if (route.view === 'category' && route.activeCategory) {
    url.searchParams.set('category', route.activeCategory);
  }

  return `${url.pathname}${url.search}`;
}
