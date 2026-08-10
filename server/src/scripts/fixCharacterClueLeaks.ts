import { prisma } from "../lib/prisma";

// One-off sync: 2 Character Guess clue sets where clue 1 stated part or all
// of the character's own required-guess name, found via a name/clue overlap
// audit against all 120 active characters. Fixed at the source in
// character-guess-expansion-batch1.json / extra-games-content.json.
const FIXES: Array<{ slug: string; clues: string[] }> = [
  {
    slug: "joseph-the-carpenter",
    clues: [
      "I was a humble, hardworking tradesman from the town of Nazareth.",
      "An angel told me in a dream not to fear taking my betrothed as my wife.",
      "I raised Jesus as my own son.",
    ],
  },
  {
    slug: "mark-apostle",
    clues: [
      "In the book of Acts, I am referred to by two different names.",
      "I traveled with Paul and Barnabas, then later with Peter.",
      "I wrote one of the four Gospels.",
    ],
  },
];

async function main() {
  for (const fix of FIXES) {
    const result = await prisma.bibleCharacter.updateMany({
      where: { slug: fix.slug },
      data: { clues: fix.clues },
    });
    console.log(`${fix.slug}: updated ${result.count} row(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
