import type { NoShowKind, NoShowListReport } from "@/types/noShow";
import type { ActivePlayerItem } from "@/types/player";
import type { DateRange } from "@/types/range";
import type { SessionListItem } from "@/types/session";

export const OpenList = {
  sessions: "sessions",
  players: "players",
  noShows: "noshows",
} as const;

export type OpenMetric = (typeof OpenList)[keyof typeof OpenList];

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

export type QueryError = {
  club: string;
  from: string;
  to: string;
  open?: OpenMetric;
  q?: string;
  sort?: string | null;
  dir?: string | null;
  page?: number;
  message: string;
};

export type ListRequest = {
  q: string;
  sort: string | null;
  dir: string | null;
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
  dir: string | null;
};

export type ListState =
  | (Listed & { open: typeof OpenList.sessions; sessions: SessionListItem[] })
  | (Listed & { open: typeof OpenList.players; players: ActivePlayerItem[] })
  | (Listed & { open: typeof OpenList.noShows; report: NoShowListReport });

export type DashboardQuery = {
  club?: string;
  from?: string;
  to?: string;
  open?: OpenMetric | null;
  q?: string;
  sort?: string | null;
  dir?: string | null;
  page?: number;
};
