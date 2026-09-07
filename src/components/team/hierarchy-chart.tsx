import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

import { MemberCard } from "@/components/team/member-card";
import { cn } from "@/lib/utils";

import type { Community, Member, TeamTree } from "@/server/team/types";

function VLine() {
  return <span aria-hidden className="mx-auto block h-6 w-px bg-border" />;
}

function HLine() {
  return <span aria-hidden className="mx-6 block h-px bg-border" />;
}

function TbaChip({ label }: { label: string }) {
  return (
    <div className="flex items-center border border-dashed border-border bg-transparent p-2.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
      {label}
    </div>
  );
}

/**
 * One side of the horizontal split under a community (LEAD or EXECUTIVES).
 * Each panel hangs from the shared distribution rail via its own stub.
 */
function BranchPanel({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <span aria-hidden className="mx-auto block h-4 w-px bg-border" />
      <div
        className={cn(
          "flex h-full flex-col border p-3 sm:p-4",
          accent ? "border-primary/50 bg-primary/5" : "border-border bg-surface",
        )}
      >
        <p
          className={cn(
            "border-b pb-2 font-mono text-[9px] uppercase tracking-[0.2em]",
            accent ? "border-primary/20 text-primary" : "border-border text-muted-foreground",
          )}
        >
          {label}
        </p>
        <div className="mt-3 flex-1 space-y-2.5">{children}</div>
      </div>
    </section>
  );
}

function NodeButton({
  label,
  sub,
  expanded,
  onClick,
  accent,
}: {
  label: string;
  sub?: string;
  expanded: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={cn(
        "ink-card group mx-auto flex w-full max-w-xs items-center justify-between gap-4 p-4 text-left hover:offset-shadow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        accent && "bg-foreground text-background",
      )}
    >
      <span>
        <span
          className={cn(
            "block font-display text-lg font-extrabold tracking-tight",
            accent ? "text-background" : "text-foreground",
          )}
        >
          {label}
        </span>
        {sub ? (
          <span
            className={cn(
              "mt-0.5 block font-mono text-[9px] uppercase tracking-[0.18em]",
              accent ? "text-background/70" : "text-muted-foreground",
            )}
          >
            {sub}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-7 shrink-0 place-items-center border font-mono text-xs transition-transform duration-300",
          expanded ? "rotate-180" : "",
          accent ? "border-background/30 text-background" : "border-border text-muted-foreground",
        )}
      >
        ↓
      </span>
    </button>
  );
}

function CommunityBranch({
  community,
  expanded,
  onToggle,
  onSelectMember,
  index,
}: {
  community: Community;
  expanded: boolean;
  onToggle: () => void;
  onSelectMember: (member: Member) => void;
  index: number;
}) {
  const reduced = useReducedMotion();
  const hasLead = community.lead.length > 0;
  const hasExecutives = community.executives.length > 0;

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-w-0"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="ink-card group flex w-full items-center justify-between gap-3 p-3.5 text-left hover:offset-shadow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-bold tracking-tight text-foreground">
            {community.name}
          </span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {hasLead ? `${community.lead.length} lead · ` : ""}
            {hasExecutives ? `${community.executives.length} executives` : "roster pending"}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center border border-border font-mono text-[10px] text-muted-foreground transition-transform duration-300",
            expanded && "rotate-180",
          )}
        >
          ↓
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* Horizontal rail: the community drops onto a distribution line
                that feeds LEAD (left) and EXECUTIVES (right) side by side —
                the same two-column split on mobile. */}
            <div className="mt-3">
              <span aria-hidden className="mx-auto block h-4 w-px bg-border" />
              <span aria-hidden className="block h-px w-full bg-border" />
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <BranchPanel label="Lead" accent>
                  {hasLead ? (
                    community.lead.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onSelect={onSelectMember}
                        compact
                      />
                    ))
                  ) : (
                    <TbaChip label="To be announced" />
                  )}
                </BranchPanel>
                <BranchPanel label="Executives">
                  {hasExecutives ? (
                    community.executives.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onSelect={onSelectMember}
                        compact
                      />
                    ))
                  ) : (
                    <TbaChip label="To be announced" />
                  )}
                </BranchPanel>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

/**
 * 2D hierarchical flowchart: ITSA TEAM → Faculty / Core / Communities,
 * progressively expanded. Collapses into a vertical tree on mobile.
 */
export function HierarchyChart({
  tree,
  onSelectMember,
}: {
  tree: TeamTree;
  onSelectMember: (member: Member) => void;
}) {
  const reduced = useReducedMotion();
  const [rootOpen, setRootOpen] = useState(true);
  const [openBranch, setOpenBranch] = useState<"faculty" | "core" | "communities" | null>(null);
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null);

  const toggleBranch = (branch: "faculty" | "core" | "communities") => {
    setOpenBranch((current) => (current === branch ? null : branch));
    setOpenCommunityId(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-8">
      {/* Root */}
      <NodeButton
        label="ITSA TEAM"
        sub="Information Technology Students' Association · 2025–26"
        expanded={rootOpen}
        onClick={() => setRootOpen((v) => !v)}
        accent
      />

      <AnimatePresence initial={false}>
        {rootOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <VLine />
            <HLine />

            {/* Branches */}
            <div className="grid gap-10 md:grid-cols-3 md:gap-4">
              {/* FACULTY */}
              <section>
                <NodeButton
                  label="Faculty"
                  sub={`${tree.faculty.members.length} advisors`}
                  expanded={openBranch === "faculty"}
                  onClick={() => toggleBranch("faculty")}
                />
                <AnimatePresence initial={false}>
                  {openBranch === "faculty" ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <VLine />
                      <div className="grid grid-cols-2 gap-2.5">
                        {tree.faculty.members.map((member) => (
                          <MemberCard
                            key={member.id}
                            member={member}
                            onSelect={onSelectMember}
                            compact
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>

              {/* CORE */}
              <section>
                <NodeButton
                  label="Core"
                  sub={`${tree.core.members.length} office bearers`}
                  expanded={openBranch === "core"}
                  onClick={() => toggleBranch("core")}
                />
                <AnimatePresence initial={false}>
                  {openBranch === "core" ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <VLine />
                      <div className="grid grid-cols-2 gap-2.5">
                        {tree.core.members.map((member) => (
                          <MemberCard
                            key={member.id}
                            member={member}
                            onSelect={onSelectMember}
                            compact
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>

              {/* COMMUNITIES */}
              <section>
                <NodeButton
                  label="Communities"
                  sub={`${tree.communities.length} units`}
                  expanded={openBranch === "communities"}
                  onClick={() => toggleBranch("communities")}
                />
                <AnimatePresence initial={false}>
                  {openBranch === "communities" ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <VLine />
                      <ul className="space-y-2.5">
                        {tree.communities.map((community, index) => (
                          <CommunityBranch
                            key={community.id}
                            community={community}
                            index={index}
                            expanded={openCommunityId === community.id}
                            onToggle={() =>
                              setOpenCommunityId((current) =>
                                current === community.id ? null : community.id,
                              )
                            }
                            onSelectMember={onSelectMember}
                          />
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!rootOpen ? (
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Click ITSA TEAM to expand the organisation
        </p>
      ) : null}
    </div>
  );
}
