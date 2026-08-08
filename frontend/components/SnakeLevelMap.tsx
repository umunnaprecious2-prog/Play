import Link from "next/link";
import type { Route } from "next";

export type SnakeLevelNode = {
  id: string;
  slug: string;
  levelNumber: number;
  label: string;
  sublabel?: string | null;
  isUnlocked: boolean;
  isCompleted: boolean;
};

type SnakeLevelMapProps = {
  title: string;
  subtitle?: string;
  levels: SnakeLevelNode[];
  basePath: string;
  accent?: "sunrise" | "sky" | "meadow" | "royal" | "gold";
};

const ACCENT_NODE: Record<string, string> = {
  sunrise: "bg-sunrise-500 shadow-sunrise-500/40",
  sky: "bg-sky-500 shadow-sky-500/40",
  meadow: "bg-meadow-500 shadow-meadow-500/40",
  royal: "bg-royal-600 shadow-royal-500/40",
  gold: "bg-gold-500 shadow-gold-500/40",
};

const ACCENT_RING: Record<string, string> = {
  sunrise: "ring-sunrise-300",
  sky: "ring-sky-300",
  meadow: "ring-meadow-300",
  royal: "ring-royal-300",
  gold: "ring-gold-300",
};

// A winding, Duolingo/Candy-Crush-style path of level nodes: alternating
// horizontal position per row (a repeating lane pattern), connected by a
// single SVG line drawn behind the nodes. Locked nodes are plain divs (not
// links); the first incomplete unlocked node gets a pulsing "Start" callout.
// Reused across every game with a level concept, not one-off per game.
export function SnakeLevelMap({ title, subtitle, levels, basePath, accent = "royal" }: SnakeLevelMapProps) {
  const ROW_HEIGHT = 112;
  const LANES = [18, 50, 82, 50]; // percent-of-width x-positions, repeating in a wave
  const nodeAccent = ACCENT_NODE[accent] ?? ACCENT_NODE.royal;
  const nodeRing = ACCENT_RING[accent] ?? ACCENT_RING.royal;

  const completedCount = levels.filter((level) => level.isCompleted).length;
  const nextPlayableIndex = levels.findIndex((level) => level.isUnlocked && !level.isCompleted);

  const points = levels.map((_, index) => ({
    x: LANES[index % LANES.length],
    y: index * ROW_HEIGHT + ROW_HEIGHT / 2,
  }));

  const pathHeight = levels.length * ROW_HEIGHT;
  const pathD = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <section className="grid gap-6 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle ?? "Complete a level to unlock the next one."}</p>
        </div>
        <span className="rounded-full bg-slate-900/5 px-4 py-2 text-sm font-semibold text-slate-700">
          {completedCount}/{levels.length} complete
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-sm" style={{ height: pathHeight }}>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${pathHeight}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={pathD} fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 5" className="text-slate-300" />
        </svg>

        {levels.map((level, index) => {
          const point = points[index];
          const isNextUp = index === nextPlayableIndex;

          const nodeInner = (
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg transition ${
                  level.isCompleted
                    ? `${nodeAccent}`
                    : level.isUnlocked
                      ? `${nodeAccent} ${isNextUp ? `ring-4 ${nodeRing} animate-pulse` : ""}`
                      : "bg-slate-300 shadow-none"
                } ${level.isUnlocked ? "hover:-translate-y-0.5 hover:shadow-xl" : ""}`}
              >
                {level.isCompleted ? "★" : level.isUnlocked ? level.levelNumber : "🔒"}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">{level.label}</p>
                {isNextUp ? (
                  <span className="mt-0.5 inline-block rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Start
                  </span>
                ) : null}
              </div>
            </div>
          );

          return (
            <div
              key={level.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${point.x}%`, top: point.y }}
            >
              {level.isUnlocked ? (
                <Link href={`${basePath}/${level.slug}` as Route} className="cursor-pointer">
                  {nodeInner}
                </Link>
              ) : (
                <div className="cursor-not-allowed opacity-80">{nodeInner}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
