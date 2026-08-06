import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addChildProfile,
  claimGuestProfile,
  listChildren,
  loginParent,
  signupParent,
} from "../services/parentAuthService";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, claimPlayerId } = req.body;
  const result = await signupParent(email, password, claimPlayerId);

  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginParent(email, password);

  res.status(200).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const children = await listChildren(req.parentAccount!.id);

  res.status(200).json({
    success: true,
    data: { parent: { id: req.parentAccount!.id, email: req.parentAccount!.email }, children },
  });
});

export const addChild = asyncHandler(async (req: Request, res: Response) => {
  const { nickname, avatarSlug } = req.body;
  const child = await addChildProfile(req.parentAccount!.id, nickname, avatarSlug);

  res.status(201).json({ success: true, data: child });
});

export const claimChild = asyncHandler(async (req: Request, res: Response) => {
  const { playerId } = req.body;
  const child = await claimGuestProfile(req.parentAccount!.id, playerId);

  res.status(200).json({ success: true, data: child });
});
