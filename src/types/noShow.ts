export type NoShowKind = "count" | "unknown" | "no-sessions";

export type NoShowItem = {
  bookingId: string;
  playerId: string;
  playerName: string;
  joinedAt: string;
  joinedOn: string;
  sessionId: string;
  sessionTitle: string;
  startsAt: string;
  localStart: string;
};

export type NoShowListReport = {
  kind: NoShowKind;
  attendanceTaken: number;
  heldSessions: number;
  noShows: NoShowItem[];
};
