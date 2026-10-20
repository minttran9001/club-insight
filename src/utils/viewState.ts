import type { ListState, OpenMetric, QueryError } from "@/types/dashboard";
import type { SortDir } from "@/types/list";

export function sameList(
  list: ListState,
  requested: {
    club: string;
    from: string;
    to: string;
    open: OpenMetric;
    q: string;
    sort: string | null;
    dir: SortDir | null;
    page: number;
    pageSize: number;
  },
): boolean {
  return (
    list.clubId === requested.club &&
    list.from === requested.from &&
    list.to === requested.to &&
    list.open === requested.open &&
    list.q === requested.q &&
    list.sort === requested.sort &&
    list.dir === requested.dir &&
    list.page === requested.page &&
    list.pageSize === requested.pageSize
  );
}


export function clearQueryError(
  error: QueryError | null,
  club: string,
  from: string,
  to: string,
  open?: OpenMetric,
): QueryError | null {
  if (!error) return null;
  if (error.club !== club || error.from !== from || error.to !== to) return error;
  if (open !== undefined && error.open !== open) return error;
  return null;
}
