import type { DateRange } from "@/types/range";

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
