# ExplainLevels - Understand Any Topic at Your Level

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) [![React 19](https://img.shields.io/badge/React-19-149ECA?style=flat&logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/) [![Google Gemini](https://img.shields.io/badge/Google_Gemini-8B5CF6?style=flat&logo=google&logoColor=white)](https://gemini.google.com/) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/) [![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat)](https://opensource.org/licenses/MIT)

**ExplainLevels** is an AI-powered progressive complexity explainer that generates explanations for any topic at four different levels: **Beginner** (ELI5), **Intermediate** (High School), **Advanced** (College), and **Expert** (PhD). Built with cutting-edge tech and a beautiful ocean-themed UI, it makes learning accessible for everyone.

> From ELI5 to PhD - we explain it all. 🎓

### 🚨 Latest Updates (Nov 2025)
- **🤖 Multi-Provider AI**: Switched to Groq as primary LLM (Meta Llama 3.1 70B) with Gemini fallbacks for 95%+ reliability
- **⚡ Parallel Generation**: All 4 complexity levels now generate simultaneously (40% faster!)
- **🔄 Robust Architecture**: Replaced SSE with JSON API + retry logic (3 attempts with exponential backoff)
- **📝 Perfect Markdown**: Full GFM support with proper tables, headers, and code blocks rendering
- **🎨 Optimized Typography**: Compact, readable text with perfect spacing and line heights

## ✨ Features

### 🎯 Core Capabilities
- **4 Complexity Levels**: Understand any topic from beginner to expert level
  - 🟢 **Beginner**: Like explaining to a 5-year-old (ELI5)
  - 🟡 **Intermediate**: High school level with proper terminology
  - 🔵 **Advanced**: College/undergraduate depth with technical details
  - 🔴 **Expert**: Graduate/PhD level with nuanced insights

- **Smooth Typewriter Effect**: Watch explanations appear with beautiful animated text rendering (client-side animation for 100% reliability)
- **Smart Caching**: Instant loading for popular topics (30-day cache with parallel generation for missing levels)
- **Search & Discovery**:
  - Debounced autocomplete search (300ms)
  - Trending topics on homepage
  - Recent explanations tracking
- **Shareable URLs**: Deep links to specific topics and levels
- **Beautiful UI**: Modern ocean theme with responsive design

### 🚀 Technical Highlights
- **Multi-Provider AI**: Groq (primary) with Gemini fallback for maximum reliability
  - Groq `llama-3.1-70b` (fast, reliable primary)
  - Gemini 2.0 Flash Exp (first fallback)
  - Gemini 2.5 Flash (second fallback)
- **Intelligent Architecture**: Non-SSE JSON API with client-side animation for 95%+ reliability
- **Parallel Generation**: Missing levels generated simultaneously (40% faster than sequential)
- **Proper Markdown**: Full GitHub Flavored Markdown support with react-markdown + remark-gfm
- **Performance Optimized**: Smart caching delivers explanations in <200ms with automatic retry logic (3 attempts)
- **Mobile-First**: Responsive design works beautifully on all devices, including compact tab layouts on phones
- **Type-Safe**: Full TypeScript coverage with generated database types
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

---

## 🎨 Design & User Experience

### Ocean Theme Color System
- 🌊 **Primary**: Soft blue-gray (#C4DFE6) - Calming, approachable
- 💙 **Secondary**: Teal-blue (#66A5AD) - Professional, trustworthy
- **Level Colors**:
  - 🟢 Beginner: Teal (#14B8A6) - Fresh, encouraging
  - 🟡 Intermediate: Amber (#F59E0B) - Warm, confident
  - 🔵 Advanced: Blue (#3B82F6) - Professional, focused
  - 🔴 Expert: Rose (#E11D48) - Sophisticated, intense

### UI Components
- **Tab Interface**: Auto-wrapping grid keeps level triggers spacious on mobile
- **Streaming Text**: Real-time rendering with adaptive batching and cursor pulse
- **Cache Indicators**: See if content is fresh or cached
- **Loading Skeletons**: Beautiful loading states for all components
- **Complexity Badges**: Color-coded level indicators with descriptions
- **Dark Mode**: Full support with Ocean theme variants

### User Flow
1. Land on homepage → See trending topics + search bar
2. Search or click topic → Navigate to explanation page
3. See loading skeletons → Watch explanations stream in
4. Switch between levels → Compare complexity side-by-side
5. Share via URL → Send to friends/colleagues

---

## Tech Stack

<div align="center">

| Category | Technology |
|----------|-----------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwind-css&logoColor=white) |
| **UI Components** | ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?logo=shadcnui&logoColor=white) |
| **State** | ![Zustand](https://img.shields.io/badge/Zustand-5-8B5CF6?logo=react&logoColor=white) • ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=react-query&logoColor=white) |
| **AI** | ![Groq](https://img.shields.io/badge/Groq-Llama_3.1-FF6B6B?logo=meta&logoColor=white) • ![Google Gemini](https://img.shields.io/badge/Gemini-Fallback-8B5CF6?logo=google&logoColor=white) |
| **Markdown** | ![react-markdown](https://img.shields.io/badge/react--markdown-GFM-000000?logo=markdown&logoColor=white) |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) |

</div>

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works great)
- **Groq API key** ([Get one free](https://console.groq.com/)) - Primary LLM provider
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey)) - Fallback provider

### 1. Clone & Install

```bash
git clone https://github.com/akshadjaiswal/explain-like-i-m-5.git
cd explain-like-i-m-5/frontend
npm install
```

### 2. Environment Setup

Create `.env.local` in the `frontend` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq API (Primary)
GROQ_API_KEY=your_groq_api_key

# Gemini API (Fallback)
GEMINI_API_KEY=your_gemini_api_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the SQL scripts in Supabase SQL Editor:

```sql
-- Create topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  view_count INTEGER DEFAULT 1,
  last_generated TIMESTAMPTZ DEFAULT NOW(),
  is_trending BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_view_count ON topics(view_count DESC);

-- Create explanations table
CREATE TABLE explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_slug TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  complexity_level TEXT NOT NULL CHECK (
    complexity_level IN ('beginner', 'intermediate', 'advanced', 'expert')
  ),
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

CREATE INDEX idx_explanations_topic_slug ON explanations(topic_slug);
CREATE INDEX idx_explanations_created_at ON explanations(created_at);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

### Additional Commands
- `npm run lint`: Run ESLint for code quality
- `npm run build`: Production build
- `npm start`: Serve the built app

---

## Project Structure

```
frontend/src/
├── app/
│   ├── page.tsx                 # Homepage with search + trending
│   ├── layout.tsx               # Root layout + query provider
│   ├── globals.css              # Tailwind + Ocean theme colors
│   ├── explain/[slug]/
│   │   ├── page.tsx             # Explanation viewer page
│   │   ├── loading.tsx          # Loading skeleton
│   │   └── error.tsx            # Error boundary
│   └── api/
│       ├── explain/route.ts          # Generate explanations (streaming)
│       ├── topics/trending/route.ts  # Get trending topics
│       └── topics/search/route.ts    # Search autocomplete
├── components/
│   ├── layout/
│   │   ├── header.tsx           # App header with search
│   │   └── footer.tsx           # App footer
│   ├── explanation/
│   │   ├── level-tabs.tsx           # Tab switching UI
│   │   ├── level-card.tsx           # Individual level display
│   │   ├── streaming-text.tsx       # Real-time text rendering
│   │   ├── complexity-badge.tsx     # Level badges
│   │   ├── cache-indicator.tsx      # Fresh vs cached
│   │   ├── loading-skeleton.tsx     # Loading states
│   │   └── explanation-viewer.tsx   # Main viewer component
│   ├── search/
│   │   └── search-bar.tsx       # Search with debounced autocomplete
│   ├── home/
│   │   └── trending-topics.tsx  # Homepage topic grid
│   └── ui/                      # shadcn components
├── lib/
│   ├── constants.ts             # App config + complexity levels
│   ├── utils/slugify.ts         # Topic slug utilities
│   ├── llm/client.ts            # Multi-provider LLM orchestrator
│   ├── groq/client.ts           # Groq AI client (primary)
│   ├── gemini/client.ts         # Gemini AI client (fallback, deprecated)
│   ├── ai/prompts.ts            # Shared AI prompts
│   ├── cache/service.ts         # Caching logic
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client
│   ├── store/ui-store.ts        # Zustand UI state
│   └── providers/query-provider.tsx # React Query setup
└── types/
    ├── database.ts              # Supabase types
    └── index.ts                 # App types
```

---

## How It Works

### 1. User Journey
```
Homepage → Search/Click Topic → Loading → Explanations Stream In → Switch Levels → Share
```

### 2. Behind the Scenes
1. **Smart Caching**: Check Supabase for existing explanations
   - Full cache hit: Serve all 4 levels instantly (<200ms)
   - Partial hit: Return cached levels, generate only missing ones in parallel
   - Cache miss: Generate all 4 levels in parallel (40% faster!)
2. **AI Generation**: Multi-provider fallback for reliability
   - **Primary**: Groq `llama-3.1-70b` (fast, reliable)
   - **Fallback 1**: Gemini 2.0 Flash Exp
   - **Fallback 2**: Gemini 2.5 Flash
   - Temperature: 0.6 (consistent across all levels)
   - Parallel generation of missing levels using `Promise.all()`
3. **Reliable Delivery**: Non-SSE JSON API with retry logic
   - Complete responses or complete failures (no partial data loss)
   - Automatic retry with exponential backoff (3 attempts, 2s delay)
   - 60-second timeout with proper error handling
4. **Client-Side Animation**: Simulated streaming for perfect UX
   - Staggered typewriter effect (Beginner 0ms, Intermediate 200ms, Advanced 400ms, Expert 600ms)
   - Proper markdown rendering with react-markdown + remark-gfm
   - Tables, headers, code blocks all render beautifully
5. **Caching & Analytics**: Store results for 30 days
   - Update topic view count
   - Track access patterns
   - Calculate trending topics

---

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend && vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production domain

4. **Database**:
   - Ensure Supabase tables are set up
   - Add production Supabase credentials to Vercel

### Other Platforms
- **Netlify**: Deploy from Git with build command `npm run build`
- **Railway**: Connect repo and deploy with Dockerfile
- **AWS Amplify**: Deploy via Git integration

---
## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repo** and create a feature branch from `main`
2. **Follow existing patterns**:
   - TypeScript with full type safety
   - Component-based architecture
   - Use Tailwind utility classes (NO hardcoded colors)
   - Add types for new features
3. **Update docs** for any config/architecture changes
4. **Run linter**: `npm run lint` before committing
5. **Submit a PR** with:
   - Clear description of changes
   - Screenshots for UI updates
   - Testing steps

### Reporting Issues
Include:
- Expected vs actual behavior
- Reproduction steps
- Environment (browser, OS, Node version)
- Logs/screenshots

---

## License

MIT License - feel free to use this project for learning or building your own explanation platform!

---

## Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/akshadjaiswal/explain-like-i-m-5/issues)
- 💬 **Questions**: [Start a discussion](https://github.com/akshadjaiswal/explain-like-i-m-5/discussions)
- 📧 **Contact**: akshadsantoshjaiswal@gmail.com

---

<div align="center">

**Made with ❤️ by Akshad Jaiswal**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/akshadjaiswal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/akshadsantoshjaiswal)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/akshad_999)

**⭐ Star this repo if you find it useful!**

</div>
