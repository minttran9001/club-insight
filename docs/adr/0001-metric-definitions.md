# Count unrecorded bookings as active, and missing attendance as unknown

Hosts often leave attendance blank. Treating those kept bookings as absences would count players out for a mark nobody made, and treating a range of blank attendance as zero no-shows would look like a perfect record. An active player therefore includes someone who kept a booking when attendance was not taken. A no-show is counted only where attendance was taken. When the range has held sessions and attendance was taken at none of them, the no-show result is unknown rather than zero.
