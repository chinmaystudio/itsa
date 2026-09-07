import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { MemberAvatar } from "@/components/team/member-card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import type { Member } from "@/server/team/types";

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-border bg-surface px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label} <span aria-hidden>↗</span>
    </a>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface p-3.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

/**
 * Shared member profile — opened from the 3D hierarchy, the 2D flowchart and
 * the member search. Shows only fields that exist in the dataset; missing
 * information renders "To be announced" rather than invented content.
 */
export function MemberProfileDialog({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-lg gap-0 overflow-y-auto border-border bg-card p-0">
        <AnimatePresence mode="wait">
          {member ? (
            <motion.div
              key={member.id}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 sm:p-8"
            >
              <div className="flex items-start gap-5">
                <MemberAvatar member={member} size="lg" />
                <div className="min-w-0 pt-1">
                  <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                    {member.name}
                  </DialogTitle>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                    {member.position}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {member.groupName}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                <Field label="Role" value={member.position} />
                <Field label="Unit" value={member.groupName} />
                <Field label="Academic year" value={member.year ?? "To be announced"} />
                <Field
                  label="Branch"
                  value={
                    member.branchId === "communities"
                      ? "Communities"
                      : member.branchId
                        ? member.branchId.charAt(0).toUpperCase() + member.branchId.slice(1)
                        : "To be announced"
                  }
                />
              </div>

              <div className="mt-6">
                <p className="label-mono text-[9px]">Links</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.email ? <LinkRow label="Email" href={`mailto:${member.email}`} /> : null}
                  {member.linkedin ? <LinkRow label="LinkedIn" href={member.linkedin} /> : null}
                  {member.github ? <LinkRow label="GitHub" href={member.github} /> : null}
                  {!member.email && !member.linkedin && !member.github ? (
                    <p className="font-mono text-xs text-muted-foreground">To be announced</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  Bio · Skills
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  Not published in the team records yet — this section fills in as members share
                  their details.
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
