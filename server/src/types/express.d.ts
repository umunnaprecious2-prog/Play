import type { AdminSession, AdminUser, ParentAccount, ParentSession } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
      adminSession?: AdminSession;
      parentAccount?: ParentAccount;
      parentSession?: ParentSession;
    }
  }
}

export {};