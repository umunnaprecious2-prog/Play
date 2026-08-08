// The 20 Word Search puzzle slugs, in the same order as
// server/src/data/extra-games-content.json's wordSearchPuzzles. Needed here
// (not just fetched from the API at runtime) so the static export can
// pre-render /word-search/[levelSlug] for each one at build time.
export const WORD_SEARCH_LEVEL_SLUGS = [
  "creation-week",
  "the-twelve-disciples",
  "fruit-of-the-spirit",
  "old-testament-books",
  "new-testament-books",
  "miracles-of-jesus",
  "kings-of-israel",
  "the-christmas-story",
  "prophets-of-the-old-testament",
  "the-ten-commandments",
  "psalms-and-worship",
  "cities-of-the-bible",
  "women-of-the-bible",
  "the-armor-of-god",
  "the-parables-of-jesus",
  "the-apostles-epistles",
  "the-book-of-revelation",
  "wisdom-literature",
  "the-covenant-and-law",
  "theology-and-doctrine",
] as const;
