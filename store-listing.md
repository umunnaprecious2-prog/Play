# Store Listing Content (Phase 4 reference)

Copy-paste-ready content for Google Play Console and App Store Connect once
those accounts exist. Everything here describes what the app actually does
today — nothing aspirational or unbuilt.

## App name
Play: Bible Games for Kids

(Both stores allow ~30 characters for the title; "Play" alone would collide
with countless other listings, so this pairs it with what it actually is.)

## Short description (Google Play, max 80 characters)
Ten Bible games for kids & adults. KJV Scripture, real progress, no ads.

## Subtitle (App Store, max 30 characters)
Bible Games for the Family

## Full description

Play brings the Bible to life through ten games built for kids and adults
alike — Bible Quiz Levels, Memory Verse, Word Search, Scripture Puzzle,
Flash Cards, Match the Verse, Bible Trivia, Bible Story Challenge, a
Character Guessing Game, and a Daily Bible Challenge.

Every verse quoted anywhere in the app is the King James Version, exactly as
written — never paraphrased.

WHAT MAKES PLAY DIFFERENT
- Real progression: XP, levels, streaks, and stars that build up as you play
- Structured difficulty: Bible Quiz Levels ramp from Genesis basics to
  deeper Scripture across 8 levels; most other games escalate across 20
  rounds
- No account required to start playing — pick a game, choose a nickname and
  an avatar, and go
- Optional account: create one to keep progress synced if you play on more
  than one device, and to manage a player profile for each of your kids
- No ads. No third-party trackers. Nothing to buy.

WHO IT'S FOR
Kids learning Bible basics for the first time, adults deepening their
Scripture memory, churches and homeschool groups looking for a screen-time
activity with real educational value.

## Keywords (App Store, max 100 characters, comma-separated)
bible,bible games,kids bible,scripture,memory verse,bible trivia,christian,sunday school,kjv

## Category
Primary: Education
Secondary: Trivia (if the store allows a secondary category)

## Support URL
https://play-frontend-static.onrender.com (or the final production domain,
if one gets set up before submission)

## Privacy Policy URL
https://play-frontend-static.onrender.com/privacy

## Content rating questionnaire — prep notes
Answering these accurately in each console's actual questionnaire (can't be
filled out here, no dashboard access):
- No violence, no sexual content, no profanity, no gambling
- No user-generated content visible to other users (nicknames are private
  to each player/account, not shown publicly or to other users)
- No in-app purchases currently
- No third-party ads or trackers
- No location data, no contacts access, no camera/microphone access
- Collects: an email address (only if the user chooses to create an
  account) and a password (hashed, never stored in plain text). Nothing
  else. See /privacy for the full policy.
- Expected rating: Everyone / 4+ (Apple) or equivalent lowest tier (Google) —
  the content genuinely doesn't touch any of the categories either store
  asks about beyond "collects an email if you sign up."

## Screenshots
Captured against the live production site at `store-assets/screenshots/`
(1170×2532, iPhone-class portrait — a reasonable base resolution both
stores accept, though each console may ask for additional sizes for other
device classes closer to actual submission):
- `01-landing.png` — the hero/landing page
- `02-games-list.png` — all ten games
- `03-level-map.png` — the Bible Quiz level map
- `04-word-search-gameplay.png` — a real game in progress, with a genuine
  puzzle loaded from the production database
