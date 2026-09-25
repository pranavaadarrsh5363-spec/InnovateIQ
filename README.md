# 🚀 InnovateAI – AI-Powered Student Innovation & Resource Intelligence Platform

> Smart India Hackathon 2024 Prototype

A full-stack, production-quality platform that uses AI to help students discover resources, analyze innovation ideas, identify skill gaps, and build technology solutions.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Demo Credentials](#demo-credentials)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Connecting Real AI APIs](#connecting-real-ai-apis)
- [Connecting External Resource APIs](#connecting-external-resource-apis)
- [Project Structure](#project-structure)
- [Future Scalability](#future-scalability)

---

## ✨ Upgraded Features (Idea-to-Innovation Intelligence Platform)

### 🚀 15 Flagship Innovation Modules
1. **AI Project Generator** – 17-point blueprint from a simple idea (Objectives, Architecture, Bill of Materials, Timeline, Challenges, Risks, Feasibility Score, Impact). Fully editable, exportable as JSON/PDF text, and one-click convertible to active project workspaces.
2. **Innovation Similarity Checker** – Semantic vector comparison against existing solutions, open-source projects, and patent databases with similarity percentage, unique differentiators, and competitor limitations.
3. **Innovation Gap Detector ("Where Can You Innovate?")** – Identifies uncontested innovation opportunities, unsolved edge cases, difficulty rating (Low/Med/High), and potential impact score (1-100).
4. **Research Paper Explainer & Document Chat** – Summarizes academic papers into problem, methodology, key findings, and practical innovation takeaways. Features an interactive **"Explain Simply (ELI15)"** toggle and integrated document chat assistant.
5. **Document AI Quiz Generator** – Generates custom MCQs, True/False, and situational case quizzes directly from research papers and technology guides with diagnostic performance breakdown and topic recommendations.
6. **Personalized Learning Roadmap** – Multi-phase step-by-step roadmap tailored to student skill gaps with estimated hours, interactive step completion toggling, hands-on practice tasks, and quiz checkpoints.
7. **AI Team Formation** – Skill alignment matching based on complementary team roles (e.g. Hardware + ML + Full-Stack) without rank or popularity bias. Instant project invitation dispatch.
8. **AI Mentor Matching** – Matches students with vetted academic and industry mentors based on domain expertise, research interests, and project domain alignment.
9. **Innovation Challenges Hub** – Curated directory of Smart India Hackathon (SIH), Government Ministry, and Industry problem statements with 1-click project initialization.
10. **Knowledge Graph** – Interactive multi-entity network view connecting Ideas, Technologies, Datasets, Research Papers, and Mentors with dependency visualization.
11. **Project Feasibility & BOM Estimator** – Multi-dimensional feasibility radar (Technical, Resource, Skill, Cost, Scalability, Deployment) and editable INR (₹) Bill of Materials breakdown.
12. **Evidence & Grounding Panels** – Confidence scores and cited references to verify AI claims and recommendations.
13. **Smart Notification Center** – Real-time event notifications for team invites, mentor feedback, roadmap milestones, and newly discovered resources.
14. **Student Innovation Portfolio & GitHub Audit** – Public portfolio page showcasing completed challenges, skill endorsements, and automated AI repository analysis with code strengths and architecture suggestions.
15. **Context-Aware InnoAI Chatbot & Global Search** – Intelligent assistant aware of active user projects and domain, equipped with quick action shortcuts, and natural language search across all platform entities.
16. **15-Step Continuous Innovation Journey Bar** – Sticky workflow guide across all student pages allowing seamless jump to any stage in the innovation lifecycle.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, Lucide React, Recharts |
| Routing | React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Database | In-memory JSON store (swappable to PostgreSQL) |
| AI Service | Mock abstraction (swappable to OpenAI/Gemini) |
| Resource Service | Mock data (swappable to real APIs) |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm 9+ installed

### Step 1: Clone/Navigate to the project
```bash
cd innovate-ai
```

### Step 2: Install backend dependencies
```bash
cd backend
npm install
```

### Step 3: Install frontend dependencies
```bash
cd ../frontend
npm install
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | `aarav@sih.dev` | `demo123` |
| **Mentor** | `mentor@sih.dev` | `demo123` |
| **Admin** | `admin@sih.dev` | `demo123` |

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
JWT_SECRET=innovate-ai-super-secret-jwt-key-2024
NODE_ENV=development
```

> **Optional (for real AI):**
> ```env
> OPENAI_API_KEY=sk-...
> GEMINI_API_KEY=AIza...
> ```

---

## ▶️ Running the Application

### Terminal 1 — Start Backend
```bash
cd backend
npm run dev
```
Backend runs at: http://localhost:5000  
API health check: http://localhost:5000/api/health

### Terminal 2 — Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

### Open in Browser
Navigate to: **http://localhost:5173**

---

## 🤖 Connecting a Real AI API

The AI service is fully abstracted in `backend/src/services/aiService.ts`.

### To connect OpenAI GPT-4:
```typescript
// In aiService.ts, replace analyzeIdea():
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const aiService = {
  async analyzeIdea(input: IdeaAnalysisInput): Promise<IdeaAnalysisResult> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an AI innovation advisor...' },
        { role: 'user', content: JSON.stringify(input) },
      ],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(response.choices[0].message.content!);
  },
  // ...rest of methods
};
```

### To connect Google Gemini:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

---

## 📡 Connecting External Resource APIs

The resource service is abstracted in `backend/src/routes/resources.ts` and uses `backend/src/data/seed.ts`.

### To connect real APIs, replace the mock data with:

```typescript
// Example: Search arXiv for research papers
async function searchArxiv(query: string) {
  const res = await fetch(`https://export.arxiv.org/api/query?search_query=${query}&max_results=10`);
  // Parse and return results
}

// Example: Search Kaggle datasets
async function searchKaggle(query: string) {
  const res = await fetch('https://www.kaggle.com/api/v1/datasets/list', {
    headers: { Authorization: `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}` }
  });
}
```

### Available source APIs to integrate:
- **Research Papers**: arXiv API, Semantic Scholar API, PubMed API
- **Datasets**: Kaggle API, UCI ML Repository, data.gov.in
- **Tools/Repos**: GitHub Search API, npm registry API
- **Learning**: Coursera API, Udemy API
- **Government**: data.gov API, MoHFW API

---

## 📁 Project Structure

```
innovate-ai/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server entry
│   │   ├── types/index.ts     # TypeScript types
│   │   ├── middleware/auth.ts  # JWT middleware
│   │   ├── data/seed.ts       # Mock database + demo data
│   │   ├── routes/
│   │   │   ├── auth.ts        # Login, register, /me
│   │   │   ├── projects.ts    # Project CRUD
│   │   │   ├── resources.ts   # Resource search + save
│   │   │   ├── ai.ts          # AI analysis, chat, insights
│   │   │   ├── analytics.ts   # Dashboard stats
│   │   │   └── users.ts       # User management
│   │   └── services/
│   │       └── aiService.ts   # Mock AI abstraction
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx            # Routing
    │   ├── main.tsx
    │   ├── index.css          # Tailwind + global styles
    │   ├── types/index.ts     # TypeScript types
    │   ├── contexts/AuthContext.tsx
    │   ├── services/api.ts    # Axios API client
    │   ├── components/
    │   │   └── layout/        # Sidebar, Header, Layout
    │   └── pages/
    │       ├── Landing.tsx
    │       ├── Login.tsx
    │       ├── Register.tsx
    │       ├── student/       # All student pages
    │       ├── mentor/        # Mentor dashboard
    │       └── admin/         # Admin dashboard
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## 📈 Future Scalability

### Database Migration (In-Memory → PostgreSQL)
Replace `backend/src/data/seed.ts` with a PostgreSQL connection using `pg` or `prisma`.

### Real Authentication
Add Google OAuth, GitHub OAuth using `passport.js`.

### Microservices Architecture
Split into separate services:
- `auth-service` (port 5001)
- `resource-service` (port 5002)
- `ai-service` (port 5003)
- `analytics-service` (port 5004)

### Deploy to Cloud
- **Frontend**: Vercel, Netlify, Firebase Hosting
- **Backend**: Railway, Render, AWS ECS
- **Database**: Supabase, Neon (PostgreSQL), PlanetScale

### Add Real-Time Features
Use Socket.io for:
- Live collaboration on projects
- Real-time mentor notifications
- Live AI analysis progress

---

## 🏆 SIH Demo Flow

1. Go to http://localhost:5173
2. Click **"Demo Login"** → logs in as Aarav Kumar (student)
3. Dashboard shows project at 65% progress, 42 resources, 18 insights
4. Click **"AI Analyzer"** → Enter the water quality problem
5. Watch AI generate 16-section analysis
6. Go to **Resource Explorer** → search "machine learning" → save resources
7. Open **InnoAI** → ask "What tech stack should I use?"
8. Go to **Projects** → view project workspace with tasks
9. Click **"Skill Gap"** → analyze your gaps
10. Click **"Tech Recommendations"** → get AI stack advice

---

Built with ❤️ for Smart India Hackathon 2024
