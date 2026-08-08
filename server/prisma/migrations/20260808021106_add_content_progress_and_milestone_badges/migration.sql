-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "levelsCompletedThreshold" INTEGER;

-- CreateTable
CREATE TABLE "PlayerContentProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerContentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerContentProgress_playerId_idx" ON "PlayerContentProgress"("playerId");

-- CreateIndex
CREATE INDEX "PlayerContentProgress_gameMode_idx" ON "PlayerContentProgress"("gameMode");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerContentProgress_playerId_gameMode_contentId_key" ON "PlayerContentProgress"("playerId", "gameMode", "contentId");

-- AddForeignKey
ALTER TABLE "PlayerContentProgress" ADD CONSTRAINT "PlayerContentProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

