import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../service/request/apiError';
import type { ApiError, PageResponse } from '../types/api';

interface ListState<T> {
  items: T[];
  /** Null until the first page answers. */
  totalItems: number | null;
  nextPage: number;
  hasNext: boolean;
  loading: boolean;
  error: ApiError | null;
}

const initialState = <T>(): ListState<T> => ({
  items: [], totalItems: null, nextPage: 0, hasNext: true, loading: false, error: null,
});

/**
 * A paged list that loads the next page when its sentinel element scrolls into view.
 * `fetchPage` must be stable (a module function or a memoized callback).
 * After a failure it stops loading by itself; `loadMore` tries again. `refresh` starts over from the first page.
 */
export function useInfiniteList<T>(fetchPage: (page: number) => Promise<PageResponse<T>>) {
  const [state, setState] = useState<ListState<T>>(initialState);
  // `loading` lags one render; this ref stops a second request for the same page.
  const inFlight = useRef(false);
  // Bumped by `refresh`: an answer that started before it is dropped.
  const generation = useRef(0);
  const { nextPage, hasNext } = state;

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasNext) return;
    inFlight.current = true;
    const started = generation.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const page = await fetchPage(nextPage);
      if (started !== generation.current) return;
      setState((previous) => ({
        items: [...previous.items, ...page.items],
        totalItems: page.totalItems,
        nextPage: page.page + 1,
        hasNext: page.hasNext,
        loading: false,
        error: null,
      }));
    } catch (err) {
      if (started !== generation.current) return;
      setState((previous) => ({ ...previous, loading: false, error: toApiError(err) }));
    } finally {
      if (started === generation.current) inFlight.current = false;
    }
  }, [fetchPage, nextPage, hasNext]);

  const refresh = useCallback(() => {
    generation.current += 1;
    inFlight.current = false;
    setState(initialState);
  }, []);

  const [sentinel, setSentinel] = useState<Element | null>(null);
  const canAutoLoad = state.hasNext && !state.loading && state.error === null;

  // A new observer reports the sentinel's current position at once, so a page too short to fill the screen
  // loads the next one without waiting for a scroll. After `refresh` this loads the first page again.
  useEffect(() => {
    if (!sentinel || !canAutoLoad) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, canAutoLoad, loadMore]);

  return {
    items: state.items,
    totalItems: state.totalItems,
    hasNext: state.hasNext,
    loading: state.loading,
    error: state.error,
    loadMore,
    refresh,
    /** Put on an element after the last item. */
    sentinelRef: setSentinel,
  };
}
