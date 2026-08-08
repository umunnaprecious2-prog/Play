import Link from "next/link";
import { AVATAR_OPTIONS } from "../lib/avatars";

type QuizResultsScreenProps = {
  nickname: string;
  avatarSlug: string | null;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  totalXp: number;
  onPlayAgain: () => void;
};

// Shared "you finished a round" celebration for the two games that predate
// the trophy-based LevelCompleteScreen (Quick Practice Quiz, Memory Verse
// practice) -- neither has a level/round concept, so a bouncing avatar +
// simple score summary fits better here than a per-level trophy card.
export function QuizResultsScreen({
  nickname,
  avatarSlug,
  correctCount,
  totalCount,
  xpEarned,
  totalXp,
  onPlayAgain,
}: QuizResultsScreenProps) {
  const avatar = AVATAR_OPTIONS.find((option) => option.slug === avatarSlug) ?? AVATAR_OPTIONS[0];

  return (
    <section className="grid justify-items-center gap-5 rounded-[1.75rem] bg-royal-900 p-8 text-center text-white shadow-glow">
      <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-200 ring-1 ring-inset ring-white/20">
        Results
      </span>

      <div
        className={`flex h-24 w-24 animate-bounce items-center justify-center rounded-full text-5xl ring-4 ${avatar.ring}`}
        aria-hidden
      >
        {avatar.emoji}
      </div>

      <h2 className="text-3xl font-black">Nice work, {nickname}! 🎉</h2>
      <p className="text-white/80">
        You got <span className="font-bold text-gold-300">{correctCount}</span> of {totalCount} right.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
          <p className="text-xl font-black text-gold-300">+{xpEarned}</p>
          <p className="text-xs text-white/60">XP earned</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
          <p className="text-xl font-black">{totalXp}</p>
          <p className="text-xs text-white/60">Total XP</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full bg-gold-400 px-7 py-3.5 text-base font-bold text-royal-900 shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
        >
          Play Again →
        </button>
        <Link
          href="/games"
          className="rounded-full bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20"
        >
          Back to Games
        </Link>
      </div>
    </section>
  );
}
