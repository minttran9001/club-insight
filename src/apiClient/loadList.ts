import { fetchActivePlayers } from "@/apiClient/active-players";
import { fetchNoShows } from "@/apiClient/no-shows";
import { fetchSessions } from "@/apiClient/sessions";
import { matchOpenMetric } from "@/domain/matchOpenList";
import { OpenList, type ListRequest, type ListState, type OpenMetric } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";

export function loadList(open: OpenMetric, scope: ClubDateRange, list: ListRequest, signal: AbortSignal): Promise<ListState> {
  return matchOpenMetric<Promise<ListState>>(open, {
    [OpenList.sessions]: async () => {
      const body = await fetchSessions(scope, list, signal);
      return { open: OpenList.sessions, ...listed(body), sessions: body.sessions };
    },
    [OpenList.players]: async () => {
      const body = await fetchActivePlayers(scope, list, signal);
      return { open: OpenList.players, ...listed(body), players: body.players };
    },
    [OpenList.noShows]: async () => {
      const body = await fetchNoShows(scope, list, signal);
      return {
        open: OpenList.noShows,
        ...listed(body),
        report: {
          kind: body.kind,
          attendanceTaken: body.attendanceTaken,
          heldSessions: body.heldSessions,
          noShows: body.noShows,
        },
      };
    },
  });
}

function listed(body: ClubDateRange & { page: number; pageSize: number; total: number; q: string; sort: string | null; dir: "asc" | "desc" | null }) {
  return {
    clubId: body.clubId,
    from: body.from,
    to: body.to,
    page: body.page,
    pageSize: body.pageSize,
    total: body.total,
    q: body.q,
    sort: body.sort,
    dir: body.dir,
  };
}
