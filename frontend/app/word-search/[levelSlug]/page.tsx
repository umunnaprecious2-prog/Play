"use client";

import { useParams } from "next/navigation";
import { WordSearch } from "../../../components/WordSearch";

export default function WordSearchLevelPage() {
  const params = useParams<{ levelSlug: string }>();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Word Search</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Find the hidden Bible words</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Words can run in any direction: across, down, or diagonal. Tap the first and last letter to select one.
          </p>
        </header>

        <WordSearch levelSlug={params.levelSlug} />
      </div>
    </main>
  );
}
