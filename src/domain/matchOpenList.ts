import { OpenList, type ListState } from "@/types/dashboard";

export function matchOpenList<R>(open: OpenList, handlers: { [K in OpenList]: () => R }): R {
  return handlers[open]();
}

export function matchListState<R>(
  list: ListState,
  handlers: { [K in OpenList]: (value: Extract<ListState, { open: K }>) => R },
): R {
  switch (list.open) {
    case OpenList.sessions:
      return handlers[OpenList.sessions](list);
    case OpenList.players:
      return handlers[OpenList.players](list);
    case OpenList.noShows:
      return handlers[OpenList.noShows](list);
  }
}
