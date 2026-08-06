const AUDIENCES = [
  {
    icon: "👨‍👩‍👧‍👦",
    title: "For Families",
    text: "A shared activity the whole family can play together. Bright, encouraging, and never punishing a wrong guess.",
  },
  {
    icon: "⛪",
    title: "For Churches & Ministries",
    text: "A fun on-ramp into Scripture memory and Bible knowledge for kids' church, youth group, or small groups.",
  },
  {
    icon: "🎓",
    title: "For Schools & Study Groups",
    text: "Structured levels and clear explanations make it easy to fold into a Bible class or homeschool routine.",
  },
];

export function AudienceHighlights() {
  return (
    <section className="grid gap-8 rounded-[1.75rem] bg-royal-50 p-6 shadow-soft sm:p-8">
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Who It&apos;s For</span>
        <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Built for Families, Churches &amp; Students</h2>
        <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600">
          Play is brand new, and we&apos;re building it in the open. Here&apos;s who it&apos;s designed for.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {AUDIENCES.map((audience) => (
          <div key={audience.title} className="rounded-[1.5rem] bg-white p-6 shadow-soft">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-100 text-3xl">{audience.icon}</div>
            <h3 className="mt-4 text-lg font-black text-slate-900">{audience.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{audience.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
