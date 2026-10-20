import type { ListRequest, OpenList } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";

export type ListKey = ClubDateRange & { open: OpenList } & ListRequest;

export function sameRange(a: ClubDateRange, b: ClubDateRange): boolean {
  return a.clubId === b.clubId && a.from === b.from && a.to === b.to;
}

export function sameListScope(a: ClubDateRange & { open: OpenList }, b: ClubDateRange & { open: OpenList }): boolean {
  return sameRange(a, b) && a.open === b.open;
}

export function sameList(a: ListKey, b: ListKey): boolean {
  return (
    sameListScope(a, b) &&
    a.q === b.q &&
    a.sort === b.sort &&
    a.dir === b.dir &&
    a.page === b.page &&
    a.pageSize === b.pageSize
  );
}
