import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { HumanDesignChart } from '@/types/humanDesign';
import { normalizeName, namesMatch, birthDataMatches } from '@/lib/nameMatching';

export interface UnifiedProfile {
  /** Stable key for React lists – prefer natal id, fall back to HD id */
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  /** Linked natal chart (if any) */
  natalChart: NatalChart | null;
  /** Linked HD chart (if any) */
  hdChart: HumanDesignChart | null;
  /** True when both natal + HD data are present */
  isFullyLinked: boolean;
}

/**
 * Merge natal charts and HD charts into unified person profiles.
 *
 * Matching rules (in priority order):
 *  1. Name match (via namesMatch fuzzy logic) AND birthDate match
 *  2. Name match only (same first-name or contains)
 *
 * Returns a stable, alphabetically-sorted list with the primary user
 * (matching mainUserName) pinned first.
 */
export function useUnifiedProfiles(
  userNatalChart: NatalChart | null,
  savedCharts: NatalChart[],
  hdCharts: HumanDesignChart[],
  mainUserName?: string,
): UnifiedProfile[] {
  return useMemo(() => {
    // Collect all natal charts (user chart + saved), deduplicated by id AND name
    // Filter out HD charts that may have been restored into savedCharts from cloud
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const allNatal: NatalChart[] = [];
    if (userNatalChart) {
      allNatal.push(userNatalChart);
      seenIds.add(userNatalChart.id);
      seenNames.add(normalizeName(userNatalChart.name));
    }
    for (const c of savedCharts) {
      if (seenIds.has(c.id)) continue;
      // Skip HD charts that leaked into savedCharts (they have no planet data)
      if (c.id.startsWith('hd_')) continue;
      const norm = normalizeName(c.name);
      // If name already seen, prefer the chart WITH planet data
      if (seenNames.has(norm)) {
        // Check if the existing entry lacks planets but this one has them
        const existing = allNatal.find(n => normalizeName(n.name) === norm);
        if (existing && (!existing.planets || Object.keys(existing.planets).length < 3) && 
            c.planets && Object.keys(c.planets).length >= 3) {
          // Replace the existing (planet-less) entry with this one
          const idx = allNatal.indexOf(existing);
          allNatal[idx] = c;
          seenIds.add(c.id);
        }
        continue;
      }
      allNatal.push(c);
      seenIds.add(c.id);
      seenNames.add(norm);
    }

    // Track which HD charts have been claimed
    const claimedHdIds = new Set<string>();
    const profiles: UnifiedProfile[] = [];

    // Phase 1: Start from natal charts and find matching HD
    for (const natal of allNatal) {
      let bestHd: HumanDesignChart | null = null;

      for (const hd of hdCharts) {
        if (claimedHdIds.has(hd.id)) continue;

        const nameOk = namesMatch(natal.name, hd.name);
        if (!nameOk) continue;

        // If birthDates are available on both, verify they match
        const dateOk = birthDataMatches(
          { birthDate: natal.birthDate, birthTime: natal.birthTime },
          { birthDate: hd.birthDate, birthTime: hd.birthTime },
        );

        if (dateOk) {
          bestHd = hd;
          break; // exact match – stop looking
        }

        // Name matched but no date confirmation – still link if no better candidate
        if (!bestHd) bestHd = hd;
      }

      if (bestHd) claimedHdIds.add(bestHd.id);

      profiles.push({
        id: natal.id,
        name: natal.name,
        birthDate: natal.birthDate,
        birthTime: natal.birthTime,
        birthLocation: natal.birthLocation,
        natalChart: natal,
        hdChart: bestHd,
        isFullyLinked: !!bestHd,
      });
    }

    // Phase 2: Add unclaimed HD charts as HD-only profiles
    for (const hd of hdCharts) {
      if (claimedHdIds.has(hd.id)) continue;
      profiles.push({
        id: `hd_${hd.id}`,
        name: hd.name,
        birthDate: hd.birthDate,
        birthTime: hd.birthTime,
        birthLocation: hd.birthLocation,
        natalChart: null,
        hdChart: hd,
        isFullyLinked: false,
      });
    }

    // Sort: primary user first, then alphabetical
    const userName = mainUserName ? normalizeName(mainUserName) : '';
    profiles.sort((a, b) => {
      const aIsUser = userName && normalizeName(a.name) === userName;
      const bIsUser = userName && normalizeName(b.name) === userName;
      if (aIsUser && !bIsUser) return -1;
      if (!aIsUser && bIsUser) return 1;
      return a.name.localeCompare(b.name);
    });

    return profiles;
  }, [userNatalChart, savedCharts, hdCharts, mainUserName]);
}

/**
 * Find the HD chart linked to a specific natal chart.
 */
export function findLinkedHdChart(
  natalChart: NatalChart,
  hdCharts: HumanDesignChart[],
): HumanDesignChart | null {
  // Try name + date match first
  for (const hd of hdCharts) {
    if (
      namesMatch(natalChart.name, hd.name) &&
      birthDataMatches(
        { birthDate: natalChart.birthDate },
        { birthDate: hd.birthDate },
      )
    ) {
      return hd;
    }
  }
  // Fallback: name match only
  for (const hd of hdCharts) {
    if (namesMatch(natalChart.name, hd.name)) return hd;
  }
  return null;
}

/**
 * Find the natal chart linked to a specific HD chart.
 */
export function findLinkedNatalChart(
  hdChart: HumanDesignChart,
  userNatalChart: NatalChart | null,
  savedCharts: NatalChart[],
): NatalChart | null {
  const allNatal = userNatalChart ? [userNatalChart, ...savedCharts] : savedCharts;
  for (const natal of allNatal) {
    if (
      namesMatch(hdChart.name, natal.name) &&
      birthDataMatches(
        { birthDate: hdChart.birthDate },
        { birthDate: natal.birthDate },
      )
    ) {
      return natal;
    }
  }
  for (const natal of allNatal) {
    if (namesMatch(hdChart.name, natal.name)) return natal;
  }
  return null;
}
