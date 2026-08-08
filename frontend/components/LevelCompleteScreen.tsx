type LevelCompleteScreenProps = {
  label: string;
  passed: boolean;
  stars: number;
  levelScore: number;
  xpEarned: number;
  totalScore: number;
  onContinue: () => void;
  continueLabel: string;
  onBackToLevels: () => void;
};

export function LevelCompleteScreen({
  label,
  passed,
  stars,
  levelScore,
  xpEarned,
  totalScore,
  onContinue,
  continueLabel,
  onBackToLevels,
}: LevelCompleteScreenProps) {
  return (
    <section className="grid justify-items-center gap-5 rounded-[1.75rem] bg-royal-900 p-8 text-center text-white shadow-glow">
      <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-200 ring-1 ring-inset ring-white/20">
        {label}
      </span>

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-400 text-4xl shadow-lg shadow-gold-500/40">
        🏆
      </div>

      <h2 className="text-3xl font-black">{passed ? "You passed!" : "So close! Try again."}</h2>

      <div className="flex gap-2 text-3xl" aria-label={`${stars} out of 3 stars`}>
        {[1, 2, 3].map((position) => (
          <span key={position} aria-hidden className={position <= stars ? "opacity-100" : "opacity-25"}>
            ⭐
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
          <p className="text-xl font-black">{levelScore}</p>
          <p className="text-xs text-white/60">Level score</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
          <p className="text-xl font-black text-gold-300">+{xpEarned}</p>
          <p className="text-xs text-white/60">XP earned</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
          <p className="text-xl font-black">{totalScore}</p>
          <p className="text-xs text-white/60">Total score</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-gold-400 px-7 py-3.5 text-base font-bold text-royal-900 shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
        >
          {continueLabel} →
        </button>
        <button
          type="button"
          onClick={onBackToLevels}
          className="rounded-full bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20"
        >
          ← Back to Levels
        </button>
      </div>
    </section>
  );
}
