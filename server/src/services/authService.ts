import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { createToken, hashToken } from "../utils/token";

export async function loginAdmin(email: string, password: string) {
  const adminUser = await prisma.adminUser.findUnique({ where: { email } });

  if (!adminUser || !adminUser.isActive) {
    throw AppError.unauthorized("Invalid admin credentials");
  }

  if (!verifyPassword(password, adminUser.passwordHash)) {
    throw AppError.unauthorized("Invalid admin credentials");
  }

  const token = createToken();
  const expiresAt = new Date(Date.now() + env.ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      adminUserId: adminUser.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    adminUser: {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    },
  };
}

export async function logoutAdmin(token: string) {
  // Deleting by tokenHash, not id, so this can only ever revoke the exact
  // session the caller actually holds -- there's no way to pass another
  // admin's session id and log them out instead.
  await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function getCurrentAdmin(token: string) {
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

  return session;
}

export async function ensureBootstrapAdmin() {
  if (!env.ADMIN_BOOTSTRAP_EMAIL || !env.ADMIN_BOOTSTRAP_PASSWORD) {
    return null;
  }

  return prisma.adminUser.upsert({
    where: { email: env.ADMIN_BOOTSTRAP_EMAIL },
    create: {
      email: env.ADMIN_BOOTSTRAP_EMAIL,
      passwordHash: hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD),
      role: UserRole.ADMIN,
    },
    update: {
      passwordHash: hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
}