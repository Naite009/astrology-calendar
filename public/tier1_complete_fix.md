# Magico Fi — Tier 1 Complete Fix
## Screen preview + working download + birthday mode default

---

## PART 1 — BIRTHDAY MODE DEFAULT

In the Solar Return component, find the birthdayMode state and change
the default to true:

```tsx
// CHANGE THIS:
const [birthdayMode, setBirthdayMode] = useState(false)

// TO THIS:
const [birthdayMode, setBirthdayMode] = useState(true)
```

This applies globally — every tier defaults to birthday mode on.
The toggle still works to turn it off.

---

## PART 2 — T1 BUTTON BEHAVIOR

When the T1 button is clicked it does two things:
1. Shows a Tier 1 preview panel on screen (below the button row)
2. The preview panel contains a working download button

```tsx
// In TierButtonRow or Solar Return tab component:
const [activeTier, setActiveTier] = useState<null | 1 | 2 | 3 | 4 | 5>(null)

const handleTierClick = (tier: number) => {
  setActiveTier(prev => prev === tier ? null : tier)
}
```

When activeTier === 1, render the Tier1PreviewPanel below the button row.
Clicking T1 again collapses the panel.

---

## PART 3 — TIER 1 SCREEN PREVIEW PANEL

When T1 is selected, show this panel inline below the tier buttons.
It mirrors exactly what the PDF contains.

```tsx
<div className="border border-border rounded-xl overflow-hidden mt-3">

  {/* Panel header */}
  <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span className="text-sm font-medium">Year at a Glance</span>
      <span className="text-xs text-muted-foreground">
        Plain language · 2 pages · Birthday gift
      </span>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={handleTier1Download}
        className="px-3 py-1.5 rounded text-xs font-medium
                   bg-emerald-50 text-emerald-900 border border-emerald-200
                   hover:bg-emerald-100 transition-all flex items-center gap-1"
      >
        ↓ Download PDF
      </button>
      <button
        onClick={() => setActiveTier(null)}
        className="text-muted-foreground hover:text-foreground text-sm px-2"
      >
        ✕
      </button>
    </div>
  </div>

  {/* Panel content */}
  <div className="px-4 py-4 space-y-4">
    <Tier1PreviewContent
      analysis={solarReturnAnalysis}
      natalChart={natalChart}
      birthdayMode={birthdayMode}
    />
  </div>

</div>
```

---

## PART 4 — TIER 1 PREVIEW CONTENT

Create: `src/components/solarReturn/Tier1PreviewContent.tsx`

This component shows the Tier 1 content on screen.
Same data as the PDF. No AI. Renders immediately.

### Section A — THIS YEAR'S THEME

```tsx
<div className="space-y-1">
  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
    This year's theme
  </p>
  <h3 className="text-xl font-semibold text-foreground leading-snug">
    {themeHeadline}
  </h3>
  <p className="text-sm text-muted-foreground leading-relaxed">
    {themeBody}
  </p>
</div>
<hr className="border-border" />
```

Theme headline — complete sentence, no planet names, no sign names in body:
```typescript
const getThemeHeadline = (srRisingSign: string, profectionHouse: number): string => {
  const risingQuality: Record<string, string> = {
    'Aries': 'Bold, forward-moving',
    'Taurus': 'Steady, grounding',
    'Gemini': 'Curious, connective',
    'Cancer': 'Nurturing, inward',
    'Leo': 'Radiant, expressive',
    'Virgo': 'Clear, purposeful',
    'Libra': 'Harmonizing, relational',
    'Scorpio': 'Deep, transformative',
    'Sagittarius': 'Expansive, seeking',
    'Capricorn': 'Focused, building',
    'Aquarius': 'Visionary, freeing',
    'Pisces': 'Gentle, open-hearted'
  }

  const profectionTheme: Record<number, string> = {
    1: 'fresh starts and stepping into yourself',
    2: 'building security and knowing your worth',
    3: 'learning, speaking up, and staying curious',
    4: 'home, roots, and what nourishes you',
    5: 'joy, creativity, and what lights you up',
    6: 'health, rhythm, and showing up daily',
    7: 'relationships and meaningful partnership',
    8: 'transformation and going deeper',
    9: 'expansion, travel, and finding meaning',
    10: 'purpose, work, and being seen',
    11: 'community, friendship, and shared vision',
    12: 'rest, healing, and inner renewal'
  }

  const quality = risingQuality[srRisingSign] || 'Open, receptive'
  const theme = profectionTheme[profectionHouse] || 'new beginnings'
  return `${quality} energy leads this year — a time for ${theme}.`
}
```

### Section B — THREE SNAPSHOT CARDS

```tsx
<div className="grid grid-cols-3 gap-3">
  {/* Card 1 */}
  <div className="border border-border rounded-lg p-3 space-y-1">
    <p className="text-[9px] font-bold uppercase tracking-widest"
       style={{color: '#8B6914'}}>
      Where your energy goes
    </p>
    <p className="text-sm font-medium text-foreground">
      {sunHouseTheme}
    </p>
    <p className="text-xs text-muted-foreground">
      This is where life asks for your attention this year.
    </p>
  </div>

  {/* Card 2 */}
  <div className="border border-border rounded-lg p-3 space-y-1">
    <p className="text-[9px] font-bold uppercase tracking-widest"
       style={{color: '#4A2D8A'}}>
      Your emotional weather
    </p>
    <p className="text-sm font-medium text-foreground">
      {moonKeyword}
    </p>
    <p className="text-xs text-muted-foreground">
      {moonPhaseDescription}
    </p>
  </div>

  {/* Card 3 */}
  <div className="border border-border rounded-lg p-3 space-y-1">
    <p className="text-[9px] font-bold uppercase tracking-widest"
       style={{color: '#8B3A15'}}>
      The focus of this year
    </p>
    <p className="text-sm font-medium text-foreground">
      {profectionThemePlain}
    </p>
    <p className="text-xs text-muted-foreground">
      Year {age}
    </p>
  </div>
</div>
```

Sun house theme plain language:
```typescript
const sunHouseTheme: Record<number, string> = {
  1: 'Identity & fresh starts',
  2: 'Resources & self-worth',
  3: 'Learning & connection',
  4: 'Home & roots',
  5: 'Joy & creativity',
  6: 'Health & daily rhythm',
  7: 'Relationships',
  8: 'Transformation & depth',
  9: 'Expansion & meaning',
  10: 'Career & purpose',
  11: 'Community & vision',
  12: 'Rest & inner world'
}
```

Moon keywords — quality only, never sign name:
```typescript
const moonKeywords: Record<string, string> = {
  'Aries': 'Active & independent',
  'Taurus': 'Steady & grounded',
  'Gemini': 'Curious & expressive',
  'Cancer': 'Sensitive & nurturing',
  'Leo': 'Warm & expressive',
  'Virgo': 'Thoughtful & discerning',
  'Libra': 'Balanced & relational',
  'Scorpio': 'Intense & perceptive',
  'Sagittarius': 'Free & optimistic',
  'Capricorn': 'Steady & disciplined',
  'Aquarius': 'Independent & aware',
  'Pisces': 'Intuitive & compassionate'
}
```

Moon phase plain:
```typescript
const moonPhaseDescription: Record<string, string> = {
  'New Moon': 'A year of fresh starts — plant new seeds',
  'Waxing Crescent': 'A building year — keep going',
  'First Quarter': 'A year of action — push through',
  'Waxing Gibbous': 'A year of refinement — almost there',
  'Full Moon': 'A completion year — things come full circle',
  'Waning Gibbous': 'A year of sharing — give what you have learned',
  'Last Quarter': 'A year of release — let go gracefully',
  'Balsamic': 'A quiet year — rest before the next chapter'
}
```

### Section C — HOW THIS YEAR MEETS YOU

```tsx
<div className="space-y-2">
  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
    How this year meets you
  </p>
  <p className="text-xs text-muted-foreground italic">
    Your natal chart is who you are. Your Solar Return shows how
    this year's energy meets that.
  </p>

  {/* Three planet cards */}
  {[
    {
      planet: 'YOUR SUN',
      natalTag: `${natalSunSign} natal`,
      srTag: `${srSunHouse}H SR`,
      headline: getSunHeadline(natalSunSign, srSunHouse),
      body: getSunBody(natalSunSign, srSunHouse),
      headerBg: '#FFFBF0',
      labelColor: '#8B6914'
    },
    {
      planet: 'YOUR MOON',
      natalTag: `${natalMoonSign} natal`,
      srTag: `${srMoonSign} SR`,
      headline: getMoonHeadline(natalMoonSign, srMoonSign),
      body: getMoonBody(natalMoonSign, srMoonSign),
      headerBg: '#F5F0FA',
      labelColor: '#4A2D8A',
      isOpposite: isOppositeSign(natalMoonSign, srMoonSign)
    },
    {
      planet: 'YOUR RISING',
      natalTag: `${natalRisingSign} natal`,
      srTag: `${srRisingSign} SR`,
      headline: getRisingHeadline(natalRisingSign, srRisingSign),
      body: getRisingBody(natalRisingSign, srRisingSign),
      headerBg: '#FDF5EE',
      labelColor: '#8B3A15',
      isOpposite: isOppositeSign(natalRisingSign, srRisingSign)
    }
  ].map((card, i) => (
    <div key={i} className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border"
           style={{background: card.headerBg}}>
        <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{color: card.labelColor}}>
          {card.planet}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-800">
            {card.natalTag}
          </span>
          <span className="text-[9px] text-muted-foreground">→</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-800">
            {card.srTag}
          </span>
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-foreground mb-1">{card.headline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{card.body}</p>
        {card.isOpposite && (
          <span className="inline-block text-[9px] font-medium px-2 py-0.5 rounded-full mt-1.5 bg-amber-50 text-amber-800">
            Opposite sign shift
          </span>
        )}
      </div>
    </div>
  ))}
</div>
```

Opposite sign detection:
```typescript
const isOppositeSign = (sign1: string, sign2: string): boolean => {
  const opposites: Record<string, string> = {
    'Aries': 'Libra', 'Taurus': 'Scorpio', 'Gemini': 'Sagittarius',
    'Cancer': 'Capricorn', 'Leo': 'Aquarius', 'Virgo': 'Pisces',
    'Libra': 'Aries', 'Scorpio': 'Taurus', 'Sagittarius': 'Gemini',
    'Capricorn': 'Cancer', 'Aquarius': 'Leo', 'Pisces': 'Virgo'
  }
  return opposites[sign1] === sign2
}
```

### Section D — THREE WORDS

```tsx
<div className="space-y-2">
  <hr className="border-border" />
  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
    Three words for {year}
  </p>
  <p className="text-center text-base font-medium tracking-wide"
     style={{color: '#5C5450', fontFamily: 'Georgia, serif'}}>
    {word1}  ·  {word2}  ·  {word3}
  </p>
  <hr className="border-border" />
</div>
```

Word logic:
```typescript
const getThreeWords = (
  dominantElement: string,
  profectionHouse: number,
  srMoonSign: string
) => {
  const elementWord: Record<string, string> = {
    'Fire': 'Ignition', 'Earth': 'Roots',
    'Air': 'Clarity', 'Water': 'Depth'
  }
  const houseWord: Record<number, string> = {
    1: 'Identity', 2: 'Resources', 3: 'Expression', 4: 'Home',
    5: 'Joy', 6: 'Service', 7: 'Partnership', 8: 'Transformation',
    9: 'Expansion', 10: 'Purpose', 11: 'Community', 12: 'Surrender'
  }
  const moonWord: Record<string, string> = {
    'Aries': 'Courage', 'Taurus': 'Patience', 'Gemini': 'Curiosity',
    'Cancer': 'Nurture', 'Leo': 'Radiance', 'Virgo': 'Precision',
    'Libra': 'Balance', 'Scorpio': 'Depth', 'Sagittarius': 'Freedom',
    'Capricorn': 'Mastery', 'Aquarius': 'Vision', 'Pisces': 'Flow'
  }
  return {
    word1: elementWord[dominantElement] || 'Clarity',
    word2: houseWord[profectionHouse] || 'Growth',
    word3: moonWord[srMoonSign] || 'Flow'
  }
}
```

---

## PART 5 — WORKING DOWNLOAD BUTTON

The download button in the preview panel header calls the existing
`generateTier1SolarReturnPDF()` function.

```typescript
const handleTier1Download = async () => {
  try {
    await generateTier1SolarReturnPDF({
      natalChart,
      solarReturnChart,
      solarReturnAnalysis,
      birthdayMode,
      personalMessage,
      year: solarReturnYear
    })
  } catch (error) {
    console.error('Tier 1 PDF generation failed:', error)
    toast({ title: 'Download failed', description: 'Please try again.' })
  }
}
```

If `generateTier1SolarReturnPDF` does not exist yet, create it in
`src/lib/pdfSections/tier1Report.ts` using the design spec from
`sr_complete_spec_v3.md` which was previously provided.

The PDF must match the screen preview exactly:
- Cover: cake image (natal Sun sign) + name + year + sign line + birth info
- Page 2: theme + 3 cards + How This Year Meets You + Three Words
- No quarterly page
- No monthly page
- No AI narrative
- Birthday mode ON by default: shows personal message on cover

---

## PART 6 — BIRTHDAY MODE TOGGLE LOCATION

The birthday mode toggle should be visible near the top of the
Solar Return tab — not buried. Place it in the chart selector area:

```tsx
<div className="flex items-center gap-3">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={birthdayMode}
      onChange={(e) => setBirthdayMode(e.target.checked)}
      className="rounded"
    />
    <span className="text-sm text-muted-foreground">
      Birthday mode
    </span>
  </label>
  {birthdayMode && (
    <input
      type="text"
      placeholder="Personal message (optional)"
      value={personalMessage}
      onChange={(e) => setPersonalMessage(e.target.value)}
      className="text-sm border rounded px-2 py-1 flex-1 max-w-xs"
    />
  )}
</div>
```

Default: birthdayMode = true, personalMessage = ''

---

## FILES TO CREATE / MODIFY

| Action | File |
|--------|------|
| Create | `src/components/solarReturn/Tier1PreviewContent.tsx` |
| Modify | `src/components/solarReturn/TierButtonRow.tsx` — wire T1 click to show panel |
| Modify | Solar Return tab — change birthdayMode default to true |
| Modify | Solar Return tab — add birthday mode toggle near chart selector |
| Verify/Create | `src/lib/pdfSections/tier1Report.ts` — must export generateTier1SolarReturnPDF |

---

## PASTE INSTRUCTION FOR LOVABLE

"Do all of the following in one build:
1. Change birthdayMode default to true everywhere in the Solar Return tab.
2. Add a birthday mode toggle with optional personal message input near the chart selector.
3. Wire the T1 tier button so clicking it shows an inline preview panel below the button row with the Tier 1 content (theme headline, 3 snapshot cards, How This Year Meets You planet cards, Three Words section).
4. Add a working Download PDF button in the T1 preview panel header that calls generateTier1SolarReturnPDF().
5. The preview panel closes when T1 is clicked again or when the X is clicked.
Use the component structure and all data mappings in this spec exactly."
