import { prisma } from "../lib/prisma";

const STOPWORDS = new Set(["the", "of", "and", "a", "an"]);

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

async function main() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, sortOrder: { lte: 72 } },
    orderBy: { sortOrder: "asc" },
    include: {
      quizQuestions: { where: { isActive: true }, include: { options: true } },
    },
  });

  const flagged: Array<{ category: string; slug: string; prompt: string; correct: string; distractors: string[]; uniqueCategoryWords: string[] }> = [];

  for (const category of categories) {
    const categoryWords = new Set(words(category.name));

    for (const q of category.quizQuestions) {
      const correct = q.options.find((o) => o.isCorrect);
      if (!correct) continue;
      const distractors = q.options.filter((o) => !o.isCorrect);
      const correctWords = new Set(words(correct.text));
      const distractorWordSets = distractors.map((d) => new Set(words(d.text)));

      const shared = [...categoryWords].filter((w) => correctWords.has(w));
      const uniqueToCategory = shared.filter((w) => !distractorWordSets.some((s) => s.has(w)));

      if (uniqueToCategory.length > 0) {
        flagged.push({
          category: category.name,
          slug: q.slug,
          prompt: q.prompt,
          correct: correct.text,
          distractors: distractors.map((d) => d.text),
          uniqueCategoryWords: uniqueToCategory,
        });
      }
    }
  }

  console.log(`Categories scanned: ${categories.length}`);
  console.log(`Questions flagged (category name shares a word with the correct answer that's absent from every distractor): ${flagged.length}\n`);

  for (const f of flagged) {
    console.log(`--- ${f.slug} in category "${f.category}" — shared=[${f.uniqueCategoryWords.join(", ")}]`);
    console.log(`PROMPT:  ${f.prompt}`);
    console.log(`CORRECT: ${f.correct}`);
    console.log(`WRONG:   ${f.distractors.join(" | ")}`);
    console.log();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
