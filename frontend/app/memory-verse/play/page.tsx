import { MemoryVersePreview } from "../../../components/MemoryVersePreview";

export default function MemoryVersePlayPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-meadow-600">Memory Verse</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Practice with kindness and repetition</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Read, repeat, and type short verse practice responses with a calm, friendly layout. Built for anyone, kids
            and adults alike.
          </p>
        </header>

        <MemoryVersePreview />
      </div>
    </main>
  );
}
