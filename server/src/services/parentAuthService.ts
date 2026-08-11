import { env } from "../config/env";
import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { createToken, hashToken } from "../utils/token";

const CHILD_SELECT = {
  id: true,
  nickname: true,
  avatarSlug: true,
  xp: true,
  level: true,
  stars: true,
  streakDays: true,
} as const;

async function createSession(parentAccountId: string) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + env.PARENT_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.parentSession.create({
    data: { parentAccountId, tokenHash: hashToken(token), expiresAt },
  });

  return { token, expiresAt };
}

function serializeParent(parent: { id: string; email: string; createdAt: Date }) {
  return { id: parent.id, email: parent.email, createdAt: parent.createdAt };
}

// Signing up links an existing guest profile onto the new account when one is
// passed in (claimPlayerId), instead of always starting a child profile from
// zero -- so XP/streaks earned before signing up aren't lost.
export async function signupParent(email: string, password: string, claimPlayerId?: string | null) {
  const existing = await prisma.parentAccount.findUnique({ where: { email } });

  if (existing) {
    throw AppError.conflict("An account with this email already exists");
  }

  const parent = await prisma.parentAccount.create({
    data: { email, passwordHash: hashPassword(password) },
  });

  if (claimPlayerId) {
    await claimGuestProfile(parent.id, claimPlayerId).catch(() => {
      // Claiming is best-effort during signup: a bad/foreign/already-claimed
      // guest id shouldn't block account creation itself.
    });
  }

  const session = await createSession(parent.id);

  return { ...session, parent: serializeParent(parent) };
}

export async function loginParent(email: string, password: string) {
  const parent = await prisma.parentAccount.findUnique({ where: { email } });

  if (!parent || !parent.isActive) {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (!verifyPassword(password, parent.passwordHash)) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const session = await createSession(parent.id);

  return { ...session, parent: serializeParent(parent) };
}

export async function logoutParent(token: string) {
  // Deleting by tokenHash, not id, so this can only ever revoke the exact
  // session the caller actually holds.
  await prisma.parentSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function getCurrentParentSession(token: string) {
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

  return session;
}

export async function listChildren(parentAccountId: string) {
  return prisma.playerProfile.findMany({
    where: { parentAccountId },
    select: CHILD_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

export async function addChildProfile(parentAccountId: string, nickname: string, avatarSlug?: string | null) {
  const existing = await prisma.playerProfile.findUnique({ where: { nickname } });

  if (existing) {
    throw AppError.conflict("That nickname is already taken");
  }

  return prisma.playerProfile.create({
    data: { nickname, avatarSlug: avatarSlug ?? null, parentAccountId },
    select: CHILD_SELECT,
  });
}

// Links an existing guest profile (no account yet) to this parent account,
// preserving whatever XP/streaks/progress it already has. Idempotent if the
// same parent claims twice; rejected if another account already claimed it.
export async function claimGuestProfile(parentAccountId: string, playerId: string) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  if (player.parentAccountId && player.parentAccountId !== parentAccountId) {
    throw AppError.conflict("This player is already linked to another account");
  }

  if (player.parentAccountId === parentAccountId) {
    return player;
  }

  return prisma.playerProfile.update({
    where: { id: playerId },
    data: { parentAccountId },
    select: CHILD_SELECT,
  });
}
