# CurrentAffair — MVP High-Level Plan

> **Project**: Daily Current Affairs Quiz  
> **Stack**: Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL + Tailwind CSS  
> **Status**: Planning Phase

---

## 1. Product Vision

A daily quiz app that auto-generates current affairs questions from news across major categories. Users log in, play date-wise quizzes by category, and track their performance over time.

---

## 2. MVP Features (In Scope)

### 2.1 Authentication
- Email/password signup & login via NextAuth.js
- Google OAuth login
- Session management with JWT
- Protected routes (redirect to login if unauthenticated)

### 2.2 Categories
- 8 major news categories:
  - Politics
  - Technology
  - Business & Economy
  - Sports
  - Science & Environment
  - World / International
  - Entertainment
  - Health
- Each category has a name, slug, icon, and color

### 2.3 Quiz Play
- Select a category to see available quiz dates
- Play quiz for a specific date + category
- Each quiz has 5–10 multiple-choice questions
- Single attempt per category per day
- Submit all answers at once → instant score
- Correct answer + explanation revealed after submission

### 2.4 Daily Auto-Population
- Scheduled job runs daily (Vercel Cron or GitHub Actions)
- Fetches top news from NewsAPI (or similar)
- Sends headlines to LLM (GPT-4 / Claude) for question generation
- Stores questions in DB with date + category mapping
- Admin can review/edit before publishing (optional gate)

### 2.5 Performance Tracking
- Dashboard with:
  - Overall accuracy % across all attempts
  - Category-wise accuracy breakdown (bar chart)
  - Daily streak counter
  - Recent attempts timeline
- History page with all past attempts, filterable by category

### 2.6 Admin Panel
- CRUD for questions (create, edit, delete)
- CRUD for categories
- View all questions by date/category
- Manual question creation form

---

## 3. Out of Scope (Post-MVP)

- Leaderboards / competitive play
- Spaced-repetition review of missed questions
- Push notifications
- Mobile apps (PWA only for MVP)
- Social sharing
- Multi-language support
- Payment / subscriptions

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    Browser                        │
├─────────────────────────────────────────────────┤
│  Next.js 15 (App Router)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Pages    │  │ API Routes│  │ Server Actions│ │
│  │ (RSC)    │  │ /api/*   │  │              │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────┐  │
│  │         NextAuth.js (Auth)               │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  Prisma ORM                                      │
├─────────────────────────────────────────────────┤
│  PostgreSQL                                      │
└─────────────────────────────────────────────────┘
         ▲
         │ (Vercel Cron / GH Actions)
         ▼
┌─────────────────────────────────────────────────┐
│  NewsAPI → LLM → Question Generator              │
└─────────────────────────────────────────────────┘
```

---

## 5. Data Model

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ id               │
│ name             │
│ email (unique)   │
│ image            │
│ createdAt        │
└────────┬─────────┘
         │ 1
         │
         │ *
┌────────┴─────────┐     ┌──────────────────┐
│   QuizAttempt    │     │     Category     │
├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │
│ userId           │──┐  │ name             │
│ categoryId       │──┼──│ slug (unique)    │
│ date             │  │  │ icon             │
│ score            │  │  │ color            │
│ total            │  │  └────────┬─────────┘
│ completedAt      │  │           │ 1
└────────┬─────────┘  │           │
         │ 1          │           │ *
         │            │  ┌────────┴─────────┐
         │ *          │  │    Question      │
┌────────┴─────────┐  │  ├──────────────────┤
│      Answer      │  │  │ id               │
├──────────────────┤  │  │ categoryId       │──┘
│ id               │  │  │ date             │
│ attemptId        │──┘  │ text             │
│ questionId       │──┐  │ options (JSON)   │
│ selectedIndex    │  │  │ correctIndex     │
│ isCorrect        │  │  │ explanation      │
└──────────────────┘  │  │ source           │
                      │  │ createdAt        │
                      │  └──────────────────┘
                      │
                      └── UNIQUE (categoryId, date)
```

---

## 6. Route Map

### Pages (Frontend)
| Path | Auth? | Description |
|------|-------|-------------|
| `/` | No | Home — list categories with today's quiz status |
| `/auth/login` | No | Login form |
| `/auth/signup` | No | Signup form |
| `/quiz/[category]` | Yes | Play today's quiz for a category |
| `/quiz/[category]?date=YYYY-MM-DD` | Yes | Play quiz for a specific date |
| `/dashboard` | Yes | Performance charts & stats |
| `/history` | Yes | Past attempts list, filterable |
| `/admin` | Yes (admin) | Admin dashboard |
| `/admin/questions` | Yes (admin) | Manage questions |
| `/admin/categories` | Yes (admin) | Manage categories |

### API Routes
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/*` | * | Mixed | NextAuth.js endpoints |
| `/api/categories` | GET | No | List all categories |
| `/api/questions?category&date` | GET | Yes | Get questions for quiz |
| `/api/quiz/attempt` | POST | Yes | Submit quiz attempt |
| `/api/quiz/history?category&page` | GET | Yes | User's past attempts |
| `/api/quiz/stats` | GET | Yes | Aggregate performance data |
| `/api/admin/questions` | GET/POST | Admin | List / create questions |
| `/api/admin/questions/[id]` | PUT/DELETE | Admin | Update / delete question |
| `/api/admin/categories` | GET/POST | Admin | List / create categories |
| `/api/admin/categories/[id]` | PUT/DELETE | Admin | Update / delete category |

---

## 7. Component Tree

```
<RootLayout>
  <AuthProvider>
    <Navbar />           ← user menu, logout, nav links
    <main>
      │
      ├─ HomePage
      │   ├─ HeroSection
      │   └─ CategoryGrid
      │       └─ CategoryCard (icon, name, "Play Today" / "Coming Soon")
      │
      ├─ QuizPage
      │   ├─ QuizHeader (category, date, progress bar)
      │   ├─ QuestionCard
      │   │   ├─ QuestionText
      │   │   └─ OptionList
      │   │       └─ OptionItem (radio/click)
      │   ├─ NavigationBar (prev / next)
      │   └─ SubmitButton → ScoreReveal
      │       ├─ ScoreBadge
      │       ├─ AnswerReview (per question: correct/incorrect + explanation)
      │       └─ ActionButtons (retry / dashboard / home)
      │
      ├─ DashboardPage
      │   ├─ StatsOverview (total quizzes, avg accuracy, streak)
      │   ├─ AccuracyChart (recharts bar chart per category)
      │   ├─ StreakCalendar (heatmap-style)
      │   └─ RecentAttempts (last 5)
      │
      ├─ HistoryPage
      │   ├─ Filters (category, date range)
      │   └─ AttemptList
      │       └─ AttemptRow (date, category, score/total, link to review)
      │
      └─ AdminPage
          ├─ QuestionManager (table + create/edit modal)
          └─ CategoryManager (table + inline edit)
    </main>
    <Footer />
  </AuthProvider>
</RootLayout>
```

---

## 8. Data Flow

### 8.1 Daily Auto-Population
```
[Cron: 6:00 AM daily]
   │
   ├─ 1. Fetch today's headlines from NewsAPI (top-headlines?country=in)
   │
   ├─ 2. Group articles by category (use article source/category mapping)
   │
   ├─ 3. For each category, send top 3-5 headlines to LLM:
   │      "Generate 2-3 MCQ questions from these news articles.
   │       Return JSON: [{ question, options[], correctIndex, explanation }]"
   │
   └─ 4. Store generated questions in DB with today's date + categoryId
```

### 8.2 User Plays Quiz
```
[User selects category → clicks "Play Today"]
   │
   ├─ 1. GET /api/questions?category=politics&date=2026-05-26
   │
   ├─ 2. Render QuestionCard for each question
   │
   ├─ 3. User selects answers → clicks "Submit"
   │
   ├─ 4. POST /api/quiz/attempt { category, date, answers: [{ questionId, selectedIndex }] }
   │      ├─ Server validates no duplicate attempt
   │      ├─ Calculates score
   │      └─ Stores QuizAttempt + Answer records
   │
   └─ 5. Show ScoreReveal with answer review
```

### 8.3 Performance Dashboard
```
[Dashboard page loads]
   │
   ├─ 1. GET /api/quiz/stats
   │      ├─ Aggregates all user's QuizAttempt rows
   │      ├─ Computes per-category accuracy
   │      └─ Computes streak (consecutive days with attempts)
   │
   ├─ 2. GET /api/quiz/history?limit=5
   │      └─ Last 5 attempts for "Recent" section
   │
   └─ 3. Render charts + stats
```

---

## 9. Build Phases

### Phase 1 — Foundation (Days 1–2)
- [ ] Install & configure Tailwind CSS
- [ ] Set up Prisma schema + migration
- [ ] Set up NextAuth.js (credentials + Google)
- [ ] Create auth pages (login / signup)
- [ ] Create layout with Navbar + session handling
- [ ] Seed DB with 8 categories

### Phase 2 — Core Quiz Flow (Days 3–4)
- [ ] Admin: category CRUD
- [ ] Admin: question CRUD (manual entry)
- [ ] API: GET /api/questions with category+date filter
- [ ] UI: Home page with CategoryGrid
- [ ] UI: Quiz page (QuestionCard, navigation, submit)
- [ ] API: POST /api/quiz/attempt
- [ ] UI: Score reveal + answer review

### Phase 3 — Tracking (Day 5)
- [ ] API: GET /api/quiz/history
- [ ] API: GET /api/quiz/stats
- [ ] UI: History page with filters
- [ ] UI: Dashboard page (accuracy chart, streaks, stats)
- [ ] Install recharts, build charts

### Phase 4 — Auto-Population (Days 6–7)
- [ ] Set up NewsAPI integration
- [ ] Build LLM prompt + question generation function
- [ ] Create internal API endpoint to trigger generation
- [ ] Set up Vercel Cron Job (daily at 6 AM)
- [ ] Add admin review gate (optional: auto-publish vs draft)

### Phase 5 — Polish & Edge Cases (Day 8)
- [ ] Loading states (skeletons / spinners)
- [ ] Empty states ("No quiz yet for this date")
- [ ] Error handling (toast notifications)
- [ ] Attempt limit enforcement
- [ ] Responsive design pass (mobile-first)
- [ ] Seed data for demo

---

## 10. Key Edge Cases

| Scenario | Handling |
|----------|----------|
| No quiz for selected date | Show "No questions yet" + link to most recent available date |
| User already attempted today | Show score from earlier attempt, block re-attempt |
| User unauthenticated clicks Play | Redirect to `/auth/login?callbackUrl=...` |
| API fails during quiz creation | Retry 2x, then flag for admin review |
| NewsAPI rate limited | Cache headlines, use fallback sources |
| LLM returns malformed JSON | Validate + retry with stricter prompt |
| Empty category (no questions) | Show "Coming soon" on category card |
| Database connection failure | Return 503, show friendly error page |

---

## 11. Tech Decisions & Rationale

| Decision | Choice | Why |
|----------|--------|-----|
| Styling | Tailwind CSS | Fastest for MVP, utility-first, great DX |
| Auth | NextAuth.js | Built for Next.js, supports multiple providers |
| Database | PostgreSQL (Neon / Supabase) | Free tier, serverless, Prisma-compatible |
| ORM | Prisma | Type-safe, auto-generated types, easy migrations |
| Charts | recharts | Lightweight, React-native, covers bar/line/heatmap |
| Cron | Vercel Cron Jobs | Same deployment platform, no infra overhead |
| LLM | GPT-4o-mini | Cheap (~$0.15/1M input), fast, good at Q&A |
| Forms | react-hook-form + zod | Performant, type-safe validation |
| Notifications | react-hot-toast | Lightweight, no dependencies |

---

## 12. File Structure (Proposed)

```
quiz-creator/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── quiz/
│   │   │   └── [category]/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── questions/page.tsx
│   │   │   └── categories/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── questions/route.ts
│   │   │   ├── quiz/
│   │   │   │   ├── attempt/route.ts
│   │   │   │   ├── history/route.ts
│   │   │   │   └── stats/route.ts
│   │   │   └── admin/
│   │   │       ├── questions/route.ts
│   │   │       └── categories/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/          (reusable: Button, Card, Modal, etc.)
│   │   ├── quiz/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── OptionList.tsx
│   │   │   ├── ScoreReveal.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── dashboard/
│   │   │   ├── AccuracyChart.tsx
│   │   │   ├── StreakCalendar.tsx
│   │   │   └── StatsCards.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## 13. Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# News API
NEWSAPI_KEY="..."

# LLM
OPENAI_API_KEY="..."
```

---

## 14. Success Metrics for MVP

| Metric | Target |
|--------|--------|
| Questions generated per day | 16–24 (2–3 per category) |
| User quiz completion rate | > 70% |
| Daily active users | > 50 (internal / beta) |
| Quiz attempt → dashboard visit | > 60% |
| Auto-population accuracy | > 90% (questions relevant to news) |
