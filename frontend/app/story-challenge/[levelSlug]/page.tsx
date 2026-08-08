import { StoryChallenge } from "../../../components/StoryChallenge";
import { LEVEL_SLUGS } from "../../../lib/levels";

// Story Challenge is the only collection game with content in all 8
// thematic categories, so it reuses the same slug list Bible Quiz Levels
// uses -- not a coincidence, both happen to cover every thematic category.
export function generateStaticParams() {
  return LEVEL_SLUGS.map((levelSlug) => ({ levelSlug }));
}

export default function StoryChallengeLevelPage({ params }: { params: { levelSlug: string } }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-royal-600">Bible Story Challenge</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Put the story in the right order</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Use the arrows to reorder the events into the sequence they actually happened in the Bible.
          </p>
        </header>

        <StoryChallenge levelSlug={params.levelSlug} />
      </div>
    </main>
  );
}
