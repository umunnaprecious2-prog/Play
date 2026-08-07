import Link from "next/link";
import { LevelQuiz } from "../../../components/LevelQuiz";
import { LEVEL_SLUGS } from "../../../lib/levels";

export function generateStaticParams() {
  return LEVEL_SLUGS.map((slug) => ({ slug }));
}

export default function LevelPlayPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/levels" className="text-sm font-semibold text-sunrise-600 hover:underline">
          ← Back to the level map
        </Link>

        <LevelQuiz categorySlug={params.slug} />
      </div>
    </main>
  );
}
