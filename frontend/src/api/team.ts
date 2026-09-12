/**
 * Team API — TanStack Start server functions (client-safe RPC layer).
 *
 * This is the ONLY module the client imports to reach team data. The
 * underlying model/search modules live in `src/server/team/` and are
 * server-only (enforced by the import-protection rule in `vite.config.ts`),
 * so swapping the JSON dataset for a database later never touches UI code.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAllMembers, getCommunityById, getTeamStats, getTeamTree } from "@/server/team/model";
import { searchMembers, suggestMembers } from "@/server/team/search";

import type {
  Community,
  Member,
  MemberSearchOutcome,
  TeamStats,
  TeamTree,
} from "@/server/team/types";

/** Full team tree (root + faculty + core + communities). */
export const getTeamData = createServerFn({ method: "GET" }).handler((): TeamTree => getTeamTree());

/** Flattened member index (faculty + core + leads + executives). */
export const getTeamMembers = createServerFn({ method: "GET" }).handler((): Member[] =>
  getAllMembers(),
);

/** Landing-page stats block. */
export const getTeamStatsData = createServerFn({ method: "GET" }).handler((): TeamStats =>
  getTeamStats(),
);

const communityIdSchema = z.object({ id: z.string().min(1).max(64) });

/** Single community with its lead + executives. */
export const getCommunity = createServerFn({ method: "GET" })
  .validator(communityIdSchema)
  .handler(({ data }): Community | null => getCommunityById(data.id));

const searchQuerySchema = z.object({ query: z.string().min(1).max(120) });

/** Deterministic member search (exact/partial/fuzzy — no AI). */
export const searchTeamMember = createServerFn({ method: "GET" })
  .validator(searchQuerySchema)
  .handler(({ data }): MemberSearchOutcome => searchMembers(data.query));

/** Related suggestions shown when a search finds nothing. */
export const suggestTeamMembers = createServerFn({ method: "GET" })
  .validator(searchQuerySchema)
  .handler(({ data }): Member[] => suggestMembers(data.query));
