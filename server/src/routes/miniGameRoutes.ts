import { Router } from "express";
import { validateBody, validateQuery } from "../middlewares/validate";
import {
  postVerseMatchSession,
  postVerseMatchComplete,
  postFlashCardSession,
  postFlashCardComplete,
  postScripturePuzzleSession,
  postScripturePuzzleHint,
  postScripturePuzzleAnswer,
  postCharacterGuessSession,
  postCharacterHint,
  postCharacterGuessAnswer,
  postStoryOrderSession,
  postStoryOrderAnswer,
  postWordSearchSession,
  postWordSearchFound,
  getDailyChallenge,
  postDailyChallengeAnswer,
} from "../controllers/miniGameController";
import {
  startVerseMatchSchema,
  completeVerseMatchSchema,
  startFlashCardSchema,
  completeFlashCardSchema,
  startScripturePuzzleSchema,
  scripturePuzzleHintSchema,
  scripturePuzzleAnswerSchema,
  startCharacterGuessSchema,
  characterHintSchema,
  characterGuessAnswerSchema,
  startStoryOrderSchema,
  storyOrderAnswerSchema,
  startWordSearchSchema,
  wordSearchFoundSchema,
  dailyChallengeQuerySchema,
  dailyChallengeAnswerSchema,
} from "../validators/miniGameValidators";

/**
 * @swagger
 * tags:
 *   - name: MatchTheVerse
 *     description: Memory-match pairing verse references with their text
 *   - name: FlashCards
 *     description: Self-graded verse recall
 *   - name: ScripturePuzzle
 *     description: Reorder a scrambled verse, word by word
 *   - name: CharacterGuess
 *     description: Guess the Bible character from progressive clues
 *   - name: StoryChallenge
 *     description: Put Bible story events in the correct order
 *   - name: WordSearch
 *     description: Find hidden Bible words in a letter grid
 *   - name: DailyChallenge
 *     description: One shared question per calendar day
 */
const router = Router();

/**
 * @swagger
 * /games/verse-match/sessions:
 *   post:
 *     tags: [MatchTheVerse]
 *     summary: Start a Match the Verse session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerseMatchSessionRequest'
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerseMatchSessionResponse'
 */
router.post("/verse-match/sessions", validateBody(startVerseMatchSchema), postVerseMatchSession);

/**
 * @swagger
 * /games/verse-match/complete:
 *   post:
 *     tags: [MatchTheVerse]
 *     summary: Complete a Match the Verse session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerseMatchCompleteRequest'
 *     responses:
 *       201:
 *         description: Session completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerseMatchCompleteResponse'
 */
router.post("/verse-match/complete", validateBody(completeVerseMatchSchema), postVerseMatchComplete);

/**
 * @swagger
 * /games/flashcards/sessions:
 *   post:
 *     tags: [FlashCards]
 *     summary: Start a Flash Cards session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlashCardSessionRequest'
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlashCardSessionResponse'
 */
router.post("/flashcards/sessions", validateBody(startFlashCardSchema), postFlashCardSession);

/**
 * @swagger
 * /games/flashcards/complete:
 *   post:
 *     tags: [FlashCards]
 *     summary: Complete a Flash Cards session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlashCardCompleteRequest'
 *     responses:
 *       201:
 *         description: Session completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FlashCardCompleteResponse'
 */
router.post("/flashcards/complete", validateBody(completeFlashCardSchema), postFlashCardComplete);

/**
 * @swagger
 * /games/scripture-puzzle/sessions:
 *   post:
 *     tags: [ScripturePuzzle]
 *     summary: Start a Scripture Puzzle session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScripturePuzzleSessionRequest'
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScripturePuzzleSessionResponse'
 */
router.post("/scripture-puzzle/sessions", validateBody(startScripturePuzzleSchema), postScripturePuzzleSession);

/**
 * @swagger
 * /games/scripture-puzzle/hints:
 *   post:
 *     tags: [ScripturePuzzle]
 *     summary: Reveal the next word (max 2 hints, -2 points each)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScripturePuzzleHintRequest'
 *     responses:
 *       201:
 *         description: Hint revealed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScripturePuzzleHintResponse'
 */
router.post("/scripture-puzzle/hints", validateBody(scripturePuzzleHintSchema), postScripturePuzzleHint);

/**
 * @swagger
 * /games/scripture-puzzle/answers:
 *   post:
 *     tags: [ScripturePuzzle]
 *     summary: Submit the reordered verse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScripturePuzzleAnswerRequest'
 *     responses:
 *       201:
 *         description: Answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScripturePuzzleAnswerResponse'
 */
router.post("/scripture-puzzle/answers", validateBody(scripturePuzzleAnswerSchema), postScripturePuzzleAnswer);

/**
 * @swagger
 * /games/characters/sessions:
 *   post:
 *     tags: [CharacterGuess]
 *     summary: Start a Character Guessing Game session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharacterGuessSessionRequest'
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharacterGuessSessionResponse'
 */
router.post("/characters/sessions", validateBody(startCharacterGuessSchema), postCharacterGuessSession);

/**
 * @swagger
 * /games/characters/hints:
 *   post:
 *     tags: [CharacterGuess]
 *     summary: Reveal the next clue (max 2 hints, -2 points each)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharacterHintRequest'
 *     responses:
 *       201:
 *         description: Hint revealed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharacterHintResponse'
 */
router.post("/characters/hints", validateBody(characterHintSchema), postCharacterHint);

/**
 * @swagger
 * /games/characters/answers:
 *   post:
 *     tags: [CharacterGuess]
 *     summary: Submit a free-text guess for the character's name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharacterGuessAnswerRequest'
 *     responses:
 *       201:
 *         description: Guess submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharacterGuessAnswerResponse'
 */
router.post("/characters/answers", validateBody(characterGuessAnswerSchema), postCharacterGuessAnswer);

/**
 * @swagger
 * /games/stories/sessions:
 *   post:
 *     tags: [StoryChallenge]
 *     summary: Start a Bible Story Challenge session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoryOrderSessionRequest'
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryOrderSessionResponse'
 */
router.post("/stories/sessions", validateBody(startStoryOrderSchema), postStoryOrderSession);

/**
 * @swagger
 * /games/stories/answers:
 *   post:
 *     tags: [StoryChallenge]
 *     summary: Submit the reordered story events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoryOrderAnswerRequest'
 *     responses:
 *       201:
 *         description: Answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryOrderAnswerResponse'
 */
router.post("/stories/answers", validateBody(storyOrderAnswerSchema), postStoryOrderAnswer);

/**
 * @swagger
 * /games/word-search/sessions:
 *   post:
 *     tags: [WordSearch]
 *     summary: Start a Word Search session (server-generated grid)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WordSearchSessionRequest'
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WordSearchSessionResponse'
 */
router.post("/word-search/sessions", validateBody(startWordSearchSchema), postWordSearchSession);

/**
 * @swagger
 * /games/word-search/found:
 *   post:
 *     tags: [WordSearch]
 *     summary: Claim a found word by the cell path traced
 *     description: The path is verified server-side against the actual generated grid, not trusted from the client.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WordSearchFoundRequest'
 *     responses:
 *       201:
 *         description: Word checked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WordSearchFoundResponse'
 */
router.post("/word-search/found", validateBody(wordSearchFoundSchema), postWordSearchFound);

/**
 * @swagger
 * /games/daily:
 *   get:
 *     tags: [DailyChallenge]
 *     summary: Get today's shared question (same question for every player, deterministic by date)
 *     parameters:
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Today's question, or the result of today's earlier attempt if already completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyChallengeResponse'
 */
router.get("/daily", validateQuery(dailyChallengeQuerySchema), getDailyChallenge);

/**
 * @swagger
 * /games/daily/answers:
 *   post:
 *     tags: [DailyChallenge]
 *     summary: Submit today's answer (one completion per player per day)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DailyChallengeAnswerRequest'
 *     responses:
 *       201:
 *         description: Answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyChallengeAnswerResponse'
 */
router.post("/daily/answers", validateBody(dailyChallengeAnswerSchema), postDailyChallengeAnswer);

export default router;
