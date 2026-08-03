"use client";

import { useState } from "react";
import type { VerseItem } from "../lib/types";

type MemoryVersePreviewProps = {
  verses: VerseItem[];
};

export function MemoryVersePreview({ verses }: MemoryVersePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const verse = verses[currentIndex];

  if (!verse) {
    return null;
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Memory verse practice</h2>
          <p className="mt-1 text-sm text-slate-600">Short verses, simple prompts, and positive feedback.</p>
        </div>
        <span className="rounded-full bg-meadow-50 px-4 py-2 text-sm font-semibold text-meadow-700">
          {currentIndex + 1}/{verses.length}
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-meadow-50 p-6 shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-meadow-700">{verse.reference}</p>
        <p className="mt-3 text-2xl font-black leading-relaxed text-slate-900">{verse.text}</p>
        {verse.memoryHint ? <p className="mt-3 text-sm font-medium text-slate-600">Hint: {verse.memoryHint}</p> : null}
      </div>

      <div className="grid gap-3">
        <textarea
          rows={4}
          placeholder="Type the verse from memory or practice a few words at a time"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-meadow-400 focus:ring-4 focus:ring-meadow-100"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.min(verses.length - 1, value + 1))}
          className="rounded-full bg-meadow-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-meadow-600"
        >
          Next
        </button>
      </div>
    </section>
  );
}