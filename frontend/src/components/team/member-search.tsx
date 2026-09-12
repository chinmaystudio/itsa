import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { MemberCard } from "@/components/team/member-card";
import { searchTeamMember, suggestTeamMembers } from "@/api/team";

import type { Member } from "@/server/team/types";

interface HistoryEntry {
  id: number;
  kind: "query" | "answer";
  query?: string;
}

const SAMPLE_QUERIES = ["Vedant", "Shirsath", "Gauri", "President"] as const;

/**
 * "Know a Member" — a lightweight, deterministic member assistant.
 * Searches the actual ITSA dataset via a server function; no AI API involved.
 */
export function MemberSearch({ onSelectMember }: { onSelectMember: (member: Member) => void }) {
  const reduced = useReducedMotion();
  const [input, setInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const nextId = useRef(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const search = useQuery({
    queryKey: ["team", "member-search", submittedQuery],
    queryFn: () => searchTeamMember({ data: { query: submittedQuery! } }),
    enabled: submittedQuery !== null && submittedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  const suggestions = useQuery({
    queryKey: ["team", "member-suggest", submittedQuery],
    queryFn: () => suggestTeamMembers({ data: { query: submittedQuery! } }),
    enabled: search.data?.kind === "none",
    staleTime: 30_000,
  });

  const submit = (raw: string) => {
    const query = raw.trim();
    if (query.length === 0) return;
    setHistory((prev) => [
      ...prev,
      { id: nextId.current++, kind: "query", query },
      { id: nextId.current++, kind: "answer" },
    ]);
    setSubmittedQuery(query);
    setInput("");
  };

  const outcome = search.data;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8">
      <div className="ink-card p-5 sm:p-8">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <p className="label-mono">Know an ITSA member</p>
          <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
            Roster search · offline
          </span>
        </div>

        {/* Conversation log */}
        <div ref={resultsRef} className="mt-6 space-y-6">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <span className="mt-1 shrink-0 bg-primary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-primary-foreground">
              ITSA
            </span>
            <div className="border border-border bg-surface p-4">
              <p className="text-sm text-foreground">Who do you want to know?</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                First name, last name, full name — or a role like “President”
              </p>
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {history.map((entry) =>
              entry.kind === "query" ? (
                <motion.div
                  key={entry.id}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <p className="bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-background">
                    {entry.query}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={entry.id}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <span className="mt-1 shrink-0 bg-primary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-primary-foreground">
                    ITSA
                  </span>
                  <div className="min-w-0 flex-1 border border-border bg-surface p-4">
                    {search.isPending ? (
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Searching the roster…
                      </p>
                    ) : search.isError ? (
                      <p className="font-mono text-xs text-destructive">
                        Search failed — please try again.
                      </p>
                    ) : outcome?.kind === "single" ? (
                      <div className="space-y-3">
                        <MemberCard member={outcome.member} onSelect={onSelectMember} compact />
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          Exact match — click the card to open the profile.
                        </p>
                      </div>
                    ) : outcome?.kind === "multi" ? (
                      <div className="space-y-3">
                        <p className="font-display text-base font-bold text-foreground">
                          Multiple members found
                        </p>
                        <div className="space-y-2">
                          {outcome.members.map((member) => (
                            <MemberCard
                              key={member.id}
                              member={member}
                              onSelect={onSelectMember}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    ) : outcome?.kind === "none" ? (
                      <div className="space-y-3">
                        <p className="font-mono text-xs text-foreground">
                          No ITSA member found with that name.
                        </p>
                        {suggestions.data && suggestions.data.length > 0 ? (
                          <div>
                            <p className="label-mono text-[9px]">Did you mean</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {suggestions.data.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => submit(member.name)}
                                  className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  {member.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            Try a shorter part of the name.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ),
            )}
          </AnimatePresence>
        </div>

        {/* Input row */}
        <form
          className="mt-8 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
        >
          <label htmlFor="member-search-input" className="sr-only">
            Search an ITSA member by name
          </label>
          <input
            id="member-search-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search member…"
            autoComplete="off"
            className="min-w-0 flex-1 border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="shrink-0 bg-foreground px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Search
          </button>
        </form>

        {history.length === 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Try:
            </span>
            {SAMPLE_QUERIES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => submit(sample)}
                className="border border-border px-3 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sample}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
