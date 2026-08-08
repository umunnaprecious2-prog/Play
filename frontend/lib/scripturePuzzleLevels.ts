// Scripture Puzzle levels = the subset of the 8 thematic categories that
// actually have at least one Bible verse assigned (server/src/services/
// scripturePuzzleService.ts's levelCategories()). Needed here as a static
// list (not fetched from the API) so the static export can pre-render
// /scripture-puzzle/[levelSlug] for each one at build time. Update this list
// if a new thematic category gets its first verse (or an existing one loses
// its last one).
export const SCRIPTURE_PUZZLE_LEVEL_SLUGS = ["genesis", "exodus", "kings", "prophets", "jesus", "apostles"] as const;
