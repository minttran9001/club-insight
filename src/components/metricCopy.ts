export const SESSIONS_HELD_DEFINITION_TEXT =
  "Sessions that went ahead in this range. Cancelled sessions are not included.";

export const ACTIVE_PLAYERS_DEFINITION_TEXT =
  "Players who attended, or who kept a booking at a session where attendance was not taken. Someone who only no-showed is not included.";

export const NO_SHOWS_DEFINITION_TEXT =
  "Kept bookings where attendance was taken and the player did not show. Sessions where attendance was not taken are left out, not counted as zero.";

export const NO_SESSIONS_IN_RANGE_TEXT = "No sessions in this range.";

export function attendanceCoverage(taken: number, held: number): string {
  return `Attendance was taken at ${taken} of ${held} sessions.`;
}
