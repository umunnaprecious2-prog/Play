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

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin content management (categories, difficulties, quiz questions, Bible verses, media, bulk imports). Every route in this file requires an admin bearer token.
 */
const router = Router();

router.use(authenticateAdmin);

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: List categories (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedCategoriesResponse'
 */
router.get("/categories", getCategories);

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     tags: [Admin]
 *     summary: Create a category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.post("/categories", validateBody(categoryCreateSchema), postCategory);

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateRequest'
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.put("/categories/:id", validateBody(categoryUpdateSchema), putCategory);

/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.delete("/categories/:id", removeCategory);

/**
 * @swagger
 * /admin/difficulties:
 *   get:
 *     tags: [Admin]
 *     summary: List difficulty levels (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated difficulty levels
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedDifficultiesResponse'
 */
router.get("/difficulties", getDifficulties);

/**
 * @swagger
 * /admin/difficulties:
 *   post:
 *     tags: [Admin]
 *     summary: Create a difficulty level
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DifficultyCreateRequest'
 *     responses:
 *       201:
 *         description: Difficulty level created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DifficultyLevel'
 */
router.post("/difficulties", validateBody(difficultyCreateSchema), postDifficulty);

/**
 * @swagger
 * /admin/difficulties/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a difficulty level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DifficultyUpdateRequest'
 *     responses:
 *       200:
 *         description: Difficulty level updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DifficultyLevel'
 *       404:
 *         description: Difficulty level not found
 */
router.put("/difficulties/:id", validateBody(difficultyUpdateSchema), putDifficulty);

/**
 * @swagger
 * /admin/difficulties/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a difficulty level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Difficulty level deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DifficultyLevel'
 */
router.delete("/difficulties/:id", removeDifficulty);

/**
 * @swagger
 * /admin/questions:
 *   get:
 *     tags: [Admin]
 *     summary: List quiz questions (paginated, with options)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: difficultyId
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated quiz questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedQuestionsResponse'
 */
router.get("/questions", getQuestions);

/**
 * @swagger
 * /admin/questions:
 *   post:
 *     tags: [Admin]
 *     summary: Create a quiz question with its answer options
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionCreateRequest'
 *     responses:
 *       201:
 *         description: Quiz question created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminQuizQuestion'
 */
router.post("/questions", validateBody(questionCreateSchema), postQuestion);

/**
 * @swagger
 * /admin/questions/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a quiz question
 *     description: If options is provided, it fully replaces the existing option set.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionUpdateRequest'
 *     responses:
 *       200:
 *         description: Quiz question updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminQuizQuestion'
 *       404:
 *         description: Quiz question not found
 */
router.put("/questions/:id", validateBody(questionUpdateSchema), putQuestion);

/**
 * @swagger
 * /admin/questions/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a quiz question
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quiz question deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminQuizQuestion'
 */
router.delete("/questions/:id", removeQuestion);

/**
 * @swagger
 * /admin/verses:
 *   get:
 *     tags: [Admin]
 *     summary: List Bible verses (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: difficultyId
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated Bible verses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedVersesResponse'
 */
router.get("/verses", getVerses);

/**
 * @swagger
 * /admin/verses:
 *   post:
 *     tags: [Admin]
 *     summary: Create a Bible verse
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerseCreateRequest'
 *     responses:
 *       201:
 *         description: Bible verse created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminBibleVerse'
 */
router.post("/verses", validateBody(verseCreateSchema), postVerse);

/**
 * @swagger
 * /admin/verses/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a Bible verse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerseUpdateRequest'
 *     responses:
 *       200:
 *         description: Bible verse updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminBibleVerse'
 *       404:
 *         description: Bible verse not found
 */
router.put("/verses/:id", validateBody(verseUpdateSchema), putVerse);

/**
 * @swagger
 * /admin/verses/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a Bible verse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Bible verse deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminBibleVerse'
 */
router.delete("/verses/:id", removeVerse);

/**
 * @swagger
 * /admin/media:
 *   get:
 *     tags: [Admin]
 *     summary: List media assets (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated media assets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedMediaAssetsResponse'
 */
router.get("/media", getMediaAssets);

/**
 * @swagger
 * /admin/media:
 *   post:
 *     tags: [Admin]
 *     summary: Register a media asset (image/audio URL)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaCreateRequest'
 *     responses:
 *       201:
 *         description: Media asset created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaAsset'
 */
router.post("/media", validateBody(mediaCreateSchema), postMediaAsset);

/**
 * @swagger
 * /admin/media/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a media asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaUpdateRequest'
 *     responses:
 *       200:
 *         description: Media asset updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaAsset'
 *       404:
 *         description: Media asset not found
 */
router.put("/media/:id", validateBody(mediaUpdateSchema), putMediaAsset);

/**
 * @swagger
 * /admin/media/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a media asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Media asset deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaAsset'
 */
router.delete("/media/:id", removeMediaAsset);

/**
 * @swagger
 * /admin/imports/json:
 *   post:
 *     tags: [Admin]
 *     summary: Bulk import content (categories, difficulties, media, quiz questions, verses)
 *     description: Upsert-based on slug -- safe to re-run the same payload. Every array is optional. Runs inside a single transaction, so a failure partway through rolls back cleanly rather than leaving partial data.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImportContentRequest'
 *     responses:
 *       201:
 *         description: Import completed, counts of records processed per type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportContentResponse'
 */
router.post("/imports/json", validateBody(importSchema), importBulkContent);

/**
 * @swagger
 * /admin/imports:
 *   get:
 *     tags: [Admin]
 *     summary: List past import jobs (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated import job history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedImportJobsResponse'
 */
router.get("/imports", getImportHistory);

export default router;
