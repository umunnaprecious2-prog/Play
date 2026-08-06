import { QuizPreview } from "../../components/QuizPreview";

export default function QuizPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sunrise-600">Bible Quiz</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">A bright first game loop</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            This page is wired to the backend quiz session API so kids can start with a player profile, answer questions, and build progress.
          </p>
        </header>

        <QuizPreview />
      </div>
    </main>
  );
}
