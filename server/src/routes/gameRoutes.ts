import { Router } from "express";
import { postPlayer, getPlayer, getPlayerProgressHandler, postMemoryVerseAnswer, postMemoryVerseSession, postQuizSession, postQuizAnswer } from "../controllers/gameController";
import { validateBody } from "../middlewares/validate";
import { createPlayerSchema, startMemoryVerseSessionSchema, startQuizSessionSchema, submitMemoryVerseAnswerSchema, submitQuizAnswerSchema } from "../validators/gameValidators";

const router = Router();

router.post("/players", validateBody(createPlayerSchema), postPlayer);
router.get("/players/:playerId", getPlayer);
router.get("/players/:playerId/progress", getPlayerProgressHandler);

router.post("/quiz/sessions", validateBody(startQuizSessionSchema), postQuizSession);
router.post("/quiz/answers", validateBody(submitQuizAnswerSchema), postQuizAnswer);

router.post("/memory-verse/sessions", validateBody(startMemoryVerseSessionSchema), postMemoryVerseSession);
router.post("/memory-verse/answers", validateBody(submitMemoryVerseAnswerSchema), postMemoryVerseAnswer);

export default router;