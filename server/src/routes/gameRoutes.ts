import { Router } from "express";
import {
  postPlayer,
  getPlayer,
  getPlayerProgressHandler,
  getMemoryVerseLevelMapController,
  getTriviaLevelMapController,
  postMemoryVerseAnswer,
  postMemoryVerseSession,
  postQuizSession,
  postQuizAnswer,
} from "../controllers/gameController";
import { validateBody, validateQuery } from "../middlewares/validate";
import {
  createPlayerSchema,
  memoryVerseLevelMapQuerySchema,
  startMemoryVerseSessionSchema,
  startQuizSessionSchema,
  submitMemoryVerseAnswerSchema,
  submitQuizAnswerSchema,
  triviaLevelMapQuerySchema,
} from "../validators/gameValidators";

/**
 * @swagger
 * tags:
 *   - name: Players
 *     description: Player management
 *   - name: Quiz
 *     description: Bible quiz game sessions and answers
 *   - name: MemoryVerse
 *     description: Memory verse practice sessions and answers
 */
const router = Router();

/**
 * @swagger
 * /players:
 *   post:
 *     tags: [Players]
 *     summary: Create a new player profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlayerRequest'
 *     responses:
 *       201:
 *         description: Player created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerProfile'
 */
router.post("/players", validateBody(createPlayerSchema), postPlayer);

/**
 * @swagger
 * /players/{playerId}:
 *   get:
 *     tags: [Players]
 *     summary: Get a player profile by ID
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerProfile'
 */
router.get("/players/:playerId", getPlayer);

/**
 * @swagger
 * /players/{playerId}/progress:
 *   get:
 *     tags: [Players]
 *     summary: Get player progress and rewards
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player progress and rewards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerProgress'
 */
router.get("/players/:playerId/progress", getPlayerProgressHandler);

/**
 * @swagger
 * /trivia/level-map:
 *   get:
 *     tags: [Quiz]
 *     summary: Get this player's current Bible Trivia level position (Trivia reuses quiz sessions tagged metadata.mode="trivia")
 *     parameters:
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current level and max level
 */
router.get("/trivia/level-map", validateQuery(triviaLevelMapQuerySchema), getTriviaLevelMapController);

/**
 * @swagger
 * /quiz/sessions:
 *   post:
 *     tags: [Quiz]
 *     summary: Start a quiz session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizSessionStartRequest'
 *     responses:
 *       201:
 *         description: Quiz session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizSessionResponse'
 */
router.post("/quiz/sessions", validateBody(startQuizSessionSchema), postQuizSession);

/**
 * @swagger
 * /quiz/answers:
 *   post:
 *     tags: [Quiz]
 *     summary: Submit a quiz answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizAnswerRequest'
 *     responses:
 *       201:
 *         description: Quiz answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAnswerResponse'
 */
router.post("/quiz/answers", validateBody(submitQuizAnswerSchema), postQuizAnswer);

/**
 * @swagger
 * /memory-verse/sessions:
 *   post:
 *     tags: [MemoryVerse]
 *     summary: Start a memory verse session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemoryVerseSessionStartRequest'
 *     responses:
 *       201:
 *         description: Memory verse session started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemoryVerseSessionResponse'
 */
router.post("/memory-verse/sessions", validateBody(startMemoryVerseSessionSchema), postMemoryVerseSession);

/**
 * @swagger
 * /memory-verse/level-map:
 *   get:
 *     tags: [MemoryVerse]
 *     summary: Get this player's current Memory Verse level position (10 levels, 20 verses each)
 *     parameters:
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current level and max level
 */
router.get("/memory-verse/level-map", validateQuery(memoryVerseLevelMapQuerySchema), getMemoryVerseLevelMapController);

/**
 * @swagger
 * /memory-verse/answers:
 *   post:
 *     tags: [MemoryVerse]
 *     summary: Submit a memory verse answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemoryVerseAnswerRequest'
 *     responses:
 *       201:
 *         description: Memory verse answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemoryVerseAnswerResponse'
 */
router.post("/memory-verse/answers", validateBody(submitMemoryVerseAnswerSchema), postMemoryVerseAnswer);

export default router;