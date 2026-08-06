-- CreateTable
CREATE TABLE "GameSessionHint" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "hintNumber" INTEGER NOT NULL,
    "eliminatedOptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSessionHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLevelProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerLevelProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSessionHint_sessionId_idx" ON "GameSessionHint"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionHint_questionId_idx" ON "GameSessionHint"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionHint_sessionId_questionId_hintNumber_key" ON "GameSessionHint"("sessionId", "questionId", "hintNumber");

-- CreateIndex
CREATE INDEX "PlayerLevelProgress_playerId_idx" ON "PlayerLevelProgress"("playerId");

-- CreateIndex
CREATE INDEX "PlayerLevelProgress_categoryId_idx" ON "PlayerLevelProgress"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLevelProgress_playerId_categoryId_key" ON "PlayerLevelProgress"("playerId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_nickname_key" ON "PlayerProfile"("nickname");

-- AddForeignKey
ALTER TABLE "GameSessionHint" ADD CONSTRAINT "GameSessionHint_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLevelProgress" ADD CONSTRAINT "PlayerLevelProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLevelProgress" ADD CONSTRAINT "PlayerLevelProgress_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

