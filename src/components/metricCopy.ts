export const sessionsHeldDefinition =
  "Sessions that went ahead in this range. Cancelled sessions are not included.";

export const activePlayersDefinition =
  "Players who attended, or who kept a booking at a session where attendance was not taken. Someone who only no-showed is not included.";

export const noShowsDefinition =
  "Kept bookings where attendance was taken and the player did not show. Sessions where attendance was not taken are left out, not counted as zero.";

export const noSessionsInRange = "No sessions in this range.";

export function attendanceCoverage(taken: number, held: number): string {
  return `Attendance was taken at ${taken} of ${held} sessions.`;
}
