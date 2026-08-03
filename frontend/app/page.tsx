import { Hero } from "../components/Hero";
import { GameCard } from "../components/GameCard";
import { PlayerSetupForm } from "../components/PlayerSetupForm";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <Hero />

        <section className="grid gap-5 md:grid-cols-2">
          <GameCard
            title="Bible Quiz"
            description="Answer colorful multiple-choice questions with shuffled options, XP rewards, and cheerful encouragement."
            href="/quiz"
            accent="border-sunrise-100"
            icon="Q"
          />
          <GameCard
            title="Memory Verse"
            description="Practice verses with gentle repetition, hints, and simple progress tracking for kids."
            href="/memory-verse"
            accent="border-meadow-100"
            icon="V"
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <PlayerSetupForm onCreated={() => undefined} />

          <div className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-black text-slate-900">What kids can do next</h2>
            <div className="grid gap-3">
              {[
                "Answer shuffled Bible quiz questions with large buttons.",
                "Practice memory verses with calm repetition and hints.",
                "Earn XP, stars, badges, streaks, and avatar unlocks.",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-base leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft md:grid-cols-3">
          {[
            ["XP", "Level up through play"],
            ["Badges", "Collect rewards for progress"],
            ["Streaks", "Keep learning every day"],
          ].map(([title, text]) => (
            <article key={title} className="rounded-[1.5rem] bg-slate-50 p-5">
              <h3 className="text-xl font-black text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}