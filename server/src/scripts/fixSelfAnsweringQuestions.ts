import { prisma } from "../lib/prisma";

// One-off sync: 18 quiz questions where the prompt itself (not just the API
// payload) effectively stated the correct answer -- found via a word-overlap
// audit against all 956 active questions, then manually verified against
// each question's real distractor options before rewriting (not a blind
// rewrite of every flagged candidate). Fixed at the source in
// levels-books-batch{1,2,4,5,7,8,9}.json; this applies the same new wording
// directly to existing DB rows by slug, same pattern as
// fixLeakingQuestionPrompts.ts before it.
const PROMPT_FIXES: Array<{ slug: string; prompt: string }> = [
  { slug: "leviticus-02", prompt: "What offering did Leviticus prescribe when someone broke one of the LORD's commandments without meaning to?" },
  { slug: "judges-04", prompt: "What sign did Gideon ask God for to confirm his call to save Israel?" },
  { slug: "2-samuel-16", prompt: "Where did David purchase land to build an altar after his sinful census, later the site of Solomon's temple?" },
  { slug: "isaiah-13", prompt: "How does the book of Isaiah open its message of comfort to God's people after judgment, in chapter 40?" },
  { slug: "ezekiel-01", prompt: "What striking vision did God give Ezekiel in a valley, to show Israel He could restore them?" },
  { slug: "ezekiel-02", prompt: "What did Ezekiel see in his opening vision of God's glory, described in vivid, otherworldly detail?" },
  { slug: "hosea-04", prompt: "Which Old Testament verse about the Exodus does Matthew's Gospel apply to the child Jesus when His family returned from Egypt?" },
  { slug: "hosea-10", prompt: "Despite Israel's unfaithfulness, what lasting commitment does Hosea 2:19 say God promises to make to her?" },
  { slug: "micah-03", prompt: "According to Matthew's Gospel, who did King Herod call together to find out from the Scriptures where the Christ would be born?" },
  { slug: "zechariah-01", prompt: "What does Zechariah 9:9 prophesy about the manner in which Israel's coming king would arrive in Jerusalem?" },
  { slug: "2-corinthians-08", prompt: 'What title does Paul give God in 2 Corinthians 1:3, right after calling Him "the Father of mercies"?' },
  { slug: "ephesians-10", prompt: "According to Ephesians 3:20, how far beyond a believer's own prayers and imagination is God able to work?" },
  { slug: "2-thessalonians-04", prompt: 'What title does 2 Thessalonians 3:16 give the Lord, just before asking Him to be present "with you all"?' },
  { slug: "james-09", prompt: "Which New Testament James, who led the Jerusalem church and presided over its council in Acts 15, is traditionally credited as the author of the book of James?" },
  { slug: "1-john-08", prompt: 'What early heresy about Jesus\' physical nature does 1 John call "the spirit of antichrist"?' },
  { slug: "jude-04", prompt: 'What does Jude\'s closing doxology say about God\'s power over believers, right before praising Him as "the only wise God our Saviour"?' },
  { slug: "revelation-06", prompt: "What symbolic vision of cosmic conflict appears in Revelation chapter 12?" },
];

// 2-chronicles-12 needed more than a prompt reword: its correct option text
// ("Disaster/judgment on Judah") was itself a vague near-restatement of the
// old prompt. Rewrote both together.
const PROMPT_AND_OPTION_FIX = {
  slug: "2-chronicles-12",
  prompt: "What did the prophetess Huldah warn King Josiah would happen to Judah, based on the curses written in the Book of the Law found in the Temple?",
  explanation: "Huldah confirmed that the judgment written in the Book of the Law would come on Judah because of their unfaithfulness.",
  oldCorrectText: "Disaster/judgment on Judah",
  newCorrectText: "The judgment written in the Book of the Law would come upon Judah",
};

async function main() {
  for (const fix of PROMPT_FIXES) {
    const result = await prisma.quizQuestion.updateMany({
      where: { slug: fix.slug },
      data: { prompt: fix.prompt },
    });
    console.log(`${fix.slug}: updated ${result.count} row(s)`);
  }

  const question = await prisma.quizQuestion.findUnique({
    where: { slug: PROMPT_AND_OPTION_FIX.slug },
    include: { options: true },
  });
  if (!question) {
    console.log(`${PROMPT_AND_OPTION_FIX.slug}: NOT FOUND`);
  } else {
    await prisma.quizQuestion.update({
      where: { id: question.id },
      data: { prompt: PROMPT_AND_OPTION_FIX.prompt, explanation: PROMPT_AND_OPTION_FIX.explanation },
    });
    const correctOption = question.options.find((o) => o.isCorrect && o.text === PROMPT_AND_OPTION_FIX.oldCorrectText);
    if (correctOption) {
      await prisma.quizOption.update({
        where: { id: correctOption.id },
        data: { text: PROMPT_AND_OPTION_FIX.newCorrectText },
      });
      console.log(`${PROMPT_AND_OPTION_FIX.slug}: updated prompt + correct option text`);
    } else {
      console.log(`${PROMPT_AND_OPTION_FIX.slug}: WARNING - expected correct option text not found, option NOT updated`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
