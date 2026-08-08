import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginAdmin } from "../services/authService";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginAdmin(email, password);

  res.status(200).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  // Only ever return a safe subset -- req.adminUser/req.adminSession are the
  // raw Prisma records (passwordHash / tokenHash included), same as
  // loginAdmin()'s already-safe return shape, not the full row.
  res.status(200).json({
    success: true,
    data: {
      adminUser: { id: req.adminUser!.id, email: req.adminUser!.email, role: req.adminUser!.role },
      adminSession: { id: req.adminSession!.id, expiresAt: req.adminSession!.expiresAt },
    },
  });
});