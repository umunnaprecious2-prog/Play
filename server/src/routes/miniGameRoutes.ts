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

const router = Router();

router.post("/verse-match/sessions", validateBody(startVerseMatchSchema), postVerseMatchSession);
router.post("/verse-match/complete", validateBody(completeVerseMatchSchema), postVerseMatchComplete);

router.post("/flashcards/sessions", validateBody(startFlashCardSchema), postFlashCardSession);
router.post("/flashcards/complete", validateBody(completeFlashCardSchema), postFlashCardComplete);

router.post("/scripture-puzzle/sessions", validateBody(startScripturePuzzleSchema), postScripturePuzzleSession);
router.post("/scripture-puzzle/hints", validateBody(scripturePuzzleHintSchema), postScripturePuzzleHint);
router.post("/scripture-puzzle/answers", validateBody(scripturePuzzleAnswerSchema), postScripturePuzzleAnswer);

router.post("/characters/sessions", validateBody(startCharacterGuessSchema), postCharacterGuessSession);
router.post("/characters/hints", validateBody(characterHintSchema), postCharacterHint);
router.post("/characters/answers", validateBody(characterGuessAnswerSchema), postCharacterGuessAnswer);

router.post("/stories/sessions", validateBody(startStoryOrderSchema), postStoryOrderSession);
router.post("/stories/answers", validateBody(storyOrderAnswerSchema), postStoryOrderAnswer);

router.post("/word-search/sessions", validateBody(startWordSearchSchema), postWordSearchSession);
router.post("/word-search/found", validateBody(wordSearchFoundSchema), postWordSearchFound);

router.get("/daily", validateQuery(dailyChallengeQuerySchema), getDailyChallenge);
router.post("/daily/answers", validateBody(dailyChallengeAnswerSchema), postDailyChallengeAnswer);

export default router;
