import { DailyChallenge } from "../../components/DailyChallenge";

export default function DailyChallengePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sunrise-600">Daily Bible Challenge</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">One fresh challenge a day</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            The same question for everyone, every day. Answer once to keep your streak alive.
          </p>
        </header>

        <DailyChallenge />
      </div>
    </main>
  );
}
