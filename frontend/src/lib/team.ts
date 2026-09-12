/**
 * Client-side helpers over the centralized team tree (loaded via the
 * `getTeamData` server function). Pure functions — no duplicate data.
 */
import type { Member, TeamStats, TeamTree } from "@/server/team/types";

/** Flatten the tree into a single member index (faculty, core, communities). */
export function flattenTeamMembers(tree: TeamTree): Member[] {
  const members: Member[] = [...tree.faculty.members, ...tree.core.members];
  for (const community of tree.communities) {
    members.push(...community.lead, ...community.executives);
  }
  return members;
}

export function findMemberById(members: Member[], id: string): Member | null {
  return members.find((m) => m.id === id) ?? null;
}

export function computeTeamStats(tree: TeamTree): TeamStats {
  let leads = 0;
  let executives = 0;
  for (const community of tree.communities) {
    leads += community.lead.length;
    executives += community.executives.length;
  }
  return {
    communities: tree.communities.length,
    totalMembers: tree.faculty.members.length + tree.core.members.length + leads + executives,
    leads,
    executives,
  };
}

/** "Vedant Sarode" → "VS" (monogram fallback for missing photos). */
export function memberInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : (words[0]?.[1] ?? "");
  return `${first}${last}`.toUpperCase() || "IT";
}
