import { ScripturePuzzle } from "../../components/ScripturePuzzle";

export default function ScripturePuzzlePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-royal-600">Scripture Puzzle</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Rebuild the verse, word by word</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Tap the scrambled words in the right order to rebuild the verse. Stuck? Use a hint to reveal the next
            word for -2 points.
          </p>
        </header>

        <ScripturePuzzle />
      </div>
    </main>
  );
}
