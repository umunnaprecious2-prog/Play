import { LevelMap } from "../../components/LevelMap";

export default function LevelsPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sunrise-600">Bible Quiz</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Grow in the Word, one level at a time</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Each level covers one book of the Bible, up to 25 questions worth 10 points each. Stuck? Use a hint for
            -2 points, up to 2 hints per question. Finish a level to unlock the next one.
          </p>
        </header>

        <LevelMap />
      </div>
    </main>
  );
}
