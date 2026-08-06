"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    question: "Is Play suitable for young children?",
    answer:
      "Yes. Large touch-friendly buttons, bright colors, short reading, and encouraging feedback (never punishment for a wrong answer) are core to the design across every game. Difficulty ramps up gradually as you go, so it stays approachable from the first round.",
  },
  {
    question: "How many games are there?",
    answer:
      "Ten, and all of them are live today: Bible Quiz Levels, Memory Verse, Word Search, Scripture Puzzle, Flash Cards, Match the Verse, Bible Trivia, Bible Story Challenge, the Character Guessing Game, and the Daily Bible Challenge. Every verse quoted anywhere on Play is the King James Version, word for word.",
  },
  {
    question: "How does the level system work?",
    answer:
      "Bible Quiz Levels has 8 structured levels of 25 questions each, 10 points a question. Stuck on one? Use a hint for -2 points, up to 2 per question, and a correct answer still earns 6 points even with both hints used. Most of the other games ramp difficulty across up to 20 rounds the same way. Finish one to unlock the next.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No email or password needed. Pick a game, then choose a nickname and an avatar. A player profile is created automatically and saved on your device, so your XP, streaks, and progress persist between visits, and you won't be asked again next time.",
  },
  {
    question: "Is Play free to use?",
    answer: "Yes, every game on Play is free to play right now.",
  },
  {
    question: "Can churches and schools use Play for their programs?",
    answer:
      "That's a big part of the vision. Dedicated classroom or group-management tools aren't built yet, but the games themselves work great today for a kids' church class, youth group, or homeschool routine.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="grid gap-6 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">FAQ</span>
        <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Frequently Asked Questions</h2>
        <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600">
          Everything you need to know before starting your Bible learning journey.
        </p>
      </div>

      <div className="grid gap-3">
        {QUESTIONS.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className={`rounded-2xl border px-5 py-4 transition ${isOpen ? "border-royal-200 bg-royal-50" : "border-slate-200 bg-white"}`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-bold text-slate-900">{item.question}</span>
                <span className={`text-xl text-royal-500 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                  ⌄
                </span>
              </button>
              {isOpen ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
