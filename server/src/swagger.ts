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
            verseCount: { type: "integer" },
          },
          required: ["playerId", "verseCount"],
        },
        MemoryVerseSessionResponse: {
          type: "object",
          properties: {
            session: { type: "object" },
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
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
});
