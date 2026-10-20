"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { loadList } from "@/apiClient/loadList";
import { rangeFetchDebounceMs } from "@/constants/timing";
import { DEFAULT_PAGE_SIZE } from "@/domain/pageList";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ListState, OpenMetric, QueryError } from "@/types/dashboard";
import type { SortDir } from "@/types/list";
import { clearQueryError, sameList } from "@/utils/viewState";

export function useOpenList(query: {
  club: string;
  from: string;
  to: string;
  open: OpenMetric;
  search: string;
  sort: string | null;
  direction: SortDir | null;
  page: number;
  settledClub: string | null;
  settledFrom: string | null;
  settledTo: string | null;
  rangeHasSettled: boolean;
}) {
  const { club, from, to, open, search, sort, page, settledClub, settledFrom, settledTo, rangeHasSettled } = query;
  const dir: SortDir | null = sort ? (query.direction ?? "asc") : null;
  const settledSearch = useDebouncedValue(search, rangeFetchDebounceMs);
  const ready = rangeHasSettled && settledSearch === search;
  const [loadedList, setLoadedList] = useState<ListState | null>(null);
  const [listError, setListError] = useState<QueryError | null>(null);

  useEffect(() => {
    if (!ready || !settledClub || !settledFrom || !settledTo) return;
    const controller = new AbortController();
    const requested = { club: settledClub, from: settledFrom, to: settledTo, open, q: search, sort, dir, page, pageSize: DEFAULT_PAGE_SIZE };
    loadList(open, { clubId: settledClub, from: settledFrom, to: settledTo }, requested, controller.signal)
      .then((next) => {
        if (controller.signal.aborted || !sameList(next, requested)) return;
        setLoadedList(next);
        setListError((current) => clearQueryError(current, next.clubId, next.from, next.to, next.open));
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setListError({ ...requested, message: errorMessage(caught, "Could not load this list.") });
      });
    return () => controller.abort();
  }, [ready, settledClub, settledFrom, settledTo, open, search, sort, dir, page]);

  const visibleList =
    loadedList && loadedList.clubId === club && loadedList.from === from && loadedList.to === to && loadedList.open === open ? loadedList : null;
  const listIsRefreshing =
    visibleList !== null && (visibleList.q !== search || visibleList.sort !== sort || visibleList.dir !== dir || visibleList.page !== page);
  const listErrorMessage =
    listError &&
    listError.club === club &&
    listError.from === from &&
    listError.to === to &&
    listError.open === open &&
    listError.q === search &&
    listError.sort === sort &&
    listError.dir === dir &&
    listError.page === page
      ? listError.message
      : null;

  return { visibleList, listIsRefreshing, listErrorMessage };
}
