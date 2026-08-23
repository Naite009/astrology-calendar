# Accuracy suite

Run: 2026-08-23T13:54:06.389Z
People: 20 | Sky moment for readings: 2026-06-15

## Headline

| Area | Score | Detail |
| --- | --- | --- |
| Chart math | 93.0% | 270/280 positions inside tolerance, 3 close, 7 off |
| Structural invariants | 85.0% | 119/140 held |
| Reading voice | 92.0% | 104 errors, 2 warnings across 260 blocks, 14 rules |

## Per person

| Person | Birth data | Math | Positions off | Invariants | Reading errors |
| --- | --- | --- | --- | --- | --- |
| Reference 01 New York 1955 | 1955-03-15 02:20 New York, NY, USA (America/New_York) | 95.2% | none | 1 broken | 5 |
| Reference 02 Los Angeles 1978 | 1978-07-04 12:00 Los Angeles, CA, USA (America/Los_Angeles) | 95.2% | none | 1 broken | 5 |
| Reference 03 Chicago 1988 | 1988-11-22 23:59 Chicago, IL, USA (America/Chicago) | 95.2% | none | 1 broken | 6 |
| Reference 04 London 1969 | 1969-06-01 08:08 London, England (Europe/London) | 95.2% | none | 1 broken | 4 |
| Reference 05 Paris 1993 | 1993-01-09 17:45 Paris, France (Europe/Paris) | 95.2% | none | 1 broken | 5 |
| Reference 06 Sydney 2001 | 2001-12-19 05:30 Sydney, Australia (Australia/Sydney) | 95.2% | none | 1 broken | 3 |
| Reference 07 Buenos Aires 1984 | 1984-09-27 21:15 Buenos Aires, Argentina (America/Argentina/Buenos_Aires) | 95.2% | none | 1 broken | 8 |
| Reference 08 Mumbai 1996 | 1996-04-02 14:50 Mumbai, India (Asia/Kolkata) | 83.3% | Ascendant 6°47', Midheaven 7°37' | 1 broken | 3 |
| Reference 09 Tokyo 1972 | 1972-10-08 06:00 Tokyo, Japan (Asia/Tokyo) | 95.2% | none | 1 broken | 9 |
| Reference 10 Stockholm 1961 | 1961-05-30 00:00 Stockholm, Sweden (Europe/Stockholm) | 95.2% | none | 1 broken | 4 |
| Reference 11 Johannesburg 2010 | 2010-02-14 11:11 Johannesburg, South Africa (Africa/Johannesburg) | 95.2% | none | 1 broken | 4 |
| Reference 12 Denver 1946 | 1946-08-19 10:03 Denver, CO, USA (America/Denver) | 76.2% | Moon 35.1', Ascendant 11°60', Midheaven 14°05' | 2 broken | 7 |
| Reference 13 Honolulu 1999 | 1999-03-21 19:20 Honolulu, HI, USA (Pacific/Honolulu) | 95.2% | none | 1 broken | 4 |
| Reference 14 Mexico City 2005 | 2005-06-30 04:44 Mexico City, Mexico (America/Mexico_City) | 95.2% | none | 1 broken | 4 |
| Reference 15 Moscow 1980 | 1980-07-19 16:00 Moscow, Russia (Europe/Moscow) | 95.2% | none | 1 broken | 7 |
| Reference 16 Dubai 2014 | 2014-10-31 09:25 Dubai, UAE (Asia/Dubai) | 95.2% | none | 1 broken | 7 |
| Reference 17 Toronto 1959 | 1959-04-26 13:37 Toronto, Canada (America/Toronto) | 95.2% | none | 1 broken | 5 |
| Reference 18 Singapore 1966 | 1966-12-05 22:10 Singapore (Asia/Singapore) | 83.3% | Ascendant 7°14', Midheaven 7°45' | 1 broken | 6 |
| Reference 19 Miami 2019 | 2019-08-08 03:33 Miami, FL, USA (America/New_York) | 95.2% | none | 1 broken | 4 |
| Reference 20 Berlin 1937 | 1937-02-11 12:00 Berlin, Germany (Europe/Berlin) | 92.9% | none | 1 broken | 4 |

## Writing rules triggered

| Rule | Severity | Hits |
| --- | --- | --- |
| no-vague-labels | error | 64 |
| no-em-dash | error | 40 |
| readable-sentences | warning | 2 |

## Findings to fix

### Reference 01 New York 1955

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 2nd house — money, self-worth, and what feels secure. Th…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 2nd house — money, values, and what feels secure. It's r…"
- planetSynthesis.Saturn: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Neptune: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"

### Reference 02 Los Angeles 1978

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Uranus: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Pluto: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"

### Reference 03 Chicago 1988

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Mercury: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Venus: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Venus is strong in Libra, so people often n…"
- planetSynthesis.Pluto: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 04 London 1969

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Neptune: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 05 Paris 1993

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Jupiter: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Pluto: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 06 Sydney 2001

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"

### Reference 07 Buenos Aires 1984

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 1st house — your body, your energy, how you're showing u…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 1st house — your body, identity, and how you show up. Yo…"
- planetSynthesis.Sun: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Because Sun is not at home in Libra, this s…"
- planetSynthesis.Moon: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Becaus…"
- planetSynthesis.Venus: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Becaus…"
- planetSynthesis.Saturn: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Pluto: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 08 Mumbai 1996

- Ascendant: expected Leo 17°01', app gives Leo 10°14' (off by 6°47', limit 30'). City-level coordinates and rounding to the minute both move the Ascendant slightly.
- Midheaven: expected Taurus 16°21', app gives Taurus 8°44' (off by 7°37', limit 30'). Same coordinate rounding as the Ascendant.
- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"

### Reference 09 Tokyo 1972

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Sun: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Because Sun is not at home in Libra, this s…"
- planetSynthesis.Moon: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Mercury: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Mars: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Because Mars is not at home in Libra, this…"
- planetSynthesis.Uranus: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Pluto: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"

### Reference 10 Stockholm 1961

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 1st house — your body, your energy, how you're showing u…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 1st house — your body, identity, and how you show up. It…"
- planetSynthesis.Neptune: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 11 Johannesburg 2010

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 1st house — your body, your energy, how you're showing u…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 1st house — your body, identity, and how you show up. Yo…"
- planetSynthesis.Saturn: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Saturn is strong in Libra, so people often…"

### Reference 12 Denver 1946

- Moon: expected Taurus 21°36', app gives Taurus 21°00' (off by 35.1', limit 8')
- Ascendant: expected Libra 22°32', app gives Libra 10°32' (off by 11°60', limit 30'). City-level coordinates and rounding to the minute both move the Ascendant slightly.
- Midheaven: expected Cancer 26°12', app gives Cancer 12°07' (off by 14°05', limit 30'). Same coordinate rounding as the Ascendant.
- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- Invariant broken: Timezone and daylight saving resolved correctly. expected -7h, app used -6h
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Venus: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Venus is strong in Libra, so people often n…"
- planetSynthesis.Mars: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Because Mars is not at home in Libra, this…"
- planetSynthesis.Jupiter: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Neptune: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"

### Reference 13 Honolulu 1999

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Mars: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Mars i…"

### Reference 14 Mexico City 2005

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 1st house — your body, your energy, how you're showing u…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 1st house — your body, identity, and how you show up. It…"
- planetSynthesis.Jupiter: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"

### Reference 15 Moscow 1980

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Moon: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Mars: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Because Mars is not at home in Libra, this…"
- planetSynthesis.Uranus: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Pluto: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"

### Reference 16 Dubai 2014

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Sun: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Mercury: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Others may recognize this in you before you…"
- planetSynthesis.Venus: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Becaus…"
- planetSynthesis.Saturn: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 17 Toronto 1959

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Jupiter: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Neptune: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 18 Singapore 1966

- Ascendant: expected Leo 5°51', app gives Cancer 28°38' (off by 7°14', limit 30'). City-level coordinates and rounding to the minute both move the Ascendant slightly.
- Midheaven: expected Taurus 10°11', app gives Taurus 2°26' (off by 7°45', limit 30'). Same coordinate rounding as the Ascendant.
- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 3rd house — conversations, siblings, everyday communicat…"
- planetSynthesis.Mercury: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"
- planetSynthesis.Mars: [no-vague-labels] Banned vague phrasing: "fairness". "…other people, comparing options and weighing fairness. Because Mars is not at home in Libra, this…"
- planetSynthesis.Neptune: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Others…"

### Reference 19 Miami 2019

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 3rd house — conversations, siblings, the daily-message l…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 1st house — your body, identity, and how you show up. It…"
- planetSynthesis.Moon: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Becaus…"

### Reference 20 Berlin 1937

- Invariant broken: House cusps run forward in zodiacal order. A cusp is out of order or missing.
- personalDailyGuidance.reflection: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…y's Gemini Moon is transiting your 1st house — your body, your energy, how you're showing u…"
- personalDailyGuidance.reflection: [no-vague-labels] Banned vague phrasing: "scattered". "…r you. The mood is chatty, curious, a little scattered, so pace yourself accordingly. As a First Qu…"
- mercuryRetroPersonal: [no-em-dash] Em dash in user-facing copy. Use a comma, period, colon, or parentheses. "…is in Cancer. It's transiting your 1st house — your body, identity, and how you show up. It…"
- planetSynthesis.Mars: [no-vague-labels] Banned vague phrasing: "intense". "…In Scorpio, this tends to come out quietly, intensely, and rarely showing all your cards. Mars i…"
