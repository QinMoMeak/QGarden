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

export function resolveRouteFromSearch(search: string, notes: Note[]): AppRouteState {
  const params = new URLSearchParams(search);
  const noteId = params.get('note');
  const category = params.get('category');

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
  const params = new URLSearchParams();

  if (route.view === 'note' && route.activeNoteId) {
    params.set('note', route.activeNoteId);
  } else if (route.view === 'category' && route.activeCategory) {
    params.set('category', route.activeCategory);
  }

  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ''}`;
}
