import { prisma } from "../lib/prisma";

// Second self-answering-question pass, prompted by the user asking for a
// stricter re-confirmation of the first pass (fixSelfAnsweringQuestions.ts).
// That first pass used a raw word-overlap percentage; re-auditing with a
// stricter, more precise test -- does a word shared between the prompt and
// the correct answer fail to appear in ANY of the wrong answers, meaning the
// correct option can be pattern-matched without any Bible knowledge at all --
// surfaced 26 more real leaks the percentage-based check had missed (mostly
// direct quotes or specific/rare terms restated in the prompt, e.g. "using
// birds and flowers as examples" directly restating the only option that
// mentions birds and flowers). Fixed at the source in the batch JSON files;
// this applies the same wording to existing DB rows by slug.
const FIXES: Array<{ slug: string; prompt: string }> = [
  { slug: "leviticus-10", prompt: "What happened to Aaron's sons Nadab and Abihu after they disobeyed God's instructions for the priesthood?" },
  { slug: "deuteronomy-05", prompt: "What verse from Deuteronomy did Jesus quote as His first response to Satan's temptation in the wilderness?" },
  { slug: "2-samuel-14", prompt: "Once he was firmly established as king, what did David ask his officials about survivors of the previous royal family?" },
  { slug: "job-12", prompt: "What confident declaration of faith did Job make in the middle of his suffering, expressing hope that would outlast even his own death?" },
  { slug: "ecclesiastes-02", prompt: "According to Ecclesiastes 1:1, how is the book's speaker identified, traditionally understood to be Solomon?" },
  { slug: "isaiah-01", prompt: "What miraculous sign did Isaiah give King Ahaz, later understood as pointing forward to Jesus?" },
  { slug: "isaiah-02", prompt: "What series of names does Isaiah 9:6 give to the child who would be born, describing His character and rule?" },
  { slug: "jeremiah-03", prompt: "What object did Jeremiah watch a craftsman reshape, illustrating God's power to remake a nation?" },
  { slug: "ezekiel-11", prompt: "What vision does Ezekiel end the book with, showing hope for Israel's future?" },
  { slug: "joel-02", prompt: "What promise from Joel 2:28 did Peter quote at Pentecost, marking a new and universal blessing from God?" },
  { slug: "amos-03", prompt: 'What does Amos 5:24 call God\'s people to let "run down" like a mighty, unstoppable stream?' },
  { slug: "jonah-12", prompt: "What did God provide to teach Jonah a lesson about compassion for Nineveh?" },
  { slug: "nahum-04", prompt: "What does Nahum 1:7 call the LORD, describing Him as good and a refuge for those who trust Him?" },
  { slug: "haggai-02", prompt: "What did Haggai rebuke the people for, in contrast to the effort they put into their own homes?" },
  { slug: "haggai-04", prompt: "What promise does Haggai 2:9 give the discouraged builders about the Temple they were rebuilding?" },
  { slug: "ephesians-04", prompt: "What attitude does Ephesians 4:32 instruct believers to have toward each other, following God's own example toward them?" },
  { slug: "philippians-01", prompt: "What well-known verse from Philippians 4:13 expresses Paul's confidence in facing any circumstance?" },
  { slug: "1-thessalonians-02", prompt: "What three short commands does 1 Thessalonians 5:16-18 give for a believer's constant attitude?" },
  { slug: "2-timothy-07", prompt: "How does Paul describe his own approaching death in 2 Timothy 4:6, using the image of a drink offering?" },
  { slug: "1-peter-06", prompt: "Who was 1 Peter primarily written to, according to its opening address in 1:1?" },
  { slug: "3-john-02", prompt: "What wish does John express for Gaius as the letter of 3 John opens?" },
  { slug: "revelation-05", prompt: "What vision in Revelation 6 involves riders on white, red, black, and pale horses?" },
  { slug: "parables-05", prompt: "In Jesus' well-known parable from Luke 10, who finally stopped to help a man who had been beaten and robbed on the road to Jericho?" },
  { slug: "matthew-11", prompt: "In the Sermon on the Mount, what did Jesus teach His listeners, encouraging them to trust in daily provision rather than being consumed by their own concerns?" },
  { slug: "romans-06", prompt: "According to Romans 10:9, what does Paul say is required for a person to be saved?" },
  { slug: "revelation-10", prompt: "What does John see at the start of Revelation 21, once everything from the old creation has passed away?" },
];

async function main() {
  for (const fix of FIXES) {
    const result = await prisma.quizQuestion.updateMany({ where: { slug: fix.slug }, data: { prompt: fix.prompt } });
    console.log(`${fix.slug}: updated ${result.count} row(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
