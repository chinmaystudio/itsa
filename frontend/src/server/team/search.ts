/**
 * Deterministic member search over the centralized team dataset.
 * No AI/LLM required: exact → prefix → word → substring → lightweight
 * fuzzy (bounded Levenshtein) matching, all case-insensitive.
 */
import { getAllMembers } from "./model";

import type { Member, MemberSearchOutcome } from "./types";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]!;
    row[0] = i;
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const previous = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = previous;
      if (row[j]! < best) best = row[j]!;
    }
    if (best > max) return max + 1;
  }
  return row[b.length]!;
}

const FUZZY_MAX_DISTANCE = 2;
const FUZZY_MIN_QUERY_LENGTH = 4;
const MAX_RESULTS = 8;

/** Search members by (partial) name; returns single/multi/none outcome. */
export function searchMembers(query: string): MemberSearchOutcome {
  const cleaned = query.trim();
  if (cleaned.length === 0) return { kind: "none", query: cleaned };

  const needle = normalize(cleaned);
  if (needle.length === 0) return { kind: "none", query: cleaned };
  const needleCompact = needle.replace(/\s/g, "");
  const needleWords = needle.split(" ").filter((w) => w.length > 0);

  const members = getAllMembers();

  // 1. Exact full-name match.
  const exact = members.filter((m) => normalize(m.name) === needle);
  if (exact.length === 1) return { kind: "single", member: exact[0]! };
  if (exact.length > 1) return { kind: "multi", members: exact.slice(0, MAX_RESULTS) };

  // 2. Full-name prefix match.
  const prefix = members.filter((m) => normalize(m.name).startsWith(needle));
  if (prefix.length === 1) return { kind: "single", member: prefix[0]! };
  if (prefix.length > 1) return { kind: "multi", members: prefix.slice(0, MAX_RESULTS) };

  // 3. Word matches: every query word matches a first/last name exactly or
  //    as a prefix (e.g. "chinmay" → "Chinmay Joshi", "rahul" → all Rahuls).
  const wordMatches = members.filter((m) => {
    const nameWords = normalize(m.name).split(" ");
    return needleWords.every((q) =>
      nameWords.some((w) => w === q || (q.length >= 3 && w.startsWith(q))),
    );
  });
  if (wordMatches.length === 1) return { kind: "single", member: wordMatches[0]! };
  if (wordMatches.length > 1) {
    return { kind: "multi", members: wordMatches.slice(0, MAX_RESULTS) };
  }

  // 4. Substring containment anywhere in the name.
  const substring = members.filter((m) => normalize(m.name).includes(needleCompact));
  if (substring.length === 1) return { kind: "single", member: substring[0]! };
  if (substring.length > 1) {
    return { kind: "multi", members: substring.slice(0, MAX_RESULTS) };
  }

  // 5. Position/role match (e.g. "President", "Treasurer") when no name matches.
  const byPosition = members.filter(
    (m) => normalize(m.position).includes(needle) || normalize(m.groupName).includes(needle),
  );
  if (byPosition.length === 1) return { kind: "single", member: byPosition[0]! };
  if (byPosition.length > 1) {
    return { kind: "multi", members: byPosition.slice(0, MAX_RESULTS) };
  }

  // 6. Bounded fuzzy match on full names (typo tolerance).
  if (needleCompact.length >= FUZZY_MIN_QUERY_LENGTH) {
    const fuzzy: { member: Member; distance: number }[] = [];
    for (const member of members) {
      const compact = normalize(member.name).replace(/\s/g, "");
      if (Math.abs(compact.length - needleCompact.length) > FUZZY_MAX_DISTANCE) continue;
      const distance = levenshtein(needleCompact, compact, FUZZY_MAX_DISTANCE);
      if (distance <= FUZZY_MAX_DISTANCE) fuzzy.push({ member, distance });
    }
    fuzzy.sort((a, b) => a.distance - b.distance);
    const best = fuzzy.filter((f) => f.distance === fuzzy[0]!.distance);
    if (best.length === 1) return { kind: "single", member: best[0]!.member };
    if (best.length > 1) {
      return { kind: "multi", members: best.slice(0, MAX_RESULTS).map((f) => f.member) };
    }
  }

  return { kind: "none", query: cleaned };
}

/** Prefix suggestions for the "no results" empty state. */
export function suggestMembers(query: string, limit = 4): Member[] {
  const cleaned = query.trim();
  if (cleaned.length === 0) return [];
  const needle = normalize(cleaned);
  if (needle.length === 0) return [];
  const needleWords = needle.split(" ");
  const scored: { member: Member; score: number }[] = [];
  for (const member of getAllMembers()) {
    const haystack = normalize(member.name);
    const words = haystack.split(" ");
    let score = 0;
    for (const q of needleWords) {
      if (words.some((w) => w.startsWith(q.slice(0, Math.max(2, q.length - 2))))) score += 1;
    }
    if (score > 0) scored.push({ member, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.member);
}
