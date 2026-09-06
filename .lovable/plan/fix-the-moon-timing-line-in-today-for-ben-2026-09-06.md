# Fix the Moon timing line in "Today for Ben"

## What I confirmed

- You are right about Leo. The Moon does not enter Leo today. It enters Leo on **Monday, September 7 at 12:49 PM New York time**. The panel printed only the clock time with no day, so tomorrow's ingress read as if it were today.
- The panel is **not live**. It calculates once when the card opens and only recalculates if you switch to a different person. Leaving the page open all day will not move it forward, and it will not announce a house change or a sign change as it happens.
- The house math itself is sound: it does track cusp crossings inside the current sign and can print "in your 11th house until 3:47 PM, then your 12th house...". It just never refreshes and never says which day the times fall on.
- The time zone label is hard-coded to "ET" in one of the two places that print this line.

## What I will change

1. **Say the day when it is not today.** Any time that falls after midnight tonight prints as "tomorrow at 12:49 PM" (or the weekday if further out), so an ingress can never masquerade as today.
2. **Make it live.** The card recalculates every minute. As the Moon crosses one of the natal cusps, the line updates on its own: the past segment drops off and the current house becomes the leading one.
3. **Announce the crossings.** Show a short upcoming-changes strip under the main line, for example "Moves into your 12th house at 3:47 PM · Enters Leo tomorrow 12:49 PM", and mark the moment a change just happened with a "just changed" note for the following hour.
4. **Use the real time zone abbreviation** from the person's chart location instead of always printing ET.
5. **Keep the wording style already agreed** for this app: no em dashes, plain language, real facts first.

## Technical notes

- `src/lib/moonHouseSchedule.ts`: add day-aware formatting (compare the target date's local calendar day with `now`, using the existing `formatLocalDateKey` helper), and derive the tz abbreviation instead of defaulting to `'ET'`. Sign-change time itself comes from `findNextMoonSignChange` and is already correct.
- `src/components/family/TodayForPersonPanel.tsx`: add a ticking `now` state (60s interval, cleared on unmount) and include it in the `useMemo` dependency list so the Moon line, aspects, and guidance all advance with the clock.
- `src/components/TodaysCosmicEnergy.tsx` passes `userTimezone` / `userTzAbbr` already; keep that path unchanged and only fix the default.
- Verification: recompute the Moon's ecliptic longitude for today and for the ingress moment with `astronomy-engine` and confirm the rendered line matches, plus a typecheck.

## Note on the earlier "internal error"

I could not find any failed request or app error behind that message: the backend is healthy and no reading requests were sent today. If it shows up again, tell me which screen and button, and I will trace it directly.
