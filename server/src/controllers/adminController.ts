import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createCategory,
  createDifficulty,
  createMediaAsset,
  createQuestion,
  createVerse,
  deleteCategory,
  deleteDifficulty,
  deleteMediaAsset,
  deleteQuestion,
  deleteVerse,
  importContent,
  getImportJobs,
  listCategories,
  listCategoriesPaged,
  listDifficulties,
  listDifficultiesPaged,
  listMediaAssets,
  listMediaAssetsPaged,
  listQuestions,
  listQuestionsPaged,
  listVerses,
  listVersesPaged,
  updateCategory,
  updateDifficulty,
  updateMediaAsset,
  updateQuestion,
  updateVerse,
} from "../services/adminService";

function getIdParam(req: Request) {
  return String(req.params.id || "");
}

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: await listCategoriesPaged({
      page: typeof _req.query.page === "string" ? Number(_req.query.page) : undefined,
      limit: typeof _req.query.limit === "string" ? Number(_req.query.limit) : undefined,
      search: typeof _req.query.search === "string" ? _req.query.search : undefined,
    }),
  });
});

export const postCategory = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await createCategory(req.body) });
});

export const putCategory = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await updateCategory(getIdParam(req), req.body) });
});

export const removeCategory = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await deleteCategory(getIdParam(req)) });
});

export const getDifficulties = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: await listDifficultiesPaged({
      page: typeof _req.query.page === "string" ? Number(_req.query.page) : undefined,
      limit: typeof _req.query.limit === "string" ? Number(_req.query.limit) : undefined,
      search: typeof _req.query.search === "string" ? _req.query.search : undefined,
    }),
  });
});

export const postDifficulty = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await createDifficulty(req.body) });
});

export const putDifficulty = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await updateDifficulty(getIdParam(req), req.body) });
});

export const removeDifficulty = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await deleteDifficulty(getIdParam(req)) });
});

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: await listQuestionsPaged({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
      difficultyId: typeof req.query.difficultyId === "string" ? req.query.difficultyId : undefined,
      isActive: typeof req.query.isActive === "string" ? req.query.isActive === "true" : undefined,
      page: typeof req.query.page === "string" ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === "string" ? Number(req.query.limit) : undefined,
    }),
  });
});

export const postQuestion = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await createQuestion(req.body) });
});

export const putQuestion = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await updateQuestion(getIdParam(req), req.body) });
});

export const removeQuestion = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await deleteQuestion(getIdParam(req)) });
});

export const getVerses = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: await listVersesPaged({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
      difficultyId: typeof req.query.difficultyId === "string" ? req.query.difficultyId : undefined,
      isActive: typeof req.query.isActive === "string" ? req.query.isActive === "true" : undefined,
      page: typeof req.query.page === "string" ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === "string" ? Number(req.query.limit) : undefined,
    }),
  });
});

export const postVerse = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await createVerse(req.body) });
});

export const putVerse = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await updateVerse(getIdParam(req), req.body) });
});

export const removeVerse = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await deleteVerse(getIdParam(req)) });
});

export const getMediaAssets = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: await listMediaAssetsPaged({
      page: typeof _req.query.page === "string" ? Number(_req.query.page) : undefined,
      limit: typeof _req.query.limit === "string" ? Number(_req.query.limit) : undefined,
      search: typeof _req.query.search === "string" ? _req.query.search : undefined,
    }),
  });
});

export const postMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await createMediaAsset(req.body) });
});

export const putMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await updateMediaAsset(getIdParam(req), req.body) });
});

export const removeMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await deleteMediaAsset(getIdParam(req)) });
});

export const importBulkContent = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await importContent(req.body) });
});

export const getImportHistory = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: await getImportJobs({
      page: typeof req.query.page === "string" ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === "string" ? Number(req.query.limit) : undefined,
    }),
  });
});