const FEATURES = [
  { icon: "⭐", title: "XP & Levels", text: "Every correct answer earns points that add up to real progress." },
  { icon: "💡", title: "Hints When Stuck", text: "A hint is always one tap away, for a small cost. Never a dead end." },
  { icon: "🏅", title: "Badges & Streaks", text: "Come back daily to build a streak and unlock badges along the way." },
  { icon: "🦁", title: "Unlockable Avatars", text: "Playful characters unlock as XP, levels, and streaks grow." },
];

export function FeatureGrid() {
  return (
    <section className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Why kids (and grown-ups) keep playing</h2>
        <p className="mt-2 text-base text-slate-600">Built to reward curiosity, not punish mistakes.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-[1.5rem] bg-slate-50 p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-600/10 text-3xl">
              {feature.icon}
            </div>
            <h3 className="mt-3 text-lg font-black text-slate-900">{feature.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
