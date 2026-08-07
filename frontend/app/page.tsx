import Link from "next/link";
import { Hero } from "../components/Hero";
import { FeatureGrid } from "../components/FeatureGrid";
import { HowItWorks } from "../components/HowItWorks";
import { AudienceHighlights } from "../components/AudienceHighlights";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { GAMES } from "../lib/games";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <Hero />

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 text-center shadow-soft backdrop-blur sm:p-8">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Our Mission</span>
          <h2 className="mx-auto mt-2 max-w-3xl text-2xl font-black text-slate-900 sm:text-3xl">
            Bible Study Made Joyful
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Play brings faith, education, and gameplay together for kids and adults alike. It&apos;s built to be
            joyful and welcoming, so people keep coming back and growing in their knowledge of Scripture.
          </p>
        </section>

        <FeatureGrid />

        <HowItWorks />

        <section className="grid gap-3 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">The Arcade</span>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Ten Games, One Adventure</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            {GAMES.length} Bible-centered games are live today, every verse quoted exactly as written in the King
            James Version. Pick a game, set up your nickname and avatar, and start playing.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              href="/account"
              className="rounded-full bg-royal-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-royal-500/30 transition hover:-translate-y-0.5 hover:bg-royal-700"
            >
              Sign In to Play →
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            On Android?{" "}
            <Link href="/download" className="font-semibold text-royal-600 hover:underline">
              Install the app →
            </Link>
          </p>
        </section>

        <AudienceHighlights />

        <FAQ />

        <section className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 text-center shadow-soft backdrop-blur sm:p-8">
          <h2 className="text-2xl font-black text-slate-900">Understand why an answer is right, not just whether you got it</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Every question comes with a short explanation and the Bible verse behind the answer.",
              "Answer at your own pace. Hints are there when you need them, never a punishment when you don't get it right.",
              "Earn XP, stars, badges, streaks, and avatar unlocks as you go.",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-base leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link
              href="/account"
              className="rounded-full bg-sunrise-500 px-8 py-3 text-base font-bold text-white transition hover:bg-sunrise-600"
            >
              Sign In to Play →
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
