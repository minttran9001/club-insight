export type MetricSession = {
  id: string;
  startsAt: string;
  status: "scheduled" | "cancelled";
  attendanceRecorded: boolean;
};

export type SessionRecord = MetricSession & {
  title: string;
  durationMinutes: number;
  places: number;
};

export type SessionListItem = {
  id: string;
  title: string;
  startsAt: string;
  localStart: string;
  durationMinutes: number;
  places: number;
  keptBookings: number;
  cancelledBookings: number;
  attended: number | null;
  noShows: number | null;
  attendanceRecorded: boolean;
};

export type UnrecordedSessionItem = {
  id: string;
  title: string;
  startsAt: string;
  localStart: string;
};
