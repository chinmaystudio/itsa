import { motion, useReducedMotion } from "motion/react";

import { memberInitials } from "@/lib/team";
import { cn } from "@/lib/utils";

import type { Member } from "@/server/team/types";

const ROLE_LABELS: Record<Member["roleKind"], string> = {
  lead: "Lead",
  "co-lead": "Co-Lead",
  executive: "Executive",
  faculty: "Faculty",
  core: "Core",
};

/** Editorial member card used across flowchart panels and search results. */
export function MemberCard({
  member,
  onSelect,
  compact = false,
}: {
  member: Member;
  onSelect: (member: Member) => void;
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const roleLabel = ROLE_LABELS[member.roleKind];

  if (compact) {
    // Stacked layout for narrow columns (flowchart panels): avatar left,
    // identity right, role chip pinned below — nothing can clip off-screen.
    return (
      <motion.button
        type="button"
        onClick={() => onSelect(member)}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="ink-card group flex w-full flex-col gap-3 p-3 text-left hover:offset-shadow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View profile of ${member.name}, ${member.position}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <MemberAvatar member={member} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-bold tracking-tight text-foreground">
              {member.name}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {member.position}
            </span>
          </span>
        </span>
        <span
          className={cn(
            "self-start px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em]",
            member.roleKind === "lead" || member.roleKind === "co-lead"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground",
          )}
        >
          {roleLabel}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(member)}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="ink-card group flex w-full items-center gap-4 p-4 text-left hover:offset-shadow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View profile of ${member.name}, ${member.position}`}
    >
      <MemberAvatar member={member} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-base font-bold tracking-tight text-foreground">
          {member.name}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {member.position}
        </span>
        {member.year ? (
          <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground/80">
            {member.year}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "shrink-0 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em]",
          member.roleKind === "lead" || member.roleKind === "co-lead"
            ? "bg-primary text-primary-foreground"
            : "border border-border text-muted-foreground",
        )}
      >
        {roleLabel}
      </span>
    </motion.button>
  );
}

/** Circular avatar with monogram fallback for missing photos. */
export function MemberAvatar({
  member,
  size = "md",
  className,
}: {
  member: Member;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension = size === "lg" ? "size-24" : size === "sm" ? "size-10" : "size-14";
  const textClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-[11px]" : "text-base";

  if (member.photo) {
    return (
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden border border-border bg-surface-2",
          dimension,
          className,
        )}
      >
        <img
          src={member.photo}
          alt={member.name}
          loading="lazy"
          className="size-full object-cover"
          onError={(event) => {
            const target = event.currentTarget;
            target.style.display = "none";
            target.parentElement?.querySelector("[data-monogram]")?.classList.remove("hidden");
          }}
        />
        <span
          data-monogram
          className={cn(
            "absolute inset-0 hidden place-items-center bg-primary font-display font-extrabold text-primary-foreground",
            textClass,
          )}
          style={{ display: undefined }}
        >
          <span className="grid size-full place-items-center">{memberInitials(member.name)}</span>
        </span>
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center border border-border bg-surface-2 font-display font-extrabold text-foreground/70",
        dimension,
        textClass,
        className,
      )}
    >
      {memberInitials(member.name)}
    </span>
  );
}

export { ROLE_LABELS };
