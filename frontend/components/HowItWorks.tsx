const STEPS = [
  {
    number: 1,
    icon: "👤",
    color: "bg-royal-100 text-royal-700",
    badge: "bg-royal-600",
    title: "Create Your Player",
    text: "Pick a nickname and an avatar — no email or sign-up form needed. Your progress saves automatically on this device.",
  },
  {
    number: 2,
    icon: "📖",
    color: "bg-gold-100 text-gold-600",
    badge: "bg-gold-500",
    title: "Choose a Game & Start",
    text: "Start with the flagship Bible Quiz — complete Level 1's 25 questions to unlock Level 2, and keep climbing.",
  },
  {
    number: 3,
    icon: "🏆",
    color: "bg-meadow-100 text-meadow-600",
    badge: "bg-meadow-500",
    title: "Earn XP, Stars & Badges",
    text: "Every correct answer earns points. Streaks, milestones, and great scores unlock badges and avatars.",
  },
  {
    number: 4,
    icon: "🔁",
    color: "bg-sky-100 text-sky-600",
    badge: "bg-sky-500",
    title: "Return Daily & Grow",
    text: "Come back to keep your streak alive, review the verses behind past answers, and push into the next level.",
  },
];

export function HowItWorks() {
  return (
    <section className="grid gap-8 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">The Journey</span>
        <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">How Your Learning Journey Works</h2>
        <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600">
          Play is designed to build lasting biblical knowledge through daily habits, progressive challenge, and
          meaningful rewards.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {STEPS.map((step) => (
          <div key={step.number} className="flex gap-4">
            <div className="relative shrink-0">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${step.color}`}>{step.icon}</div>
              <span
                className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white ${step.badge}`}
              >
                {step.number}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
