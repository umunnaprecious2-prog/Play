import { MemoryVersePreview } from "../../components/MemoryVersePreview";
import { apiFetch } from "../../lib/api";
import { createGuestNickname } from "../../lib/guest";
import type { VerseItem } from "../../lib/types";

async function loadVerses(): Promise<VerseItem[]> {
  const playerResponse = await apiFetch<{ success: boolean; data: { id: string } }>("/games/players", {
    method: "POST",
    body: JSON.stringify({ nickname: createGuestNickname("guest-verse"), avatarSlug: "gentle-sheep" }),
  });

  const verseResponse = await apiFetch<{ success: boolean; data: { verses: VerseItem[] } }>("/games/memory-verse/sessions", {
    method: "POST",
    body: JSON.stringify({ playerId: playerResponse.data.id, verseCount: 3 }),
  });

  return verseResponse.data.verses;
}

export default async function MemoryVersePage() {
  const verses = await loadVerses().catch(() => []);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-meadow-600">Memory Verse</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Practice with kindness and repetition</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Kids can read, repeat, and type short verse practice responses with a calm, friendly layout.
          </p>
        </header>

        {verses.length > 0 ? (
          <MemoryVersePreview verses={verses} />
        ) : (
          <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
            <h2 className="text-2xl font-black text-slate-900">No memory verses available yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Seed the server database first, then this page will load live memory verse sessions.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}