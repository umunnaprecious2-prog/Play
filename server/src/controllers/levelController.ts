import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { listLevelsForPlayer, requestLevelHint, startLevelSession, submitLevelAnswer } from "../services/levelService";

export const getLevels = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await listLevelsForPlayer(playerId) });
});

export const postLevelSession = asyncHandler(async (req: Request, res: Response) => {
  const categorySlug = String(req.params.categorySlug);
  res.status(201).json({
    success: true,
    data: await startLevelSession({ playerId: req.body.playerId, categorySlug, restart: req.body.restart }),
  });
});

export const postLevelHint = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await requestLevelHint(req.body) });
});

export const postLevelAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitLevelAnswer(req.body) });
});
