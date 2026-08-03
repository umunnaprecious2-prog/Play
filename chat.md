# Chat Plan

## Goal
Build a Bible-based educational gaming platform for children ages 5 to 12. The first release should be simple, polished, and easy to expand over time.

## Current Direction
Start with the backend first, then move to the frontend once the API and content model are stable.

## Recommendation
Keep the first child-facing release centered on one strong loop: quiz play, memory verse practice, and progression rewards. That gives us a polished core before expanding to the remaining game modes.

## Step-by-Step Plan
1. Define the backend domain model and API boundaries around the current Express and Prisma scaffold.
2. Expand Prisma beyond the current `Category` model to cover quiz content, verses, difficulty levels, media, player progress, and admin users.
3. Build the backend foundation with shared Prisma setup, error handling, validation, env loading, and route registration.
4. Create the admin content API for categories, questions, verses, uploads, and simple admin login.
5. Add seed and import support so content can be loaded from curated starter data and bulk files.
6. Define the first playable game API, starting with Bible Quiz and randomized answer options.
7. Add the shared player progression system for XP, levels, stars, badges, streaks, and unlocks.
8. Build the Next.js children-facing frontend once the API shape is stable.
9. Add the admin dashboard on top of the content API.
10. Roll out the remaining games in phases.
11. Validate the system with migrations, API checks, and one full gameplay loop.

## Notes
- Keep the UI bright, cheerful, and touch-friendly.
- Avoid hardcoding questions, verses, or game content.
- Design everything so new games and categories can be added later without major architecture changes.

## Next Step
Implement the backend foundation and database schema first.