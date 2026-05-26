import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CurrentAffair API",
      version: "1.0.0",
      description: `API for a daily current affairs quiz application.
- Users can take quizzes across 8 categories (Politics, Technology, Business, Sports, Science, World, Entertainment, Health)
- Questions are auto-populated daily from news articles
- Admin panel for reviewing and publishing questions

Base URL: \`http://localhost:3000\``,
      contact: {
        email: "admin@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
    tags: [
      { name: "Categories", description: "Quiz categories" },
      { name: "Questions", description: "Quiz questions" },
      { name: "Quiz", description: "Quiz attempts, history, and stats" },
      { name: "Auth", description: "Authentication (signup)" },
      { name: "Admin", description: "Admin question management" },
      { name: "Admin - Populate", description: "Auto-populate questions from news" },
      { name: "Cron", description: "Scheduled tasks" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
          description: "Session token cookie set by NextAuth.js after login",
        },
      },
      schemas: {
        ApiError: {
          type: "object",
          required: ["error"],
          properties: {
            error: { type: "string", description: "Error message" },
            code: { type: "string", description: "Optional error code", nullable: true },
          },
        },
        Category: {
          type: "object",
          required: ["id", "name", "slug"],
          properties: {
            id: { type: "string", description: "Category ID" },
            name: { type: "string", description: "Display name" },
            slug: { type: "string", description: "URL-friendly slug" },
            icon: { type: "string", nullable: true, description: "Emoji icon" },
            color: { type: "string", nullable: true, description: "Hex color code" },
          },
        },
        Question: {
          type: "object",
          required: ["id", "text", "options", "date", "category"],
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            options: { type: "string", description: "JSON-encoded array of 4 options" },
            correctIndex: { type: "integer" },
            date: { type: "string", format: "date" },
            explanation: { type: "string", nullable: true },
            source: { type: "string", nullable: true },
            category: {
              type: "object",
              properties: {
                name: { type: "string" },
                slug: { type: "string" },
              },
            },
          },
        },
        AdminQuestion: {
          type: "object",
          required: ["id", "text", "options", "date", "status", "category"],
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            options: { type: "string", description: "JSON-encoded array of 4 options" },
            correctIndex: { type: "integer", description: "Index of correct option (0-3)" },
            date: { type: "string", format: "date" },
            status: { type: "string", enum: ["draft", "published"] },
            explanation: { type: "string", nullable: true },
            source: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            category: {
              type: "object",
              properties: {
                name: { type: "string" },
                slug: { type: "string" },
              },
            },
          },
        },
        SignupInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 1, description: "Display name" },
            email: { type: "string", format: "email", description: "Email address" },
            password: { type: "string", minLength: 6, description: "Password (min 6 chars)" },
          },
        },
        SubmitAttemptInput: {
          type: "object",
          required: ["category", "date", "answers"],
          properties: {
            category: { type: "string", description: "Category slug" },
            date: { type: "string", format: "date", description: "Quiz date" },
            answers: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["questionId", "selectedIndex"],
                properties: {
                  questionId: { type: "string" },
                  selectedIndex: { type: "integer", minimum: 0, maximum: 3 },
                },
              },
            },
          },
        },
        CreateQuestionInput: {
          type: "object",
          required: ["categorySlug", "date", "text", "options", "correctIndex"],
          properties: {
            categorySlug: { type: "string" },
            date: { type: "string", format: "date" },
            text: { type: "string", minLength: 1 },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
            },
            correctIndex: { type: "integer", minimum: 0, maximum: 3 },
            explanation: { type: "string" },
            source: { type: "string" },
          },
        },
        QuizResult: {
          type: "object",
          required: ["score", "total", "answers"],
          properties: {
            score: { type: "integer", description: "Number of correct answers" },
            total: { type: "integer", description: "Total questions" },
            answers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionId: { type: "string" },
                  selectedIndex: { type: "integer" },
                  isCorrect: { type: "boolean" },
                },
              },
            },
          },
        },
        AttemptResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            date: { type: "string", format: "date" },
            score: { type: "integer" },
            total: { type: "integer" },
            completedAt: { type: "string", format: "date-time" },
            category: {
              type: "object",
              properties: {
                name: { type: "string" },
                slug: { type: "string" },
              },
            },
          },
        },
        PaginatedAttempts: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/AttemptResponse" },
            },
            total: { type: "integer" },
            page: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        DashboardStats: {
          type: "object",
          properties: {
            totalQuizzes: { type: "integer" },
            totalScore: { type: "integer" },
            totalQuestions: { type: "integer" },
            overallAccuracy: { type: "number" },
            streak: { type: "integer" },
            categoryStats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                  color: { type: "string" },
                  totalScore: { type: "integer" },
                  totalQuestions: { type: "integer" },
                  attempts: { type: "integer" },
                  accuracy: { type: "number" },
                },
              },
            },
            recentAttempts: {
              type: "array",
              items: { $ref: "#/components/schemas/AttemptResponse" },
            },
          },
        },
        PopulateResult: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            date: { type: "string", format: "date" },
            category: { type: "string" },
            totalGenerated: { type: "integer" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  questions: { type: "integer" },
                  errors: { type: "array", items: { type: "string" }, nullable: true },
                },
              },
            },
            errors: { type: "array", items: { type: "string" }, nullable: true },
          },
        },
      },
    },
  },
  apis: ["./src/app/api/**/route.ts"],
};

export function generateSpec() {
  return swaggerJsdoc(options);
}
