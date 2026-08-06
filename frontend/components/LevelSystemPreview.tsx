import Link from "next/link";

const LEVEL_NAMES = ["Genesis", "Exodus", "Kings", "Prophets", "Parables", "Jesus", "Miracles", "Apostles"];

export function LevelSystemPreview() {
  return (
    <section className="grid gap-6 rounded-[1.75rem] bg-royal-900 p-6 text-white shadow-glow sm:p-8">
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-gold-300">Quiz Progression</span>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Structured Levels, Not a Wall of Questions</h2>
        <p className="mx-auto mt-2 max-w-2xl text-base text-white/70">
          Instead of hundreds of random questions, Bible Quiz is broken into levels that gradually increase in
          difficulty. Early levels cover the basics; later ones dig into prophecy, parables, kings, and the early
          church.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {LEVEL_NAMES.map((name, index) => (
          <div key={name} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${
                  index === 0 ? "bg-gold-400 text-royal-900" : "bg-white/10 text-white/70 ring-1 ring-inset ring-white/15"
                }`}
              >
                {index === 0 ? index + 1 : "🔒"}
              </div>
              <span className="text-xs text-white/60">{name}</span>
            </div>
            {index < LEVEL_NAMES.length - 1 ? <span className="text-white/20">→</span> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-inset ring-white/15">
          <p className="text-2xl font-black text-gold-300">25</p>
          <p className="mt-1 text-sm text-white/70">curated questions per level</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-inset ring-white/15">
          <p className="text-2xl font-black text-gold-300">10 → 6</p>
          <p className="mt-1 text-sm text-white/70">points per question, down to 6 with 2 hints used</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-inset ring-white/15">
          <p className="text-2xl font-black text-gold-300">1 → next</p>
          <p className="mt-1 text-sm text-white/70">complete a level to unlock the next one</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/games/levels"
          className="rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-royal-900 transition hover:bg-gold-300"
        >
          See the Level Map →
        </Link>
      </div>
    </section>
  );
}
