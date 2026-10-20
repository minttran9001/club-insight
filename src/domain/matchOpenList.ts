import { OpenList, type ListState, type OpenMetric } from "@/types/dashboard";

export function matchOpenMetric<R>(open: OpenMetric, handlers: { [K in OpenMetric]: () => R }): R {
  return handlers[open]();
}

export function matchListState<R>(
  list: ListState,
  handlers: { [K in OpenMetric]: (value: Extract<ListState, { open: K }>) => R },
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
