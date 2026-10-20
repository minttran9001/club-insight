import type { NoShowKind, NoShowListReport } from "@/types/noShow";
import type { ActivePlayerItem } from "@/types/player";
import type { DateRange } from "@/types/range";
import type { SessionListItem } from "@/types/session";
import type { SortDir } from "@/types/list";

export const OpenList = {
  sessions: "sessions",
  players: "players",
  noShows: "noshows",
} as const;

export type OpenList = (typeof OpenList)[keyof typeof OpenList];

export type WeekPoint = {
  weekStart: string;
  label: string;
  count: number;
  partial: boolean;
  text: string;
};

export type DashboardReport = {
  clubId: string;
  range: DateRange;
  comparison: DateRange & { label: string };
  hasHeldSession: boolean;
  message: string | null;
  showChart: boolean;
  sessionsHeld: { value: number; delta: number };
  activePlayers: { value: number; delta: number };
  noShows: {
    kind: NoShowKind;
    value: number | null;
    delta: number | null;
    attendanceTaken: number;
    heldSessions: number;
  };
  weeks: WeekPoint[];
};

export type ListRequest = {
  q: string;
  sort: string | null;
  dir: SortDir | null;
  page: number;
  pageSize: number;
};

type Listed = {
  clubId: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  total: number;
  q: string;
  sort: string | null;
  dir: SortDir | null;
};

export type ListState =
  | (Listed & { open: typeof OpenList.sessions; sessions: SessionListItem[] })
  | (Listed & { open: typeof OpenList.players; players: ActivePlayerItem[] })
  | (Listed & { open: typeof OpenList.noShows; report: NoShowListReport });

export type DashboardQuery = {
  club?: string;
  from?: string;
  to?: string;
  open?: OpenList | null;
  q?: string;
  sort?: string | null;
  dir?: SortDir | null;
  page?: number;
};
