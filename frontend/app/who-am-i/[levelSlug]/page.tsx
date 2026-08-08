import { CharacterGuess } from "../../../components/CharacterGuess";
import { CHARACTER_GUESS_LEVEL_SLUGS } from "../../../lib/characterGuessLevels";

export function generateStaticParams() {
  return CHARACTER_GUESS_LEVEL_SLUGS.map((levelSlug) => ({ levelSlug }));
}

export default function WhoAmILevelPage({ params }: { params: { levelSlug: string } }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Who Am I?</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Guess the Bible character</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            One clue at a time. Guess as soon as you know, or use a hint to reveal another clue for -2 points.
          </p>
        </header>

        <CharacterGuess levelSlug={params.levelSlug} />
      </div>
    </main>
  );
}
