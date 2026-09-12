/**
 * Centralized team data model — the single source of truth for every Team
 * view (3D hierarchy, 2D flowchart, member search, member profiles).
 *
 * All member data originates from `src/data/teams.json` (Tenure 2025–26).
 * Fields that do not exist in the dataset are modelled as `null` and render
 * an explicit "To be announced" state in the UI. Never fabricate values.
 */

/** Role tier inside a community. */
export type MemberRoleKind = "lead" | "co-lead" | "executive" | "faculty" | "core";

/** Branch under the ITSA TEAM root. */
export type TeamBranchId = "faculty" | "core" | "communities";

/** A person appearing anywhere in the team tree. */
export interface Member {
  /** Stable unique id across the whole dataset. */
  id: string;
  name: string;
  /** Post/position title as written in the dataset (e.g. "President"). */
  position: string;
  /** Role tier used for visual treatment and hierarchy placement. */
  roleKind: MemberRoleKind;
  /** Academic year when known (e.g. "3rd Year"); null otherwise. */
  year: string | null;
  photo: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  /** Community/branch display name this member belongs to. */
  groupName: string;
  /** Branch id this member belongs to. */
  branchId: TeamBranchId | null;
  /** Community id when the member is under the communities branch. */
  communityId: string | null;
  /** True when placed under the LEAD section of a community. */
  isLead: boolean;
}

/** One of the 13 ITSA communities (data-driven: lead + executives). */
export interface Community {
  id: string;
  name: string;
  description: string | null;
  lead: Member[];
  executives: Member[];
}

/** Faculty advisories (from the officially published leadership facts). */
export interface FacultyGroup {
  id: "faculty";
  name: "Faculty";
  members: Member[];
}

/** Student core committee (president, secretaries, treasurers, …). */
export interface CoreGroup {
  id: "core";
  name: "Core";
  members: Member[];
}

/** Fully normalized team tree consumed by all views. */
export interface TeamTree {
  root: { id: "root"; name: "ITSA TEAM" };
  faculty: FacultyGroup;
  core: CoreGroup;
  communities: Community[];
}

/** Flattened member index entry (used by member search + 3D nodes). */
export type MemberIndexEntry = Member;

/** Node descriptor shared by the 2D flowchart and 3D hierarchy. */
export type TeamNode =
  | { kind: "root"; id: "root"; name: "ITSA TEAM" }
  | { kind: "branch"; id: TeamBranchId; name: string }
  | { kind: "community"; id: string; name: string; communityId: string }
  | { kind: "member"; id: string; name: string; member: Member };

/** A validated member-search query result. */
export interface MemberSearchResult {
  /** Exact single match. */
  kind: "single";
  member: Member;
}

export interface MemberSearchMulti {
  kind: "multi";
  members: Member[];
}

export interface MemberSearchNone {
  kind: "none";
  query: string;
}

export type MemberSearchOutcome = MemberSearchResult | MemberSearchMulti | MemberSearchNone;

/** Stats block for the Team landing masthead. */
export interface TeamStats {
  communities: number;
  totalMembers: number;
  leads: number;
  executives: number;
}
