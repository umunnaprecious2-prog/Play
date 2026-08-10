// Detects when showing a level/category's own name during play would let a
// player pick the correct multiple-choice option without any Bible
// knowledge -- e.g. a level titled "Song of Solomon" sitting above a
// question asking who wrote it. Computed dynamically against the real
// options every time (not a hardcoded per-question list), so it keeps
// working correctly if content is added, removed, or reworded later.
//
// The test: does a significant word from the category's own name appear in
// the correct answer's text while appearing in NONE of the wrong answers?
// If so, that word alone lets a player single out the right option purely by
// matching it against the level name, with zero recall required. This is
// deliberately narrower than "the category name appears anywhere in the
// correct answer" -- e.g. "Psalms" sharing the word "psalm" with the answer
// "Psalm 23" is NOT flagged, because every plausible wrong answer in that
// question is *also* "Psalm <number>", so the shared word doesn't actually
// tell you which number is correct. That distinction was verified by hand
// against the real data before this rule was written.
const STOPWORDS = new Set(["the", "of", "and", "a", "an"]);

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
}

// A tiny, explicitly-curated supplement for morphological pairs the plain
// word-match above can't catch on its own -- e.g. "Philippians" (the level
// name, a demonym) vs "Philippi" (the correct answer, the underlying place
// name). Each entry maps a category slug to extra word(s) that should be
// treated as equivalent to the category's own name for this check. Found via
// a manual review of the full 72-category audit, not guessed -- kept small
// and explicit rather than a general stemming rule, which risks
// reintroducing the Psalms/Hebrews-style false positives above.
const KNOWN_MORPHOLOGICAL_EQUIVALENTS: Record<string, string[]> = {
  philippians: ["philippi"],
};

export function categoryNameRevealsAnswer(input: {
  categorySlug: string;
  categoryName: string;
  correctText: string;
  distractorTexts: string[];
}): boolean {
  const categoryWords = new Set(significantWords(input.categoryName));
  for (const extra of KNOWN_MORPHOLOGICAL_EQUIVALENTS[input.categorySlug] ?? []) {
    categoryWords.add(extra);
  }

  const correctWords = new Set(significantWords(input.correctText));
  const distractorWordSets = input.distractorTexts.map((text) => new Set(significantWords(text)));

  const shared = [...categoryWords].filter((word) => correctWords.has(word));
  return shared.some((word) => !distractorWordSets.some((set) => set.has(word)));
}
