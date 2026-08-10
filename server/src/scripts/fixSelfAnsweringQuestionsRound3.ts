import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

// Third self-answering-question pass. The user asked to fix every one of the
// 114 candidates the stricter unique-word-match test originally flagged, not
// just the 26 judged as high-confidence real leaks in round 2 -- rather than
// leave any of them to a QA reviewer's judgment call, even the ones that
// looked like generic topic-framing (e.g. "which kingdom of Israel" sharing
// the word "Israel" with its own answer). Reworded all 90 remaining
// candidates' prompts to remove the shared word/phrase entirely, then found
// and fixed several more rounds of new overlaps introduced by the rewording
// itself (the same failure mode as round 2, caught the same way -- re-run
// the audit after every batch of fixes) until the full 956-question bank
// scored 0 on all three checks: exact-substring, the original overlap
// percentage, and the strict unique-word-match test.
//
// Reads prompts directly from the JSON source files (levels-content.json +
// levels-books-batch*.json) rather than hardcoding the text here, so this
// script always applies whatever the current source-of-truth wording is --
// safe to re-run after further edits to those files.
const SLUGS = [
  "exodus-12", "parables-22", "parables-24", "jesus-25", "miracles-15", "miracles-25",
  "deuteronomy-01", "deuteronomy-07", "joshua-18", "judges-20",
  "1-samuel-07", "2-samuel-09", "2-samuel-10", "2-kings-12", "2-kings-14", "1-chronicles-06",
  "2-chronicles-02", "2-chronicles-08", "2-chronicles-12", "nehemiah-01", "nehemiah-10", "nehemiah-11",
  "esther-04", "esther-14",
  "job-14", "psalms-05", "psalms-06", "proverbs-04", "proverbs-08", "ecclesiastes-08",
  "jeremiah-05", "lamentations-06", "lamentations-07", "ezekiel-01", "ezekiel-07", "daniel-01", "daniel-02",
  "hosea-04", "hosea-07", "joel-03", "joel-07", "amos-03", "amos-05", "amos-07", "amos-08",
  "obadiah-02", "obadiah-05", "jonah-09", "jonah-10", "jonah-13", "micah-03", "micah-06",
  "zephaniah-04", "haggai-04", "zechariah-01", "zechariah-02", "malachi-05",
  "matthew-07", "matthew-13", "matthew-16", "mark-08", "mark-10", "luke-11", "john-14", "john-15",
  "acts-15", "1-corinthians-09", "galatians-01", "galatians-02", "galatians-05",
  "philippians-05", "colossians-02", "1-thessalonians-06", "1-thessalonians-08", "2-thessalonians-03",
  "1-timothy-05", "1-timothy-07",
  "hebrews-06", "hebrews-09", "hebrews-10", "james-02", "james-08", "james-12",
  "1-peter-03", "1-peter-08", "1-john-08", "3-john-05", "jude-01", "jude-05", "revelation-16",
];

const DATA_DIR = path.resolve(__dirname, "../data");
const FILES = [
  "levels-content.json",
  "levels-books-batch1.json",
  "levels-books-batch2.json",
  "levels-books-batch3.json",
  "levels-books-batch4.json",
  "levels-books-batch5.json",
  "levels-books-batch6.json",
  "levels-books-batch7.json",
  "levels-books-batch8.json",
  "levels-books-batch9.json",
];

type QuestionRecord = { slug: string; prompt: string };

function loadAllQuestions(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of FILES) {
    const filePath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    const questions: QuestionRecord[] = json.quizQuestions ?? [];
    for (const q of questions) {
      map.set(q.slug, q.prompt);
    }
  }
  return map;
}

async function main() {
  const promptMap = loadAllQuestions();
  let updated = 0;
  let missing = 0;

  for (const slug of SLUGS) {
    const prompt = promptMap.get(slug);
    if (!prompt) {
      console.log(`${slug}: NOT FOUND IN JSON SOURCE FILES`);
      missing++;
      continue;
    }
    const result = await prisma.quizQuestion.updateMany({ where: { slug }, data: { prompt } });
    if (result.count === 0) {
      console.log(`${slug}: NOT FOUND IN DB`);
      missing++;
    } else {
      updated++;
    }
  }

  console.log(`\nUpdated ${updated} / ${SLUGS.length} rows. Missing: ${missing}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
