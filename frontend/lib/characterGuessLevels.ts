// Character Guess ("Who Am I?") levels = the subset of the 8 thematic
// categories that actually have at least one Bible character assigned
// (server/src/services/characterGuessService.ts's level-building query;
// Parables and Miracles currently have none). Needed here as a static list
// (not fetched from the API) so the static export can pre-render
// /who-am-i/[levelSlug] for each one at build time. Update this list if a
// new thematic category gets its first character (or an existing one loses
// its last one).
export const CHARACTER_GUESS_LEVEL_SLUGS = ["genesis", "exodus", "kings", "prophets", "jesus", "apostles"] as const;
