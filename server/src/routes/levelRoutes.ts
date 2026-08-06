import { Router } from "express";
import { getLevels, postLevelAnswer, postLevelHint, postLevelSession } from "../controllers/levelController";
import { validateBody, validateQuery } from "../middlewares/validate";
import {
  listLevelsQuerySchema,
  requestLevelHintSchema,
  startLevelSessionSchema,
  submitLevelAnswerSchema,
} from "../validators/gameValidators";

/**
 * @swagger
 * tags:
 *   - name: Levels
 *     description: Leveled Bible Quiz (one level per category, sequential unlock, hints)
 */
const router = Router();

/**
 * @swagger
 * /levels:
 *   get:
 *     tags: [Levels]
 *     summary: List all levels with lock/completion status for a player
 *     parameters:
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Levels with progress
 */
router.get("/", validateQuery(listLevelsQuerySchema), getLevels);

/**
 * @swagger
 * /levels/{categorySlug}/sessions:
 *   post:
 *     tags: [Levels]
 *     summary: Start a level session (25 fixed questions for that category)
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId: { type: string }
 *             required: [playerId]
 *     responses:
 *       201:
 *         description: Level session started
 */
router.post("/:categorySlug/sessions", validateBody(startLevelSessionSchema), postLevelSession);

/**
 * @swagger
 * /levels/hints:
 *   post:
 *     tags: [Levels]
 *     summary: Use a hint on a question (max 2 per question, -2 points each)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId: { type: string }
 *               questionId: { type: string }
 *             required: [sessionId, questionId]
 *     responses:
 *       201:
 *         description: Hint revealed
 */
router.post("/hints", validateBody(requestLevelHintSchema), postLevelHint);

/**
 * @swagger
 * /levels/answers:
 *   post:
 *     tags: [Levels]
 *     summary: Submit an answer within a level session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId: { type: string }
 *               questionId: { type: string }
 *               selectedText: { type: string }
 *             required: [sessionId, questionId, selectedText]
 *     responses:
 *       201:
 *         description: Answer submitted
 */
router.post("/answers", validateBody(submitLevelAnswerSchema), postLevelAnswer);

export default router;
