import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  difficultyCreateSchema,
  difficultyUpdateSchema,
  importSchema,
  mediaCreateSchema,
  mediaUpdateSchema,
  questionCreateSchema,
  questionUpdateSchema,
  verseCreateSchema,
  verseUpdateSchema,
} from "../validators/adminValidators";
import {
  getCategories,
  getDifficulties,
  getImportHistory,
  getMediaAssets,
  getQuestions,
  getVerses,
  importBulkContent,
  postCategory,
  postDifficulty,
  postMediaAsset,
  postQuestion,
  postVerse,
  putCategory,
  putDifficulty,
  putMediaAsset,
  putQuestion,
  putVerse,
  removeCategory,
  removeDifficulty,
  removeMediaAsset,
  removeQuestion,
  removeVerse,
} from "../controllers/adminController";

const router = Router();

router.use(authenticateAdmin);

router.get("/categories", getCategories);
router.post("/categories", validateBody(categoryCreateSchema), postCategory);
router.put("/categories/:id", validateBody(categoryUpdateSchema), putCategory);
router.delete("/categories/:id", removeCategory);

router.get("/difficulties", getDifficulties);
router.post("/difficulties", validateBody(difficultyCreateSchema), postDifficulty);
router.put("/difficulties/:id", validateBody(difficultyUpdateSchema), putDifficulty);
router.delete("/difficulties/:id", removeDifficulty);

router.get("/questions", getQuestions);
router.post("/questions", validateBody(questionCreateSchema), postQuestion);
router.put("/questions/:id", validateBody(questionUpdateSchema), putQuestion);
router.delete("/questions/:id", removeQuestion);

router.get("/verses", getVerses);
router.post("/verses", validateBody(verseCreateSchema), postVerse);
router.put("/verses/:id", validateBody(verseUpdateSchema), putVerse);
router.delete("/verses/:id", removeVerse);

router.get("/media", getMediaAssets);
router.post("/media", validateBody(mediaCreateSchema), postMediaAsset);
router.put("/media/:id", validateBody(mediaUpdateSchema), putMediaAsset);
router.delete("/media/:id", removeMediaAsset);

router.post("/imports/json", validateBody(importSchema), importBulkContent);
router.get("/imports", getImportHistory);

export default router;