import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Play API",
      version: "1.0.0",
      description: "API for Bible educational game",
    },
    servers: [{ url: "http://localhost:5000/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description:
            "Admin session token from POST /auth/login, or parent session token from POST /parents/login, passed as 'Bearer <token>'.",
        },
      },
      schemas: {
        CreatePlayerRequest: {
          type: "object",
          properties: {
            nickname: { type: "string" },
            avatarSlug: { type: ["string", "null"] },
          },
          required: ["nickname"],
        },
        PlayerProfile: {
          type: "object",
          properties: {
            id: { type: "string" },
            nickname: { type: "string" },
            avatarSlug: { type: ["string", "null"] },
            xp: { type: "number" },
            level: { type: "number" },
            stars: { type: "number" },
            streakDays: { type: "number" },
          },
          required: ["id", "nickname"],
        },
        PlayerProgress: {
          type: "object",
          properties: {
            player: { $ref: "#/components/schemas/PlayerProfile" },
            computed: {
              type: "object",
              properties: {
                level: { type: "number" },
                stars: { type: "number" },
                streakDays: { type: "number" },
              },
            },
          },
        },
        QuizSessionStartRequest: {
          type: "object",
          properties: {
            playerId: { type: "string" },
            categorySlug: { type: ["string", "null"] },
            difficultySlug: { type: ["string", "null"] },
            questionCount: { type: "integer" },
          },
          required: ["playerId", "questionCount"],
        },
        QuizSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  slug: { type: "string" },
                  prompt: { type: "string" },
                  explanation: { type: "string" },
                  scriptureReference: { type: "string" },
                  imageUrl: { type: ["string", "null"] },
                  imageAlt: { type: ["string", "null"] },
                  xpReward: { type: "number" },
                  category: { type: "object" },
                  difficulty: { type: "object" },
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        text: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        QuizAnswerRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            questionId: { type: "string" },
            selectedText: { type: "string" },
          },
          required: ["sessionId", "questionId", "selectedText"],
        },
        QuizAnswerResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            answer: { type: "object" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                xpAwarded: { type: "number" },
                starsAwarded: { type: "number" },
                correctText: { type: ["string", "null"] },
                isComplete: { type: "boolean" },
              },
            },
          },
        },
        MemoryVerseSessionStartRequest: {
          type: "object",
          properties: {
            playerId: { type: "string" },
            categorySlug: { type: ["string", "null"] },
            difficultySlug: { type: ["string", "null"] },
            verseCount: { type: "integer", description: "Optional override; defaults to 20 (this player's current level's full round)." },
          },
          required: ["playerId"],
        },
        MemoryVerseSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            level: { type: "integer", description: "This player's current Memory Verse level (1-10)." },
            verses: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
        MemoryVerseAnswerRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            verseId: { type: "string" },
            submittedText: { type: "string" },
          },
          required: ["sessionId", "verseId", "submittedText"],
        },
        MemoryVerseAnswerResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            answer: { type: "object" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                xpAwarded: { type: "number" },
                starsAwarded: { type: "number" },
                isComplete: { type: "boolean" },
              },
            },
          },
        },
        Level: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            name: { type: "string" },
            description: { type: ["string", "null"] },
            levelNumber: { type: "number" },
            totalQuestions: { type: "number" },
            isReady: { type: "boolean" },
            isUnlocked: { type: "boolean" },
            isCompleted: { type: "boolean" },
            bestScore: { type: "number" },
            attempts: { type: "number" },
          },
        },
        LevelSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            level: {
              type: "object",
              properties: { slug: { type: "string" }, name: { type: "string" } },
            },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  slug: { type: "string" },
                  prompt: { type: "string" },
                  explanation: { type: ["string", "null"] },
                  scriptureReference: { type: ["string", "null"] },
                  options: {
                    type: "array",
                    items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" } } },
                  },
                },
              },
            },
          },
        },
        LevelHintResponse: {
          type: "object",
          properties: {
            hintNumber: { type: "number" },
            eliminatedOptionId: { type: "string" },
            eliminatedOptionText: { type: "string" },
            hintsRemaining: { type: "number" },
            maxPointsIfCorrect: { type: "number" },
          },
        },
        LevelAnswerResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            answer: { type: "object" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                pointsEarned: { type: "number" },
                hintsUsed: { type: "number" },
                starsAwarded: { type: "number" },
                correctText: { type: ["string", "null"] },
                isComplete: { type: "boolean" },
                nextLevelSlug: { type: ["string", "null"] },
              },
            },
          },
        },

        // Match the Verse
        VerseMatchSessionRequest: {
          type: "object",
          properties: { playerId: { type: "string" }, pairCount: { type: "integer" } },
          required: ["playerId"],
        },
        VerseMatchCard: {
          type: "object",
          properties: {
            cardId: { type: "string" },
            verseId: { type: "string" },
            type: { type: "string", enum: ["reference", "text"] },
            content: { type: "string" },
          },
        },
        VerseMatchSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            level: { type: "number" },
            pairCount: { type: "number" },
            cards: { type: "array", items: { $ref: "#/components/schemas/VerseMatchCard" } },
          },
        },
        VerseMatchCompleteRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            matchesFound: { type: "integer" },
            mistakeCount: { type: "integer" },
          },
          required: ["sessionId", "matchesFound", "mistakeCount"],
        },
        VerseMatchCompleteResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                matchesFound: { type: "number" },
                xpAwarded: { type: "number" },
                starsAwarded: { type: "number" },
                isPerfect: { type: "boolean" },
              },
            },
          },
        },

        // Flash Cards
        FlashCardSessionRequest: {
          type: "object",
          properties: { playerId: { type: "string" }, deckSize: { type: "integer" } },
          required: ["playerId"],
        },
        FlashCard: {
          type: "object",
          properties: {
            id: { type: "string" },
            reference: { type: "string" },
            text: { type: "string" },
            memoryHint: { type: ["string", "null"] },
          },
        },
        FlashCardSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            level: { type: "number" },
            cards: { type: "array", items: { $ref: "#/components/schemas/FlashCard" } },
          },
        },
        FlashCardCompleteRequest: {
          type: "object",
          properties: { sessionId: { type: "string" }, knewCount: { type: "integer" } },
          required: ["sessionId", "knewCount"],
        },
        FlashCardCompleteResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: { knewCount: { type: "number" }, xpAwarded: { type: "number" }, starsAwarded: { type: "number" } },
            },
          },
        },

        // Scripture Puzzle
        ScripturePuzzleSessionRequest: {
          type: "object",
          properties: { playerId: { type: "string" } },
          required: ["playerId"],
        },
        ScripturePuzzleSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            verse: {
              type: "object",
              properties: { id: { type: "string" }, reference: { type: "string" } },
            },
            scrambledWords: { type: "array", items: { type: "string" } },
          },
        },
        ScripturePuzzleHintRequest: {
          type: "object",
          properties: { sessionId: { type: "string" }, verseId: { type: "string" } },
          required: ["sessionId", "verseId"],
        },
        ScripturePuzzleHintResponse: {
          type: "object",
          properties: {
            hintNumber: { type: "number" },
            revealedPosition: { type: "number" },
            revealedWord: { type: ["string", "null"] },
            hintsRemaining: { type: "number" },
            maxPointsIfCorrect: { type: "number" },
          },
        },
        ScripturePuzzleAnswerRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            verseId: { type: "string" },
            orderedWords: { type: "array", items: { type: "string" } },
          },
          required: ["sessionId", "verseId", "orderedWords"],
        },
        ScripturePuzzleAnswerResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                pointsEarned: { type: "number" },
                hintsUsed: { type: "number" },
                correctText: { type: ["string", "null"] },
                isComplete: { type: "boolean" },
              },
            },
          },
        },

        // Character Guessing Game
        CharacterGuessSessionRequest: {
          type: "object",
          properties: { playerId: { type: "string" }, roundCount: { type: "integer" } },
          required: ["playerId"],
        },
        CharacterRound: {
          type: "object",
          properties: {
            characterId: { type: "string" },
            firstClue: { type: "string" },
            imageUrl: { type: ["string", "null"] },
          },
        },
        CharacterGuessSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            rounds: { type: "array", items: { $ref: "#/components/schemas/CharacterRound" } },
          },
        },
        CharacterHintRequest: {
          type: "object",
          properties: { sessionId: { type: "string" }, characterId: { type: "string" } },
          required: ["sessionId", "characterId"],
        },
        CharacterHintResponse: {
          type: "object",
          properties: {
            hintNumber: { type: "number" },
            clue: { type: ["string", "null"] },
            hintsRemaining: { type: "number" },
            maxPointsIfCorrect: { type: "number" },
          },
        },
        CharacterGuessAnswerRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            characterId: { type: "string" },
            guess: { type: "string" },
          },
          required: ["sessionId", "characterId", "guess"],
        },
        CharacterGuessAnswerResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                pointsEarned: { type: "number" },
                hintsUsed: { type: "number" },
                correctName: { type: "string" },
                isComplete: { type: "boolean" },
              },
            },
          },
        },

        // Bible Story Challenge
        StoryOrderSessionRequest: {
          type: "object",
          properties: { playerId: { type: "string" } },
          required: ["playerId"],
        },
        StoryEventCard: {
          type: "object",
          properties: { id: { type: "string" }, text: { type: "string" } },
        },
        StoryOrderSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            story: {
              type: "object",
              properties: { id: { type: "string" }, title: { type: "string" } },
            },
            shuffledEvents: { type: "array", items: { $ref: "#/components/schemas/StoryEventCard" } },
          },
        },
        StoryOrderAnswerRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            storyId: { type: "string" },
            orderedEventIds: { type: "array", items: { type: "string" } },
          },
          required: ["sessionId", "storyId", "orderedEventIds"],
        },
        StoryOrderAnswerResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                pointsEarned: { type: "number" },
                correctOrderIds: { type: "array", items: { type: "string" } },
                isComplete: { type: "boolean" },
              },
            },
          },
        },

        // Word Search
        WordSearchSessionRequest: {
          type: "object",
          properties: { playerId: { type: "string" }, puzzleSlug: { type: "string" } },
          required: ["playerId"],
        },
        WordSearchSessionResponse: {
          type: "object",
          properties: {
            session: {
              type: "object",
              properties: { id: { type: "string" }, totalQuestions: { type: "number" } },
            },
            puzzle: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                gridSize: { type: "number" },
                words: { type: "array", items: { type: "string" } },
              },
            },
            grid: {
              type: "array",
              items: { type: "array", items: { type: "string" } },
              description: "2D letter grid, gridSize x gridSize",
            },
          },
        },
        WordSearchFoundRequest: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            word: { type: "string" },
            path: {
              type: "array",
              description: "Ordered list of grid cells the player traced, first to last letter",
              items: {
                type: "object",
                properties: { row: { type: "integer" }, col: { type: "integer" } },
              },
            },
          },
          required: ["sessionId", "word", "path"],
        },
        WordSearchFoundResponse: {
          type: "object",
          properties: {
            isCorrect: { type: "boolean" },
            pointsEarned: { type: "number" },
            wordsFound: { type: "number" },
            totalWords: { type: "number" },
            isComplete: { type: "boolean" },
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
          },
        },

        // Daily Bible Challenge
        DailyChallengeQuestion: {
          type: "object",
          properties: {
            id: { type: "string" },
            prompt: { type: "string" },
            scriptureReference: { type: ["string", "null"] },
            category: { type: ["string", "null"] },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: { id: { type: "string" }, text: { type: "string" } },
              },
            },
          },
        },
        DailyChallengeResponse: {
          type: "object",
          description: "If alreadyCompleted is true, isCorrect/xpAwarded reflect today's earlier attempt instead of a fresh question.",
          properties: {
            alreadyCompleted: { type: "boolean" },
            isCorrect: { type: "boolean" },
            xpAwarded: { type: "number" },
            question: { $ref: "#/components/schemas/DailyChallengeQuestion" },
          },
        },
        DailyChallengeAnswerRequest: {
          type: "object",
          properties: {
            playerId: { type: "string" },
            questionId: { type: "string" },
            selectedText: { type: "string" },
          },
          required: ["playerId", "questionId", "selectedText"],
        },
        DailyChallengeAnswerResponse: {
          type: "object",
          properties: {
            player: { $ref: "#/components/schemas/PlayerProfile" },
            rewards: { type: "object" },
            result: {
              type: "object",
              properties: {
                isCorrect: { type: "boolean" },
                xpAwarded: { type: "number" },
                correctText: { type: ["string", "null"] },
              },
            },
          },
        },

        // Admin auth
        AdminLoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
          required: ["email", "password"],
        },
        AdminUser: {
          type: "object",
          description: "Safe subset only -- never includes passwordHash.",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "EDITOR"] },
          },
        },
        AdminLoginResponse: {
          type: "object",
          properties: {
            token: { type: "string", description: "Pass as 'Authorization: Bearer <token>' on subsequent admin requests." },
            expiresAt: { type: "string", format: "date-time" },
            adminUser: { $ref: "#/components/schemas/AdminUser" },
          },
        },
        AdminMeResponse: {
          type: "object",
          properties: {
            adminUser: { $ref: "#/components/schemas/AdminUser" },
            adminSession: {
              type: "object",
              description: "Safe subset only -- never includes tokenHash.",
              properties: {
                id: { type: "string" },
                expiresAt: { type: "string", format: "date-time" },
              },
            },
          },
        },

        // Parent (family) accounts
        ParentSignupRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            claimPlayerId: {
              type: "string",
              description: "Optional existing guest player id to link onto this new account, preserving its XP/progress.",
            },
          },
          required: ["email", "password"],
        },
        ParentLoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
          required: ["email", "password"],
        },
        ParentSummary: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ParentAuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", description: "Pass as 'Authorization: Bearer <token>' on subsequent parent requests." },
            expiresAt: { type: "string", format: "date-time" },
            parent: { $ref: "#/components/schemas/ParentSummary" },
          },
        },
        ChildProfile: {
          type: "object",
          properties: {
            id: { type: "string" },
            nickname: { type: "string" },
            avatarSlug: { type: ["string", "null"] },
            xp: { type: "number" },
            level: { type: "number" },
            stars: { type: "number" },
            streakDays: { type: "number" },
          },
        },
        ParentMeResponse: {
          type: "object",
          properties: {
            parent: {
              type: "object",
              properties: { id: { type: "string" }, email: { type: "string" } },
            },
            children: { type: "array", items: { $ref: "#/components/schemas/ChildProfile" } },
          },
        },
        AddChildRequest: {
          type: "object",
          properties: {
            nickname: { type: "string", minLength: 2, maxLength: 40 },
            avatarSlug: { type: ["string", "null"] },
          },
          required: ["nickname"],
        },
        ClaimChildRequest: {
          type: "object",
          description: "Links an existing guest player profile (no account yet) onto the authenticated parent account.",
          properties: {
            playerId: { type: "string" },
          },
          required: ["playerId"],
        },

        // Admin content management -- shared paging shape across every
        // list endpoint below: { items, page, limit, total, totalPages }.
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            name: { type: "string" },
            description: { type: ["string", "null"] },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CategoryCreateRequest: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2, maxLength: 120 },
            slug: { type: "string", minLength: 2, maxLength: 140, description: "Auto-generated from name if omitted." },
            description: { type: ["string", "null"], maxLength: 500 },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
          },
          required: ["name"],
        },
        CategoryUpdateRequest: {
          type: "object",
          description: "Same fields as CategoryCreateRequest, all optional -- only fields provided are changed.",
          properties: {
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: ["string", "null"] },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
          },
        },
        PagedCategoriesResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Category" } },
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
        DifficultyLevel: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            name: { type: "string" },
            description: { type: ["string", "null"] },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DifficultyCreateRequest: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2, maxLength: 120 },
            slug: { type: "string", description: "Auto-generated from name if omitted." },
            description: { type: ["string", "null"] },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
          },
          required: ["name"],
        },
        DifficultyUpdateRequest: {
          type: "object",
          description: "Same fields as DifficultyCreateRequest, all optional.",
          properties: {
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: ["string", "null"] },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
          },
        },
        PagedDifficultiesResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/DifficultyLevel" } },
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
        MediaAsset: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            name: { type: ["string", "null"] },
            url: { type: "string" },
            kind: { type: "string" },
            altText: { type: ["string", "null"] },
            mimeType: { type: ["string", "null"] },
            source: { type: ["string", "null"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MediaCreateRequest: {
          type: "object",
          properties: {
            name: { type: ["string", "null"] },
            slug: { type: "string", description: "Auto-generated from name/url if omitted." },
            url: { type: "string" },
            kind: { type: "string", description: "Defaults to 'image'." },
            altText: { type: ["string", "null"] },
            mimeType: { type: ["string", "null"] },
            source: { type: ["string", "null"] },
          },
          required: ["url"],
        },
        MediaUpdateRequest: {
          type: "object",
          description: "Same fields as MediaCreateRequest, all optional.",
          properties: {
            name: { type: ["string", "null"] },
            slug: { type: "string" },
            url: { type: "string" },
            kind: { type: "string" },
            altText: { type: ["string", "null"] },
            mimeType: { type: ["string", "null"] },
            source: { type: ["string", "null"] },
          },
        },
        PagedMediaAssetsResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/MediaAsset" } },
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
        AdminQuizOption: {
          type: "object",
          description: "Unlike the player-facing quiz option shape, this includes isCorrect.",
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            isCorrect: { type: "boolean" },
            sortOrder: { type: "number" },
          },
        },
        AdminQuizQuestion: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            categoryId: { type: ["string", "null"] },
            difficultyId: { type: ["string", "null"] },
            prompt: { type: "string" },
            explanation: { type: ["string", "null"] },
            scriptureReference: { type: ["string", "null"] },
            imageUrl: { type: ["string", "null"] },
            imageAlt: { type: ["string", "null"] },
            xpReward: { type: "number" },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
            options: { type: "array", items: { $ref: "#/components/schemas/AdminQuizOption" } },
            category: { $ref: "#/components/schemas/Category" },
            difficulty: { $ref: "#/components/schemas/DifficultyLevel" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        QuestionCreateRequest: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Auto-generated from prompt if omitted." },
            categoryId: { type: ["string", "null"] },
            difficultyId: { type: ["string", "null"] },
            prompt: { type: "string", minLength: 5, maxLength: 500 },
            explanation: { type: ["string", "null"], maxLength: 1000 },
            scriptureReference: { type: ["string", "null"] },
            imageUrl: { type: ["string", "null"] },
            imageAlt: { type: ["string", "null"] },
            xpReward: { type: "number", description: "Defaults to 10." },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
            options: {
              type: "array",
              minItems: 2,
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  isCorrect: { type: "boolean" },
                  sortOrder: { type: "number" },
                },
                required: ["text"],
              },
            },
          },
          required: ["prompt", "options"],
        },
        QuestionUpdateRequest: {
          type: "object",
          description: "Same fields as QuestionCreateRequest, all optional -- options, if provided, fully replace the existing set.",
          properties: {
            slug: { type: "string" },
            categoryId: { type: ["string", "null"] },
            difficultyId: { type: ["string", "null"] },
            prompt: { type: "string" },
            explanation: { type: ["string", "null"] },
            scriptureReference: { type: ["string", "null"] },
            imageUrl: { type: ["string", "null"] },
            imageAlt: { type: ["string", "null"] },
            xpReward: { type: "number" },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
            options: {
              type: "array",
              minItems: 2,
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  isCorrect: { type: "boolean" },
                  sortOrder: { type: "number" },
                },
              },
            },
          },
        },
        PagedQuestionsResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/AdminQuizQuestion" } },
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
        AdminBibleVerse: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            categoryId: { type: ["string", "null"] },
            difficultyId: { type: ["string", "null"] },
            reference: { type: "string" },
            text: { type: "string" },
            translation: { type: ["string", "null"] },
            memoryHint: { type: ["string", "null"] },
            imageUrl: { type: ["string", "null"] },
            imageAlt: { type: ["string", "null"] },
            xpReward: { type: "number" },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
            category: { $ref: "#/components/schemas/Category" },
            difficulty: { $ref: "#/components/schemas/DifficultyLevel" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        VerseCreateRequest: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Auto-generated from reference if omitted." },
            categoryId: { type: ["string", "null"] },
            difficultyId: { type: ["string", "null"] },
            reference: { type: "string", minLength: 2, maxLength: 200 },
            text: { type: "string", minLength: 5, maxLength: 4000 },
            translation: { type: ["string", "null"] },
            memoryHint: { type: ["string", "null"] },
            imageUrl: { type: ["string", "null"] },
            imageAlt: { type: ["string", "null"] },
            xpReward: { type: "number", description: "Defaults to 8." },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
          },
          required: ["reference", "text"],
        },
        VerseUpdateRequest: {
          type: "object",
          description: "Same fields as VerseCreateRequest, all optional.",
          properties: {
            slug: { type: "string" },
            categoryId: { type: ["string", "null"] },
            difficultyId: { type: ["string", "null"] },
            reference: { type: "string" },
            text: { type: "string" },
            translation: { type: ["string", "null"] },
            memoryHint: { type: ["string", "null"] },
            imageUrl: { type: ["string", "null"] },
            imageAlt: { type: ["string", "null"] },
            xpReward: { type: "number" },
            sortOrder: { type: "number" },
            isActive: { type: "boolean" },
          },
        },
        PagedVersesResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/AdminBibleVerse" } },
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
        ImportContentRequest: {
          type: "object",
          description: "Bulk JSON content import, upsert-based (safe to re-run). Each array is optional and defaults to empty.",
          properties: {
            sourceName: { type: "string", minLength: 2, maxLength: 140 },
            replaceExisting: { type: "boolean" },
            categories: { type: "array", items: { $ref: "#/components/schemas/CategoryCreateRequest" } },
            difficulties: { type: "array", items: { $ref: "#/components/schemas/DifficultyCreateRequest" } },
            mediaAssets: { type: "array", items: { $ref: "#/components/schemas/MediaCreateRequest" } },
            quizQuestions: { type: "array", items: { $ref: "#/components/schemas/QuestionCreateRequest" } },
            verses: { type: "array", items: { $ref: "#/components/schemas/VerseCreateRequest" } },
          },
          required: ["sourceName"],
        },
        ImportContentResponse: {
          type: "object",
          properties: {
            jobId: { type: "string" },
            categories: { type: "number" },
            difficulties: { type: "number" },
            mediaAssets: { type: "number" },
            quizQuestions: { type: "number" },
            verses: { type: "number" },
            wordSearchPuzzles: { type: "number" },
            characters: { type: "number" },
            stories: { type: "number" },
            badges: { type: "number" },
          },
        },
        ImportJob: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            status: { type: "string", enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] },
            sourceName: { type: "string" },
            totalRecords: { type: "number" },
            processedRecords: { type: "number" },
            failedRecords: { type: "number" },
            errorMessage: { type: ["string", "null"] },
            startedAt: { type: ["string", "null"], format: "date-time" },
            completedAt: { type: ["string", "null"], format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PagedImportJobsResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/ImportJob" } },
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
});
