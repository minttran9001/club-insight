export type MetricBooking = {
  id: string;
  sessionId: string;
  playerId: string;
  status: "booked" | "cancelled";
  attended: boolean | null;
};
