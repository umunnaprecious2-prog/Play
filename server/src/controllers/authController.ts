import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginAdmin } from "../services/authService";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginAdmin(email, password);

  res.status(200).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      adminUser: req.adminUser,
      adminSession: req.adminSession,
    },
  });
});