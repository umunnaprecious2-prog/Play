import { MatchTheVerse } from "../../components/MatchTheVerse";

export default function MatchTheVersePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-meadow-600">Match the Verse</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Pair the reference with its verse</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Flip two cards at a time. Find every reference-and-verse pair with as few misses as possible. Every verse
            is quoted exactly from the King James Version.
          </p>
        </header>

        <MatchTheVerse />
      </div>
    </main>
  );
}
