import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Marquee } from "@/components/fx/marquee";
import { Magnetic, Reveal, SplitWords } from "@/components/fx/motion-primitives";
import { itsa } from "@/data/itsa";

/* ──────────── Animation Timing ──────────── */
const SIMULATION_DURATION = 3000; // 3 seconds before transition
const TRANSITION_DURATION = 1.0; // seconds for smooth crossfade

const KINETIC_ROWS = [
  [
    { text: "BUILD WHAT'S NEXT", bright: true },
    { text: "CONNECT IDEAS", bright: false },
  ],
  [
    { text: "LEARN IN PUBLIC", bright: true },
    { text: "SHIP WITH ITSA", bright: false },
  ],
  [
    { text: "BUILD WHAT'S NEXT", bright: true },
    { text: "CONNECT IDEAS", bright: false },
  ],
  [
    { text: "LEARN IN PUBLIC", bright: true },
    { text: "SHIP WITH ITSA", bright: false },
  ],
];

/* ──────────── Particle Network Canvas ──────────── */
type Particle = { x: number; y: number; vx: number; vy: number; z: number };

function ParticleCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let nodes: Particle[] = [];
    let raf = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.max(30, Math.round(w * h * 0.00008)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        z: 0.3 + Math.random() * 0.7,
      }));
    };

    const loop = () => {
      if (!activeRef.current) return;
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      for (const n of nodes) {
        n.x += n.vx * n.z;
        n.y += n.vy * n.z;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        const ax = a.x + pointer.x * a.z * 18;
        const ay = a.y + pointer.y * a.z * 18;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const bx = b.x + pointer.x * b.z * 18;
          const by = b.y + pointer.y * b.z * 18;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.22 * a.z;
            ctx.strokeStyle = `rgba(80, 160, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(100, 180, 255, ${0.15 + a.z * 0.35})`;
        ctx.beginPath();
        ctx.arc(ax, ay, a.z * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    resize();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full pointer-events-none" />;
}

/* ──────────── Kinetic Scrolling Marquee Row ──────────── */
function MarqueeRow({
  items,
  reverse = false,
  speed = 26,
}: {
  items: { text: string; bright: boolean }[];
  reverse?: boolean;
  speed?: number;
}) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
        className="flex shrink-0 gap-10 pr-10 sm:gap-16 sm:pr-16"
      >
        {repeated.map((item, idx) => (
          <span
            key={idx}
            className={`font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl ${
              item.bright ? "text-white" : "text-white/20"
            }`}
          >
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ──────────── Hero Sequence Component ──────────── */
export function HeroSequence() {
  const reduced = useReducedMotion();
  const [showSimulation, setShowSimulation] = useState(!reduced);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const finishSimulation = useCallback(() => {
    setShowSimulation(false);
  }, []);

  useEffect(() => {
    if (reduced) return;

    try {
      if (sessionStorage.getItem("itsa-hero-session-v9") === "done") {
        setShowSimulation(false);
        return;
      }
    } catch {
      setShowSimulation(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      finishSimulation();
      try {
        sessionStorage.setItem("itsa-hero-session-v9", "done");
      } catch {
        /* ignore */
      }
    }, SIMULATION_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reduced, finishSimulation]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background text-foreground transition-colors duration-400">
      {/* ════════════════════════════════════════════════════════════
          PHASE 1: Kinetic Simulation Overlay (Runs on initial mount)
          ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSimulation && (
          <motion.div
            key="simulation-phase"
            className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
          >
            {/* Animated Particle Network Canvas */}
            <ParticleCanvas active={showSimulation} />

            {/* Glowing Blue Wireframe "ITSA" */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <h1
                className="font-display text-[clamp(6rem,22vw,16rem)] font-extrabold uppercase leading-none tracking-[-0.04em]"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px rgba(80, 160, 255, 0.65)",
                  filter:
                    "drop-shadow(0 0 35px rgba(80, 160, 255, 0.4)) drop-shadow(0 0 70px rgba(80, 160, 255, 0.18))",
                }}
              >
                ITSA
              </h1>
            </div>

            {/* Tilted Kinetic Scrolling Marquee Text Rows */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ perspective: "1000px" }}
            >
              <div
                className="w-[150%] space-y-4 sm:space-y-6"
                style={{ transform: "rotate(-8deg)" }}
              >
                {KINETIC_ROWS.map((row, i) => (
                  <MarqueeRow
                    key={i}
                    items={row}
                    reverse={i % 2 === 1}
                    speed={20 + i * 3.5}
                  />
                ))}
              </div>
            </div>

            {/* Center Floating Pill Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/85 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span>ITSA / PCCOE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          PHASE 2: Permanent Editorial Hero (Fully Light & Dark Compatible)
          ════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-between pt-24">
        {/* Theme-adaptive grid paper background texture */}
        <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 opacity-40" />

        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
          {/* Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/20 pb-3">
            <p className="label-mono">EST. DEPARTMENT OF INFORMATION TECHNOLOGY</p>
            <p className="label-mono">PCCOE · PUNE · INDIA</p>
          </div>

          {/* Main 2-Column Editorial Layout */}
          <div className="grid gap-8 pt-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <SplitWords as="h1" text="Information Technology" className="display-xl" />
              <div className="relative">
                <SplitWords
                  as="h1"
                  text="Students' Association"
                  delay={0.18}
                  className="display-xl text-outline"
                />
              </div>
              <motion.div
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
                className="mt-6 h-[6px] w-full bg-acid"
              />
            </div>

            <Reveal delay={0.3} className="flex flex-col justify-end">
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{itsa.tagline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic>
                  <Link
                    to="/events"
                    className="group inline-flex items-center gap-3 bg-foreground px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background hover:bg-foreground/90 transition-colors"
                  >
                    Explore events
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </Magnetic>
              </div>

              <div className="mt-10 border-l-[6px] border-primary pl-4">
                <p className="label-mono">Next up</p>
                <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                  {itsa.highlight.name}
                </p>
                <p className="mt-1 font-mono text-xs text-primary">{itsa.highlight.date}</p>
                <p className="mt-2 text-sm text-muted-foreground">{itsa.highlight.detail}</p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Bottom Marquee Strip */}
        <Marquee
          className="mt-14 border-y border-foreground/20 bg-foreground py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-background"
          speed={34}
          items={[
            "18+ events",
            "66 active members",
            "14 specialised teams",
            "IEEE · MLSC · GDGC · NSS",
            "$5000 IEEE grant",
          ]}
        />
      </div>
    </section>
  );
}
