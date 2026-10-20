import type { MetricBooking } from "@/types/booking";
import type { PlayerRecord } from "@/types/player";
import type { DateRange } from "@/types/range";
import type { SessionRecord } from "@/types/session";

export type ClubRecord = {
  id: string;
  name: string;
  timeZone: string;
  createdAt: string;
};

export type ClubPresets = {
  fourWeeks: DateRange;
  twelveWeeks: DateRange;
  all: DateRange;
};

export type ClubSummary = ClubRecord & {
  presets: ClubPresets;
};

export type ClubBundle = {
  club: ClubRecord;
  sessions: SessionRecord[];
  bookings: MetricBooking[];
  players: PlayerRecord[];
};
