import { TriviaGame } from "../../../components/TriviaGame";

export default function TriviaPlayPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-royal-600">Bible Trivia</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Fast, wide-ranging trivia</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            15 questions from across the whole Bible, 15 seconds each. Answer quick before the timer runs out!
          </p>
        </header>

        <TriviaGame />
      </div>
    </main>
  );
}
