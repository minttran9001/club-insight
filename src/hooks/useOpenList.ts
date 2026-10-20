"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/apiClient/apiError";
import { isAborted } from "@/apiClient/client";
import { loadList } from "@/apiClient/loadList";
import { rangeFetchDebounceMs } from "@/constants/timing";
import { DEFAULT_PAGE_SIZE } from "@/domain/pageList";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ListState, OpenMetric, QueryError } from "@/types/dashboard";
import { clearQueryError, sameList } from "@/utils/viewState";

type OpenListQuery = {
  clubId: string;
  from: string;
  to: string;
  open: OpenMetric;
  search: string;
  sort: string | null;
  direction: "asc" | "desc" | null;
  page: number;
};

export function useOpenList(query: {
  open: OpenMetric;
  search: string;
  sort: string | null;
  direction: string | null;
  page: number;
  settledClub: string | null;
  settledFrom: string | null;
  settledTo: string | null;
  rangeHasSettled: boolean;
}) {
  const { open, search, sort, direction, page, settledClub, settledFrom, settledTo, rangeHasSettled } = query;
  const settledSearch = useDebouncedValue(search, rangeFetchDebounceMs);
  const [loadedList, setLoadedList] = useState<ListState | null>(null);
  const [listError, setListError] = useState<QueryError | null>(null);
  const [openListQuery, setOpenListQuery] = useState<OpenListQuery | null>(null);

  if (rangeHasSettled && settledClub && settledFrom && settledTo) {
    const nextQuery: OpenListQuery = {
      clubId: settledClub,
      from: settledFrom,
      to: settledTo,
      open,
      search,
      sort,
      direction: sort ? (direction === "desc" ? "desc" : "asc") : null,
      page,
    };
    if (shouldCommit(openListQuery, nextQuery, settledSearch === search)) setOpenListQuery(nextQuery);
  }

  useEffect(() => {
    if (!openListQuery) return;
    const controller = new AbortController();
    const requested = {
      club: openListQuery.clubId,
      from: openListQuery.from,
      to: openListQuery.to,
      open: openListQuery.open,
      q: openListQuery.search,
      sort: openListQuery.sort,
      dir: openListQuery.direction,
      page: openListQuery.page,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    loadList(requested.open, { clubId: requested.club, from: requested.from, to: requested.to }, requested, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        if (!sameList(next, requested)) return;
        setLoadedList(next);
        setListError((current) => clearQueryError(current, next.clubId, next.from, next.to, next.open));
      })
      .catch((caught: unknown) => {
        if (isAborted(caught, controller.signal)) return;
        setListError({
          club: requested.club,
          from: requested.from,
          to: requested.to,
          open: requested.open,
          q: requested.q,
          sort: requested.sort,
          dir: requested.dir,
          page: requested.page,
          message: errorMessage(caught, "Could not load this list."),
        });
      });
    return () => controller.abort();
  }, [openListQuery]);

  const visibleList =
    loadedList !== null &&
    openListQuery !== null &&
    loadedList.clubId === openListQuery.clubId &&
    loadedList.from === openListQuery.from &&
    loadedList.to === openListQuery.to &&
    loadedList.open === openListQuery.open
      ? loadedList
      : null;
  const listIsRefreshing =
    visibleList !== null &&
    openListQuery !== null &&
    (visibleList.q !== openListQuery.search ||
      visibleList.sort !== openListQuery.sort ||
      visibleList.dir !== openListQuery.direction ||
      visibleList.page !== openListQuery.page);
  const listErrorMessage =
    openListQuery !== null &&
    listError &&
    listError.club === openListQuery.clubId &&
    listError.from === openListQuery.from &&
    listError.to === openListQuery.to &&
    listError.open === openListQuery.open &&
    listError.q === openListQuery.search &&
    listError.sort === openListQuery.sort &&
    listError.dir === openListQuery.direction &&
    listError.page === openListQuery.page
      ? listError.message
      : null;

  return { visibleList, listIsRefreshing, listErrorMessage };
}

function shouldCommit(current: OpenListQuery | null, next: OpenListQuery, searchHasSettled: boolean): boolean {
  if (current === null) return true;
  const scopeChanged =
    current.clubId !== next.clubId ||
    current.from !== next.from ||
    current.to !== next.to ||
    current.open !== next.open ||
    current.sort !== next.sort ||
    current.direction !== next.direction;
  if (scopeChanged) return true;
  return searchHasSettled && (current.search !== next.search || current.page !== next.page);
}
