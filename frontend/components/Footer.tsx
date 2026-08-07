import Image from "next/image";
import Link from "next/link";
import { GAMES } from "../lib/games";

const PLATFORM_LINKS = GAMES.slice(0, 5);
const MORE_LINKS = GAMES.slice(5);

export function Footer() {
  return (
    <footer className="grid gap-8 rounded-[1.75rem] bg-royal-900 p-8 text-white sm:p-10">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-xl font-black">
            <Image src="/logo.png" alt="Play logo" width={36} height={30} className="h-8 w-auto" />
            Play
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
            A Bible learning platform for kids and adults, bringing faith, education, and gameplay together in
            one joyful daily habit.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/account" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:underline">
              Sign In →
            </Link>
            <Link href="/download" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:underline">
              Get Android App →
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Play Now</p>
          <ul className="mt-3 grid gap-2">
            {PLATFORM_LINKS.map((game) => (
              <li key={game.slug}>
                <Link href={`/games/${game.slug}`} className="text-sm text-white/70 hover:text-gold-300 hover:underline">
                  {game.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">More Games</p>
          <ul className="mt-3 grid gap-2">
            {MORE_LINKS.map((game) => (
              <li key={game.slug}>
                <Link href={`/games/${game.slug}`} className="text-sm text-white/70 hover:text-gold-300 hover:underline">
                  {game.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:flex-row sm:justify-between">
        <span>Play &middot; Built with faith and purpose.</span>
        <span className="flex gap-4">
          <Link href="/privacy" className="hover:text-gold-300 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gold-300 hover:underline">
            Terms of Service
          </Link>
        </span>
      </div>
    </footer>
  );
}
