-- CreateTable
CREATE TABLE "WordSearchPuzzle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "words" TEXT[],
    "gridSize" INTEGER NOT NULL DEFAULT 12,
    "categoryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordSearchPuzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleCharacter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clues" TEXT[],
    "imageUrl" TEXT,
    "categoryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleStory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibleStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryEvent" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "correctOrder" INTEGER NOT NULL,

    CONSTRAINT "StoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallengeCompletion" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "challengeDate" DATE NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallengeCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordSearchPuzzle_slug_key" ON "WordSearchPuzzle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BibleCharacter_slug_key" ON "BibleCharacter"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BibleStory_slug_key" ON "BibleStory"("slug");

-- CreateIndex
CREATE INDEX "StoryEvent_storyId_idx" ON "StoryEvent"("storyId");

-- CreateIndex
CREATE INDEX "DailyChallengeCompletion_playerId_idx" ON "DailyChallengeCompletion"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallengeCompletion_playerId_challengeDate_key" ON "DailyChallengeCompletion"("playerId", "challengeDate");

-- AddForeignKey
ALTER TABLE "WordSearchPuzzle" ADD CONSTRAINT "WordSearchPuzzle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleCharacter" ADD CONSTRAINT "BibleCharacter_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleStory" ADD CONSTRAINT "BibleStory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryEvent" ADD CONSTRAINT "StoryEvent_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "BibleStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallengeCompletion" ADD CONSTRAINT "DailyChallengeCompletion_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

