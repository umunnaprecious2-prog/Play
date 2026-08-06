import Link from "next/link";

const PLATFORM_LINKS = [
  { label: "Bible Quiz Levels", href: "/levels" },
  { label: "Memory Verse", href: "/memory-verse" },
  { label: "Word Search", href: "/word-search" },
  { label: "Scripture Puzzle", href: "/scripture-puzzle" },
  { label: "Flash Cards", href: "/flashcards" },
] as const;

const MORE_LINKS = [
  { label: "Match the Verse", href: "/match-the-verse" },
  { label: "Bible Trivia", href: "/trivia" },
  { label: "Bible Story Challenge", href: "/story-challenge" },
  { label: "Character Guessing Game", href: "/who-am-i" },
  { label: "Daily Bible Challenge", href: "/daily-challenge" },
] as const;

export function Footer() {
  return (
    <footer className="grid gap-8 rounded-[1.75rem] bg-royal-900 p-8 text-white sm:p-10">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-xl font-black">📖 Play</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
            A Bible learning platform for kids and families — faith, education, and gameplay in one joyful daily
            experience.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Play Now</p>
          <ul className="mt-3 grid gap-2">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-gold-300 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">More Games</p>
          <ul className="mt-3 grid gap-2">
            {MORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-gold-300 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 text-center text-xs text-white/40">
        Play &middot; Built with faith and purpose.
      </div>
    </footer>
  );
}
