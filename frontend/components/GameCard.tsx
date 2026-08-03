import type { ReactNode } from "react";

type GameCardProps = {
  title: string;
  description: string;
  accent: string;
  href: string;
  icon: ReactNode;
};

export function GameCard({ title, description, accent, href, icon }: GameCardProps) {
  return (
    <a href={href} className={`group rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl ${accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            {icon}
          </div>
          <h3 className="text-2xl font-black text-slate-900">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-sm font-semibold text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
          Play
        </span>
      </div>
      <p className="mt-4 max-w-md text-base leading-7 text-slate-700">{description}</p>
    </a>
  );
}