export type SortDir = "asc" | "desc";

export type ListQueryFields = {
  q: string | null;
  sort: string | null;
  dir: string | null;
  page: string | null;
  pageSize: string | null;
};

export type ParsedListQuery = {
  q: string;
  sort: string | null;
  dir: SortDir;
  page: number;
  pageSize: number;
};

export type PageColumn<T> = {
  id: string;
  text: (row: T) => string;
};

export type PageListFailure = { ok: false; error: string };
