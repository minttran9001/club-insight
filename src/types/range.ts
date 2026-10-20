export type DateRange = {
  from: string;
  to: string;
};

export type ClubDateRange = DateRange & {
  clubId: string;
};

/** Club and dates taken from a request, before the dates are checked. */
export type ClubDateQuery = {
  clubId: string;
  from: string | null;
  to: string | null;
};
