import type { PageColumn } from "@/types/list";
import type { NoShowItem } from "@/types/noShow";
import type { ActivePlayerItem } from "@/types/player";
import type { SessionListItem } from "@/types/session";

function countOrUnknown(value: number | null): string {
  return value === null ? "Unknown" : String(value);
}

export const sessionListColumns: readonly PageColumn<SessionListItem>[] = [
  { id: "title", text: (session) => session.title },
  { id: "start", text: (session) => session.localStart },
  { id: "duration", text: (session) => `${session.durationMinutes} min` },
  { id: "places", text: (session) => String(session.places) },
  { id: "kept", text: (session) => String(session.keptBookings) },
  { id: "cancelled", text: (session) => String(session.cancelledBookings) },
  { id: "attended", text: (session) => countOrUnknown(session.attended) },
  { id: "noshows", text: (session) => countOrUnknown(session.noShows) },
  { id: "attendance", text: (session) => (session.attendanceRecorded ? "Recorded" : "Not recorded") },
];

export const playerListColumns: readonly PageColumn<ActivePlayerItem>[] = [
  { id: "name", text: (player) => player.name },
  { id: "joined", text: (player) => player.joinedOn },
  { id: "attended", text: (player) => String(player.sessionsAttended) },
  { id: "unrecorded", text: (player) => String(player.unrecordedSessions) },
  { id: "noshows", text: (player) => String(player.confirmedNoShows) },
];

export const noShowListColumns: readonly PageColumn<NoShowItem>[] = [
  { id: "player", text: (row) => row.playerName },
  { id: "joined", text: (row) => row.joinedOn },
  { id: "session", text: (row) => row.sessionTitle },
  { id: "start", text: (row) => row.localStart },
];
