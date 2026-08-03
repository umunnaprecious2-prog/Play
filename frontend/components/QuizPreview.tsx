"use client";

import { useState } from "react";
import type { QuizQuestion } from "../lib/types";

type QuizPreviewProps = {
  questions: QuizQuestion[];
};

export function QuizPreview({ questions }: QuizPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = questions[currentIndex];

  if (!question) {
    return null;
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quiz preview</h2>
          <p className="mt-1 text-sm text-slate-600">Large buttons, few words, and fast feedback.</p>
        </div>
        <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Bible Quiz</p>
        <h3 className="mt-3 text-3xl font-black leading-tight">{question.prompt}</h3>
        {question.scriptureReference ? <p className="mt-3 text-sm text-slate-300">{question.scriptureReference}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-base font-semibold text-slate-800 transition hover:border-sunrise-300 hover:bg-sunrise-50"
          >
            {option.text}
          </button>
        ))}
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
          onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
          className="rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
        >
          Next
        </button>
      </div>
    </section>
  );
}