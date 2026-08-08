import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createPlayerProfile,
  getPlayerProgress,
  getPlayerProfile,
  getMemoryVerseLevelMap,
  getTriviaLevelMap,
  startMemoryVerseSession,
  startQuizSession,
  submitMemoryVerseAnswer,
  submitQuizAnswer,
} from "../services/gameService";

export const postPlayer = asyncHandler(async (req: Request, res: Response) => {
  const { nickname, avatarSlug } = req.body;
  const player = await createPlayerProfile(nickname, avatarSlug);

  res.status(201).json({ success: true, data: player });
});

export const getPlayer = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await getPlayerProfile(String(req.params.playerId)) });
});

export const getPlayerProgressHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await getPlayerProgress(String(req.params.playerId)) });
});

export const getTriviaLevelMapController = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await getTriviaLevelMap(playerId) });
});

export const postQuizSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startQuizSession(req.body) });
});

export const postQuizAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitQuizAnswer(req.body) });
});

export const getMemoryVerseLevelMapController = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await getMemoryVerseLevelMap(playerId) });
});

export const postMemoryVerseSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startMemoryVerseSession(req.body) });
});

export const postMemoryVerseAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitMemoryVerseAnswer(req.body) });
});