# Club insights

A club host can see sessions held, active players, and no-shows for a date range. The screen reads the JSON API. The counts are calculated in one module, so the API and the tests stay on the same rules.

## Run

```bash
yarn
yarn dev
```

`yarn dev` rebuilds the SQLite database from `src/data/*.csv`, then starts Next.js. Open [http://localhost:3000](http://localhost:3000).

```bash
yarn test
```

Runs the no-show tests with Node’s built-in test runner. This Node version strips TypeScript, so the test does not need a separate runner.

## Decisions

The brief left these open.

- Now is Monday 5 October 2026, 09:00 in Asia/Ho_Chi_Minh.
- A held session belongs to the selected club, is not cancelled, and starts on a chosen club-local day at or before now. A chosen date includes that whole day.
- An active player attended a held session, or kept a booking on one where attendance was not taken. Someone whose only kept bookings in the range are confirmed no-shows is left out.
- A no-show is one kept booking on a held session where attendance was taken and the player did not attend. Bookings are counted, not players. Sessions where attendance was not taken are left out of the count. If the range has held sessions and attendance was taken at none of them, the result is unknown. If the range has no held sessions, there is no count.
- The comparison period is the same number of club-local days immediately before the range. Sessions held and active players always have a numeric delta. No-shows have a delta only when both periods have a count.
- A week is Monday 00:00 through the next Monday 00:00 in the club time zone. A week is partial when the range does not cover it completely. The point still counts only sessions inside the range, and a week with nobody active is 0.
- Presets are the last 4 complete weeks (the default), the last 12 complete weeks, and every week from the Monday of the first session through the Sunday of the last complete week. A club with no sessions uses the 4-week range for All.
- Deltas are signed integers, with no good or bad colour. The app opens on Saigon Smash Pickleball. Switching clubs keeps the dates and which number is open.
- The weekly chart uses Recharts. A partial week is a hollow point, and the tooltip repeats the same count as the screen-reader list.

## Next

- Record attendance so ranges that are unknown become counts.
- Add a no-show rate once coverage is high enough to trust.
- Add host sign-in.
