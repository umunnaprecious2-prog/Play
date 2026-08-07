// The 8 Bible Quiz level categories, in order. Mirrors
// server/src/data/levels-content.json's category slugs exactly. Needed here
// (not just fetched from the API at runtime) so the static export can
// pre-render /levels/[slug] for each one at build time.
export const LEVEL_SLUGS = ["genesis", "exodus", "kings", "prophets", "parables", "jesus", "miracles", "apostles"] as const;
