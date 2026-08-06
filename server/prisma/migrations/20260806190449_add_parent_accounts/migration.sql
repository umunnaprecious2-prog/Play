-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "parentAccountId" TEXT;

-- CreateTable
CREATE TABLE "ParentAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentSession" (
    "id" TEXT NOT NULL,
    "parentAccountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentAccount_email_key" ON "ParentAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ParentSession_tokenHash_key" ON "ParentSession"("tokenHash");

-- CreateIndex
CREATE INDEX "ParentSession_parentAccountId_idx" ON "ParentSession"("parentAccountId");

-- CreateIndex
CREATE INDEX "ParentSession_expiresAt_idx" ON "ParentSession"("expiresAt");

-- CreateIndex
CREATE INDEX "PlayerProfile_parentAccountId_idx" ON "PlayerProfile"("parentAccountId");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "ParentAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentSession" ADD CONSTRAINT "ParentSession_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "ParentAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
