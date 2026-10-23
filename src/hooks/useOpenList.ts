"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { loadList } from "@/apiClient/loadList";
import { RANGE_FETCH_DEBOUNCE_MS } from "@/constants/timing";
import { DEFAULT_PAGE_SIZE } from "@/domain/pageList";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ListState, OpenList } from "@/types/dashboard";
import type { SortDir } from "@/types/list";
import type { ClubDateRange } from "@/types/range";
import { sameList, sameListScope, type ListKey } from "@/utils/viewState";

export function useOpenList(query: {
  current: ClubDateRange;
  settled: ClubDateRange | null;
  rangeHasSettled: boolean;
  open: OpenList;
  q: string;
  sort: string | null;
  dir: SortDir | null;
  page: number;
}) {
  const { current, settled, rangeHasSettled, open, q, sort, page } = query;
  const dir: SortDir | null = sort ? (query.dir ?? "asc") : null;
  const settledClubId = settled?.clubId;
  const settledFrom = settled?.from;
  const settledTo = settled?.to;
  const settledQ = useDebouncedValue(q, RANGE_FETCH_DEBOUNCE_MS);
  const ready = rangeHasSettled && settledQ === q;
  const [loadedList, setLoadedList] = useState<ListState | null>(null);
  const [listError, setListError] = useState<(ListKey & { message: string }) | null>(null);

  useEffect(() => {
    if (!ready || !settledClubId || !settledFrom || !settledTo) return;
    const controller = new AbortController();
    const scope = { clubId: settledClubId, from: settledFrom, to: settledTo };
    const requested: ListKey = { ...scope, open, q, sort, dir, page, pageSize: DEFAULT_PAGE_SIZE };
    loadList(open, scope, requested, controller.signal)
      .then((next) => {
        if (controller.signal.aborted || !sameList(next, requested)) return;
        setLoadedList(next);
        setListError((error) => (error && sameListScope(error, requested) ? null : error));
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setListError({ ...requested, message: errorMessage(caught, "Could not load this list.") });
      });
    return () => controller.abort();
  }, [ready, settledClubId, settledFrom, settledTo, open, q, sort, dir, page]);

  const shown: ListKey = { ...current, open, q, sort, dir, page, pageSize: DEFAULT_PAGE_SIZE };
  const visibleList = loadedList && sameListScope(loadedList, shown) ? loadedList : null;
  const listErrorMessage = listError && sameList(listError, shown) ? listError.message : null;

  return {
    visibleList,
    listLoading: visibleList === null && listErrorMessage === null,
    listIsRefreshing: visibleList !== null && !sameList(visibleList, shown),
    listErrorMessage,
  };
}
