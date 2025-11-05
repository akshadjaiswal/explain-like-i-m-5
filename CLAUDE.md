# ExplainLevels - Progressive Complexity Explainer

> **Purpose**: This file provides comprehensive context for AI assistants to quickly understand the ExplainLevels codebase without full scanning. Last updated: 2025-01-08

---

## 🎯 Project Overview

**ExplainLevels** is an AI-powered web application that generates explanations for any topic at four progressive complexity levels, allowing users to understand concepts at their preferred depth from beginner (ELI5) to expert (PhD) level.

### Core Features
- 4 progressive complexity levels: Beginner, Intermediate, Advanced, Expert
- Real-time streaming explanations using Google Gemini AI
- Accelerated typewriter rendering with keyword highlighting
- Smart caching system with Supabase (30-day TTL)
- Rate-limit aware Gemini fallback between experimental and stable flash models
- Search with autocomplete (300ms debounce)
- Trending topics discovery on homepage
- Shareable URLs with deep linking
- Tab-based viewing interface
- Mobile-responsive with modern UI

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS 4
- **Components**: shadcn/ui (Tabs, Card, Badge, Input, Skeleton, Tooltip, ScrollArea)
- **State**: Zustand (UI preferences) + TanStack Query (server state)
- **Forms**: React hooks + custom debouncing

### Backend
- **Runtime**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini (v1beta SSE + cooldown-based fallback)
- **Caching**: Supabase with 30-day TTL
- **Streaming**: Server-Sent Events (SSE) via ReadableStream

### Deployment
- **Platform**: Vercel
- **URL**: TBD

---

## 📁 Project Structure

```
explain-like-i-m-5/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── page.tsx             # Homepage with search + trending
│   │   ├── layout.tsx           # Root layout + providers
│   │   ├── globals.css          # Tailwind + Ocean theme colors
│   │   ├── explain/[slug]/
│   │   │   ├── page.tsx         # Explanation viewer page
│   │   │   ├── loading.tsx      # Loading skeleton
│   │   │   └── error.tsx        # Error boundary
│   │   └── api/
│   │       ├── explain/route.ts          # Generate explanations (streaming)
│   │       ├── topics/trending/route.ts  # Get trending topics
│   │       └── topics/search/route.ts    # Search autocomplete
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx       # App header with search
│   │   │   └── footer.tsx       # App footer
│   │   ├── explanation/
│   │   │   ├── level-tabs.tsx           # Tab switching UI
│   │   │   ├── level-card.tsx           # Individual level display
│   │   │   ├── streaming-text.tsx       # Real-time text rendering
│   │   │   ├── complexity-badge.tsx     # Level badges
│   │   │   ├── cache-indicator.tsx      # Fresh vs cached
│   │   │   ├── loading-skeleton.tsx     # Loading states
│   │   │   └── explanation-viewer.tsx   # Main viewer component
│   │   ├── search/
│   │   │   └── search-bar.tsx   # Search with debounced autocomplete
│   │   ├── home/
│   │   │   └── trending-topics.tsx # Homepage topic grid
│   │   └── ui/                  # shadcn components
│   ├── lib/
│   │   ├── constants.ts         # App config + complexity levels
│   │   ├── utils/
│   │   │   └── slugify.ts       # Topic slug utilities
│   │   ├── gemini/
│   │   │   └── client.ts        # AI client with streaming + fallback
│   │   ├── cache/
│   │   │   └── service.ts       # Caching logic
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   └── server.ts        # Server client
│   │   ├── store/
│   │   │   └── ui-store.ts      # Zustand UI state
│   │   └── providers/
│   │       └── query-provider.tsx # React Query setup
│   ├── types/
│   │   ├── database.ts          # Supabase generated types
│   │   └── index.ts             # App-wide types
│   ├── .env.local               # Environment variables
│   └── package.json
├── docs/
│   └── PRD.md                   # Product requirements
├── CLAUDE.md                    # This file
└── README.md                    # User-facing docs
```

---

## 🔄 Data Flow

### Explanation Generation Flow
```
1. User searches topic (search-bar.tsx)
   ↓ (debounced 300ms)
2. Navigate to /explain/[slug]
   ↓
3. Check Supabase cache (getCachedExplanations)
   - Full hit: respond immediately with cached payload
   - Partial hit: stream cached levels instantly, generate only missing ones
   ↓
4. POST /api/explain with topic + levels (only when at least one level missing)
   ↓
5. Try Gemini models via rate-limit-aware fallback:
   - `gemini-2.0-flash-exp`
   - `gemini-2.5-flash` (skips temporarily disabled models automatically)
   ↓
6. Stream response via SSE (levels handled sequentially; chunks forwarded as they arrive)
   ↓
7. Save freshly generated levels to Supabase cache (30-day TTL, level-specific)
   ↓
8. Update topics table (view_count++, last_generated)
   ↓
9. Display with accelerated streaming text effect
```

### Search Autocomplete Flow
```
1. User types in search bar
   ↓
2. Debounce 300ms (prevents spam)
   ↓
3. Query Supabase for matching topics
   ↓
4. Display autocomplete dropdown
   ↓
5. User selects → navigate to /explain/[slug]
```

---

## 🔑 Key Files & Their Roles

### Core Business Logic
| File | Purpose |
|------|---------|
| `lib/constants.ts` | Complexity levels, colors, Gemini config, app settings |
| `lib/gemini/client.ts` | AI client with streaming + rate-limit-aware fallback (v1beta) |
| `lib/cache/service.ts` | Smart caching, topic management, trending logic |
| `types/index.ts` | TypeScript interfaces for all data structures |

### API Routes
| File | Purpose |
|------|---------|
| `app/api/explain/route.ts` | Main endpoint: streaming + caching + topic updates |
| `app/api/topics/trending/route.ts` | Get top N topics by view_count |
| `app/api/topics/search/route.ts` | Search topics by title/slug |

### UI Components
| File | Purpose |
|------|---------|
| `components/explanation/level-tabs.tsx` | Responsive tab interface (2-col mobile grid, 4-col desktop) with level color coding |
| `components/explanation/level-card.tsx` | Individual explanation display with streaming |
| `components/explanation/streaming-text.tsx` | Adaptive typewriter renderer with chunk batching + cursor pulse |
| `components/explanation/complexity-badge.tsx` | Color-coded level indicators |
| `components/explanation/cache-indicator.tsx` | Shows fresh vs cached content |
| `components/search/search-bar.tsx` | Search input with 300ms debounced autocomplete |
| `components/home/trending-topics.tsx` | Homepage grid of popular topics |

### State Management
| File | Purpose |
|------|---------|
| `lib/store/ui-store.ts` | Zustand store: viewMode, theme (persisted to localStorage) |
| `lib/providers/query-provider.tsx` | TanStack Query setup with 1-min stale time |

---

## 🧮 Business Logic

### Complexity Levels (constants.ts)
```typescript
BEGINNER: "Explain like I'm 5" (ELI5)
INTERMEDIATE: High school level
ADVANCED: College/undergraduate depth
EXPERT: Graduate/PhD level detail
```

### Gemini Configuration
- **API Version**: v1beta (supports experimental streaming endpoints)
- **Model Fallback**:
  1. `gemini-2.0-flash-exp` (primary, experimental + fastest)
  2. `gemini-2.5-flash` (higher quota fallback)
- **Rate Limiting**: 429 responses parse `RetryInfo` and temporarily disable the offending model via an in-memory cooldown map, preventing repeated quota hits.
- **Streaming**: SSE (`:streamGenerateContent`) with JSON chunk parsing; non-streaming path still available via `generateContent`.
- **Temperatures**:
  - Beginner: 0.8 (creative, analogies)
  - Intermediate: 0.6
  - Advanced: 0.4
  - Expert: 0.3 (precise, technical)
- **Max Tokens**: 800 per level

### Caching Logic (cache/service.ts)
- **TTL**: 30 days
- **Cache Key**: topic_slug + complexity_level
- **Update**: last_accessed, access_count on cache hit
- **Partial Hits**: Builds a per-level map; cached levels stream instantly while only missing ones trigger Gemini
- **Trending**: Calculated by view_count (DESC)
- **Background Refresh**: Not implemented (Phase 2)
- **Types**: Uses `Database` generated types (`Insert`/`Update`) with explicit relationships for type-safe Supabase calls

### Streaming Renderer (components/explanation/streaming-text.tsx)
- **Animation**: Uses `requestAnimationFrame` + adaptive timeouts for faster perceived typing
- **Chunking**: Dynamically increases chunk size (12–64 chars) as buffers grow
- **Formatting**: Lightweight markdown-style parsing with keyword highlighting
- **Cursor**: Pulse indicator shown while streaming or animating

### Level Tabs (components/explanation/level-tabs.tsx)
- **Layout**: CSS grid renders 2 columns on small screens, auto-expands to 4 on ≥640px
- **Touch Targets**: Min height 48px mobile / 42px desktop, extra padding for thumb reach
- **Styling**: Color-coded active states mapped to complexity levels via Tailwind data attributes

### Topic Slugification (utils/slugify.ts)
- **Input**: "Quantum Computing"
- **Output**: "quantum-computing"
- **Rules**: lowercase, spaces→hyphens, strict (remove special chars)
- **Reverse**: slug→Title Case

---

## 🌐 API Endpoints

| Endpoint | Method | Purpose | Streaming |
|----------|--------|---------|-----------|
| `/api/explain` | POST | Generate 4-level explanations | Yes (SSE) |
| `/api/explain` | GET | Get cached explanations by slug | No |
| `/api/topics/trending` | GET | Get trending topics | No |
| `/api/topics/search` | GET | Search topics (autocomplete) | No |

### Request/Response Examples

**POST /api/explain**
```json
// Request
{
  "topic": "Quantum Computing",
  "levels": ["beginner", "intermediate", "advanced", "expert"]
}

// Response (SSE stream)
data: {"level":"beginner","chunk":"Quantum computing is like...","done":false}
data: {"level":"beginner","chunk":" having a magic computer","done":false}
data: {"level":"beginner","done":true,"cached":false}
// ... continues for all 4 levels
```

**GET /api/topics/trending?limit=12**
```json
{
  "topics": [
    {
      "id": "uuid",
      "slug": "quantum-physics",
      "title": "Quantum Physics",
      "viewCount": 1523,
      "isTrending": true,
      "lastGenerated": "2025-01-05T12:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🎨 Design System

### Color Palette (Ocean Theme)

**IMPORTANT**: All colors defined as CSS variables in `globals.css`. Use utility classes, NOT hardcoded hex values!

**Brand Colors**
- `--brand-primary`: 196 223 230 (#C4DFE6) - Soft blue-gray
- `--brand-secondary`: 102 165 173 (#66A5AD) - Teal-blue
- Usage: `bg-primary`, `text-secondary`, `border-accent`

**Complexity Level Colors**
- `--level-beginner`: 20 184 166 (#14B8A6) - Teal
  - Classes: `text-teal-700`, `bg-teal-500/10`, `border-teal-500/20`
- `--level-intermediate`: 245 158 11 (#F59E0B) - Amber
  - Classes: `text-amber-700`, `bg-amber-500/10`, `border-amber-500/20`
- `--level-advanced`: 59 130 246 (#3B82F6) - Blue
  - Classes: `text-blue-700`, `bg-blue-500/10`, `border-blue-500/20`
- `--level-expert`: 225 29 72 (#E11D48) - Rose
  - Classes: `text-rose-700`, `bg-rose-500/10`, `border-rose-500/20`

**Semantic Colors**
- Background: `255 255 255` (light) / `15 23 42` (dark)
- Foreground: `15 23 42` (light) / `248 250 252` (dark)
- Muted: `241 245 249` / `51 65 85`
- Border: `226 232 240` / `51 65 85`

### CSS Variable System (Tailwind CSS 4)
```css
@theme inline {
  --color-primary: var(--brand-secondary);
  --color-secondary: var(--brand-primary);
  --color-level-beginner: var(--level-beginner);
  // ... etc
}

:root {
  --brand-primary: 196 223 230;
  --brand-secondary: 102 165 173;
  --level-beginner: 20 184 166;
  // ... etc
}
```

### Typography
- **Sans**: Inter (body text)
- **Mono**: Space Mono (headers, badges, code)
- **Sizes**: Tailwind scale (text-xs to text-6xl)
- **Weights**: Regular (400), Bold (700)

---

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For server-side operations

# Gemini API
GEMINI_API_KEY=AIzaSyC...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Common Tasks

### Adding a New Complexity Level
1. Add to `COMPLEXITY_LEVELS` in `lib/constants.ts`
2. Add temperature to `GEMINI_CONFIG.TEMPERATURES`
3. Add color to `LEVEL_COLORS` and `globals.css`
4. Add prompt template to `lib/gemini/client.ts`
5. Update `ComplexityLevel` type in `types/database.ts`
6. Add tab to `level-tabs.tsx`

### Changing Cache Duration
- Default: 30 days
- Change `CACHE_CONFIG.TTL_DAYS` in `lib/constants.ts`
- Also update background refresh logic if implemented

### Modifying AI Prompts
- Edit `createPrompt()` in `lib/gemini/client.ts`
- Test with various topics to ensure quality
- Adjust temperatures for different tones

### Adding New Search Source
- Update `searchTopics()` in `lib/cache/service.ts`
- Can add external APIs (Wikipedia, Stack Exchange, etc.)
- Combine results before returning

---

## 📊 Database Schema

### `topics` Table (Supabase)
```sql
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
```

### `explanations` Table (Supabase)
```sql
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
CREATE INDEX idx_explanations_level ON explanations(complexity_level);
```

---

## 🐛 Troubleshooting

### Gemini API Errors
- **404 Model Not Found**: Ensure using v1beta API (not v1)
- **Check model names**: `gemini-2.0-flash-exp`, `gemini-2.5-flash`
- **Verify API key**: Check `GEMINI_API_KEY` in `.env.local`
- **Review fallback logs**: Check which model succeeded in console

### Search Firing Too Often
- **Check debounce**: Should be 300ms delay
- **Verify useEffect**: Cleanup function should clear timeout
- **TanStack Query**: enabled only when `debouncedQuery.length >= 2`

### Cache Not Working
- **Verify Supabase connection**: Check tables exist
- **Check TTL**: Explanations older than 30 days are ignored
- **Review cache keys**: topic_slug + complexity_level
- **Ensure updates**: last_accessed and access_count should increment

### Streaming Issues
- **Check SSE format**: `data: {json}\n\n`
- **Verify ReadableStream**: Must use Edge-compatible streams
- **Monitor chunks**: Each chunk should have `level`, `chunk`, `done`
- **Error handling**: Catch errors in stream generator

### Colors Not Showing
- **Check Tailwind classes**: Use `bg-primary` not `bg-[#66A5AD]`
- **Verify CSS variables**: Defined in `globals.css` :root
- **Dark mode**: Use `dark:` prefix for dark variants
- **Rebuild**: Run `npm run dev` to regenerate Tailwind CSS

---

## 🔄 Recent Changes

### 2025-01-08 (Rate-Limit Fallback, Faster Streaming, Supabase Types)

- **Gemini Resilience**: Replaced 3-model chain with dual-model fallback (`gemini-2.0-flash-exp` → `gemini-2.5-flash`) and added cooldown logic that temporarily skips rate-limited models using parsed `RetryInfo`.
- **Cache Accuracy**: API now builds a per-level cache map so partially cached topics reuse stored content while generating only the missing levels.
- **Streaming Renderer**: `StreamingText` uses `requestAnimationFrame` + adaptive chunk sizes (12–64 chars) for a faster typewriter effect with markdown-style formatting and pulse cursor.
- **Mobile Tabs**: Level tabs render as a 2-column grid on narrow viewports with larger touch targets (min 48px) while retaining 4-column layout on desktop.
- **Supabase Types**: Added `Relationships` metadata in `types/database.ts` and typed the `insert/update` calls in `lib/cache/service.ts` for `tsc --noEmit` compliance.

### 2025-11-05 (Bug Fixes, Enhancements & Mobile Optimization)

**MOBILE-FIRST OPTIMIZATION**:
- **Problem**: Desktop-focused design with poor mobile UX - small touch targets, cramped layout
- **Solution**: Comprehensive mobile-first redesign across all pages
- **Improvements**:
  - ✅ **Responsive Header**: Two-row layout on mobile (logo + nav on row 1, search on row 2)
  - ✅ **Touch-Friendly Tabs**: Minimum 44px touch targets, better spacing, active scale feedback
  - ✅ **Mobile Typography**: Responsive text sizing (text-2xl → text-4xl progression)
  - ✅ **Better Spacing**: Reduced padding on mobile, increased on desktop
  - ✅ **Card Heights**: Adaptive scroll areas (300px mobile → 400px desktop)
  - ✅ **Single-Column Grid**: Trending topics stack on mobile for easy tapping
  - ✅ **Larger Quick Actions**: Homepage "Try" buttons with 36px min-height
- **Files Changed**:
  - `components/layout/header.tsx` - Mobile-first header layout
  - `app/explain/[slug]/page.tsx` - Responsive title and spacing
  - `components/explanation/level-tabs.tsx` - Touch-optimized tabs
  - `components/explanation/level-card.tsx` - Mobile-friendly card layout
  - `components/home/trending-topics.tsx` - Single-column mobile grid
  - `app/page.tsx` - Responsive hero section
- **Impact**: Significantly improved mobile UX - fast, thumb-friendly, accessible

**CRITICAL BUG FIX - Duplicate API Calls (50% Cost Reduction)**:
- **Problem**: React Strict Mode + unstable useEffect dependencies caused 2x API calls per page load
- **Root Cause**: `cached` object reference changed on every render, triggering re-fetches
- **Solution**: Added `useRef` tracking (`hasFetchedRef`) to prevent duplicate calls
- **Impact**: Reduced Gemini API costs by 50%!
- **Files Changed**: `components/explanation/explanation-viewer.tsx`
- **Implementation**:
  - Added `hasFetchedRef` to track fetch status
  - Added `currentSlugRef` to detect slug changes
  - Simplified useEffect dependencies to `[slug]` only
  - Prevents multiple fetches even in React Strict Mode

**TEXT RENDERING ENHANCEMENT**:
- **Problem**: Plain text display with no formatting or visual hierarchy
- **Solution**: Implemented rich markdown-like formatting system
- **Features Added**:
  - ✅ **Bold text**: `**text**` → `<strong>`
  - ✅ **Italic text**: `*text*` → `<em>`
  - ✅ **Code snippets**: `` `code` `` → styled `<code>`
  - ✅ **Bullet lists**: `- item` → styled bullets with primary color
  - ✅ **Numbered lists**: `1. item` → styled numbers with mono font
  - ✅ **Keyword highlighting**: Technical terms (AI, API, quantum, etc.) auto-highlighted
  - ✅ **Proper paragraph spacing**: Multi-paragraph support with `mb-4`
  - ✅ **Better typography**: Leading, spacing, and visual hierarchy
- **Files Changed**: `components/explanation/streaming-text.tsx`
- **Performance**: No performance impact - all parsing done in-memory

### 2025-01-05 (Initial Release)

**CORE FEATURES IMPLEMENTED**:
- ✅ 4-level explanation generation (Beginner → Expert)
- ✅ Real-time streaming from Gemini AI
- ✅ Smart caching with Supabase (30-day TTL)
- ✅ Search with 300ms debounced autocomplete
- ✅ Trending topics on homepage
- ✅ Shareable URLs with slug-based routing
- ✅ Tab-based viewing interface
- ✅ Mobile-responsive design

**TECHNICAL IMPLEMENTATION**:
- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS 4 with custom Ocean theme colors
- Gemini v1beta API with rate-limit-aware dual-model fallback
- Server-Sent Events for streaming
- TanStack Query + Zustand for state
- shadcn/ui components (Tabs, Cards, Badges, etc.)

**UI/UX FEATURES**:
- Ocean theme colors (#C4DFE6, #66A5AD)
- Color-coded complexity levels (Teal/Amber/Blue/Rose)
- Streaming text with typewriter effect
- Loading skeletons for all states
- Cache indicators (Fresh vs Cached)
- Error boundaries with fallbacks
- Dark mode support

**ARCHITECTURE**:
- Modular component structure
- Service layer separation (lib/)
- Type-safe with generated DB types
- API routes for streaming + caching
- Debounced search for performance
- Proper error handling throughout

---

## 📝 Notes for AI Assistants

### When Making Changes
1. **Always read this file first** to understand context
2. **Update this file** if you make architectural changes
3. **Test all 4 complexity levels** after prompt changes
4. **Verify streaming works** on mobile + desktop
5. **Check mobile responsiveness** for UI changes
6. **Use CSS variables** (NOT hardcoded colors)
7. **Add types** for any new data structures

### Performance Considerations
- Cache aggressively (30-day TTL is good)
- Debounce search to prevent API spam
- Use streaming for better perceived performance
- Keep Zustand store minimal (UI preferences only)
- Leverage TanStack Query's smart caching

### Security Notes
- Never expose Gemini API key client-side
- Validate all user inputs server-side
- Sanitize topic inputs before queries
- Use Supabase RLS for data protection
- Rate limit API routes if needed

### Code Patterns
- **Components**: Use client components ("use client") for interactivity
- **API Routes**: Use App Router route.ts files
- **Types**: Generate from Supabase, extend in types/index.ts
- **Styling**: Tailwind utility classes + CSS variables
- **State**: Zustand for UI, TanStack Query for server data
- **Errors**: Try/catch with user-friendly messages

---

**End of Context File**
