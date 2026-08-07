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
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
});
