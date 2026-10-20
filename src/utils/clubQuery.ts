import { OpenList } from "@/types/dashboard";
import type { SortDir } from "@/types/list";

export function openMetric(value: string | null): OpenList | null {
  if (value === OpenList.sessions || value === OpenList.players || value === OpenList.noShows) return value;
  return null;
}

export function sortDir(value: string | null): SortDir | null {
  return value === "asc" || value === "desc" ? value : null;
}

export function writeClubQuery(
  replace: (href: string, options?: { scroll?: boolean }) => void,
  next: {
    club: string;
    from?: string;
    to?: string;
    open: OpenList | null;
    q?: string;
    sort?: string | null;
    dir?: SortDir | null;
    page?: number;
  },
) {
  const params = new URLSearchParams();
  params.set("club", next.club);
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.open) params.set("open", next.open);
  if (next.q) params.set("q", next.q);
  if (next.sort) params.set("sort", next.sort);
  if (next.sort && next.dir) params.set("dir", next.dir);
  if (next.page && next.page > 1) params.set("page", String(next.page));
  replace(`/?${params.toString()}`, { scroll: false });
}
