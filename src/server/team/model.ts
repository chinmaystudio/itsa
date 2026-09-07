/**
 * Team model: normalizes `src/data/teams.json` into the centralized
 * `TeamTree` consumed by the 3D hierarchy, 2D flowchart, member search and
 * member profiles. Server-only module — imported by `src/server/team/*.ts`.
 *
 * Mapping notes (dataset name → canonical community):
 *  - "Event Management & Logistics Team" splits into the two required
 *    communities "Event Management" and "Logistics" (shared member pool,
 *    lead shown once in each so no community renders empty).
 *  - "Video Editing and Photography Team" → "Videography and Photography".
 *  - "Event Documentation Team" → "Documentation".
 *  - "Publicity Team" → "Publicity and Social Media".
 *  - "ISR & NSS" → "NSS and ISR".
 *  - "Sponsorship and Budget Team" → "Sponsorship".
 *  - "Higher Studies & CDPC" → "HSC".
 *  - "Content Writing" has no dedicated dataset team; it is emitted with an
 *    explicit "To be announced" empty state rather than fabricated members.
 *  - "Technical Team" → "Technical".
 *  - "Webmasters" and "Art Circle" map 1:1.
 *  - "Sports" and "SY Interaction Coordinator" are dataset-only teams that
 *    are not part of the required 13 communities; they surface through Core.
 */
import rawTeams from "@/data/teams.json";

import type {
  Community,
  CoreGroup,
  FacultyGroup,
  Member,
  MemberRoleKind,
  TeamStats,
  TeamTree,
} from "./types";

/* ── Raw dataset shapes (narrowed at the boundary) ────────────────────── */

interface RawPerson {
  id: number;
  name?: string;
  post?: string;
  position?: string;
  year?: string;
  photo?: string | null;
  email?: string;
  linkedin?: string;
  github?: string;
}

interface RawTeam {
  id: number;
  name: string;
  description?: string;
  members?: RawPerson[];
  lead?: RawPerson | RawPerson[];
  coLead?: RawPerson;
}

/* ── Community mapping table ─────────────────────────────────────────── */

interface CommunitySpec {
  id: string;
  name: string;
  /** Dataset team names that feed this community. */
  sources: string[];
  /** True when the community intentionally has no dataset team (TBA). */
  empty?: boolean;
}

const COMMUNITY_SPECS: CommunitySpec[] = [
  {
    id: "event-management",
    name: "Event Management",
    sources: ["Event Management & Logistics Team"],
  },
  { id: "logistics", name: "Logistics", sources: ["Event Management & Logistics Team"] },
  { id: "design", name: "Design", sources: ["Design Team"] },
  {
    id: "publicity-social-media",
    name: "Publicity and Social Media",
    sources: ["Publicity Team"],
  },
  { id: "nss-isr", name: "NSS and ISR", sources: ["ISR & NSS"] },
  { id: "sponsorship", name: "Sponsorship", sources: ["Sponsorship and Budget Team"] },
  {
    id: "videography-photography",
    name: "Videography and Photography",
    sources: ["Video Editing and Photography Team"],
  },
  { id: "documentation", name: "Documentation", sources: ["Event Documentation Team"] },
  { id: "content-writing", name: "Content Writing", sources: [], empty: true },
  { id: "art-circle", name: "Art Circle", sources: ["Art Circle"] },
  { id: "technical", name: "Technical", sources: ["Technical Team"] },
  { id: "webmasters", name: "Webmasters", sources: ["Webmasters"] },
  { id: "hsc", name: "HSC", sources: ["Higher Studies & CDPC"] },
];

const COMMUNITY_ORDER = new Map(COMMUNITY_SPECS.map((spec, i) => [spec.name, i]));

/* ── Helpers ─────────────────────────────────────────────────────────── */

function cleanString(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toMember(
  person: RawPerson,
  opts: {
    roleKind: MemberRoleKind;
    position: string;
    groupName: string;
    branchId: Member["branchId"];
    communityId: string | null;
    isLead: boolean;
  },
): Member {
  return {
    id: `m${person.id}`,
    name: cleanString(person.name) ?? "To be announced",
    position: opts.position,
    roleKind: opts.roleKind,
    year: cleanString(person.year),
    photo: cleanString(person.photo),
    email: cleanString(person.email),
    linkedin: cleanString(person.linkedin),
    github: cleanString(person.github),
    groupName: opts.groupName,
    branchId: opts.branchId,
    communityId: opts.communityId,
    isLead: opts.isLead,
  };
}

function findTeam(name: string): RawTeam | undefined {
  return rawTeams.find((team) => (team as RawTeam).name === name) as RawTeam | undefined;
}

/* ── Faculty (officially published facts only) ───────────────────────── */

function buildFaculty(): FacultyGroup {
  // itsa.ts leadership list: Head of Department + ITSA Coordinator are the
  // faculty advisories published on the official site.
  const faculty: Member[] = [
    {
      id: "faculty-hod",
      name: "Dr. Jayashree Katti",
      position: "Head of Department",
      roleKind: "faculty",
      year: null,
      photo: null,
      email: null,
      linkedin: null,
      github: null,
      groupName: "Faculty",
      branchId: "faculty",
      communityId: null,
      isLead: true,
    },
    {
      id: "faculty-coordinator",
      name: "Mrs. Shraddha Tawade",
      position: "ITSA Coordinator",
      roleKind: "faculty",
      year: null,
      photo: null,
      email: null,
      linkedin: null,
      github: null,
      groupName: "Faculty",
      branchId: "faculty",
      communityId: null,
      isLead: true,
    },
  ];
  return { id: "faculty", name: "Faculty", members: faculty };
}

/* ── Core (dataset team id 1 "Core Team") ────────────────────────────── */

function buildCore(): CoreGroup {
  const coreTeam = findTeam("Core Team");
  const members: Member[] = (coreTeam?.members ?? []).map((person) =>
    toMember(person, {
      roleKind: "core",
      position: cleanString(person.post) ?? "Core Member",
      groupName: "Core Team",
      branchId: "core",
      communityId: null,
      isLead: false,
    }),
  );
  return { id: "core", name: "Core", members };
}

/* ── Communities (lead + executives per community) ───────────────────── */

function membersFromTeam(
  team: RawTeam,
  communityId: string,
  communityName: string,
): { lead: Member[]; executives: Member[] } {
  const lead: Member[] = [];
  const executives: Member[] = [];

  // lead may be a single person or an array (dataset quirk in team 14).
  const rawLead = team.lead;
  if (Array.isArray(rawLead)) {
    for (const person of rawLead) {
      lead.push(
        toMember(person, {
          roleKind: "lead",
          position: cleanString(person.position) ?? "Lead",
          groupName: communityName,
          branchId: "communities",
          communityId,
          isLead: true,
        }),
      );
    }
  } else if (rawLead) {
    lead.push(
      toMember(rawLead, {
        roleKind: "lead",
        position: cleanString(rawLead.position) ?? "Lead",
        groupName: communityName,
        branchId: "communities",
        communityId,
        isLead: true,
      }),
    );
  }

  if (team.coLead) {
    lead.push(
      toMember(team.coLead, {
        roleKind: "co-lead",
        position: cleanString(team.coLead.position) ?? "Co-Lead",
        groupName: communityName,
        branchId: "communities",
        communityId,
        isLead: true,
      }),
    );
  }

  for (const person of team.members ?? []) {
    executives.push(
      toMember(person, {
        roleKind: "executive",
        position: cleanString(person.position) ?? "Executive",
        groupName: communityName,
        branchId: "communities",
        communityId,
        isLead: false,
      }),
    );
  }

  return { lead, executives };
}

function buildCommunities(): Community[] {
  return COMMUNITY_SPECS.map((spec) => {
    if (spec.empty) {
      return {
        id: spec.id,
        name: spec.name,
        description: null,
        lead: [],
        executives: [],
      };
    }

    const lead: Member[] = [];
    const executives: Member[] = [];
    let description: string | null = null;

    for (const sourceName of spec.sources) {
      const team = findTeam(sourceName);
      if (!team) continue;
      const extracted = membersFromTeam(team, spec.id, spec.name);
      // De-duplicate shared member pools (Event Management & Logistics share
      // one dataset team) so the same person is not listed twice in a view.
      for (const person of extracted.lead) {
        if (!lead.some((m) => m.id === person.id)) lead.push(person);
      }
      for (const person of extracted.executives) {
        if (!executives.some((m) => m.id === person.id)) executives.push(person);
      }
      description = cleanString(team.description) ?? description;
    }

    return { id: spec.id, name: spec.name, description, lead, executives };
  }).sort((a, b) => (COMMUNITY_ORDER.get(a.name) ?? 99) - (COMMUNITY_ORDER.get(b.name) ?? 99));
}

/* ── Public model API ────────────────────────────────────────────────── */

let cachedTree: TeamTree | null = null;

export function getTeamTree(): TeamTree {
  if (cachedTree) return cachedTree;
  cachedTree = {
    root: { id: "root", name: "ITSA TEAM" },
    faculty: buildFaculty(),
    core: buildCore(),
    communities: buildCommunities(),
  };
  return cachedTree;
}

/** All members flattened (faculty + core + every community section). */
export function getAllMembers(): Member[] {
  const tree = getTeamTree();
  const members: Member[] = [];
  members.push(...tree.faculty.members);
  members.push(...tree.core.members);
  for (const community of tree.communities) {
    members.push(...community.lead);
    members.push(...community.executives);
  }
  return members;
}

export function getTeamStats(): TeamStats {
  const tree = getTeamTree();
  let leads = 0;
  let executives = 0;
  for (const community of tree.communities) {
    leads += community.lead.length;
    executives += community.executives.length;
  }
  const total = tree.faculty.members.length + tree.core.members.length + leads + executives;
  return {
    communities: tree.communities.length,
    totalMembers: total,
    leads,
    executives,
  };
}

/** Find a community by id (null when unknown). */
export function getCommunityById(id: string): Community | null {
  return getTeamTree().communities.find((c) => c.id === id) ?? null;
}

/** Members belonging to a branch (faculty/core) or community. */
export function getMembersOfBranch(branchId: Member["branchId"]): Member[] {
  const tree = getTeamTree();
  if (branchId === "faculty") return tree.faculty.members;
  if (branchId === "core") return tree.core.members;
  return [];
}
