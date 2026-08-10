import { prisma } from "../lib/prisma";

// One-off sync: updates the `prompt` field on 7 existing quiz questions whose
// wording restated the correct answer verbatim (found via a QA pass and
// fixed at the source in the levels-content.json / levels-books-batch*.json
// files). Re-running the full import isn't needed for a text-only field
// change, so this applies the same new wording directly by slug.
const FIXES: Array<{ slug: string; prompt: string }> = [
  {
    slug: "genesis-24",
    prompt: "How many sons did Jacob have, whose descendants became the tribes of Israel?",
  },
  {
    slug: "exodus-14",
    prompt: "At Rephidim, what did Moses strike with his staff so that water flowed out for the thirsty people?",
  },
  {
    slug: "2-chronicles-04",
    prompt: "What major spiritual reforms did King Hezekiah carry out early in his reign to turn Judah back to the LORD?",
  },
  {
    slug: "song-of-solomon-01",
    prompt: 'According to its opening verse, who wrote this "song of songs"?',
  },
  {
    slug: "daniel-05",
    prompt: "What troubling dream did Daniel interpret for King Nebuchadnezzar, one showing the rise and fall of great kingdoms?",
  },
  {
    slug: "zephaniah-03",
    prompt: "What comforting promise does Zephaniah give about how God feels toward His people?",
  },
  {
    slug: "zechariah-12",
    prompt: "In one of Zechariah's early night visions, what did he see that had scattered Judah, followed by a second group sent to stop them?",
  },
];

async function main() {
  for (const fix of FIXES) {
    const result = await prisma.quizQuestion.updateMany({
      where: { slug: fix.slug },
      data: { prompt: fix.prompt },
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
