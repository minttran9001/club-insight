export type PlayerRecord = {
  id: string;
  name: string;
  joinedAt: string;
};

export type ActivePlayerItem = {
  id: string;
  name: string;
  joinedAt: string;
  joinedOn: string;
  sessionsAttended: number;
  unrecordedSessions: number;
  confirmedNoShows: number;
};
