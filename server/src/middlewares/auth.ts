import type { NextFunction, Request, Response } from "express";
import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { hashToken } from "../utils/token";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  const adminToken = req.headers["x-admin-token"];

  if (typeof adminToken === "string" && adminToken.length > 0) {
    return adminToken;
  }

  return null;
}

export async function authenticateAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw AppError.unauthorized("Missing admin token");
    }

    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { adminUser: true },
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw AppError.unauthorized("Invalid or expired admin token");
    }

    if (!session.adminUser.isActive) {
      throw AppError.forbidden("Admin account is disabled");
    }

    req.adminUser = session.adminUser;
    req.adminSession = session;
    next();
  } catch (error) {
    next(error);
  }
}

export async function authenticateParent(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw AppError.unauthorized("Missing session token");
    }

    const session = await prisma.parentSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { parentAccount: true },
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw AppError.unauthorized("Invalid or expired session");
    }

    if (!session.parentAccount.isActive) {
      throw AppError.forbidden("Account is disabled");
    }

    req.parentAccount = session.parentAccount;
    req.parentSession = session;
    next();
  } catch (error) {
    next(error);
  }
}