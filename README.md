# PartSelect Assistant (RAG Chatbot)

A full-stack AI-powered chatbot for finding refrigerator and dishwasher replacement parts on PartSelect.

| | |
|:---:|:---:|
| **Frontend** | React + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express |
| **AI/ML** | OpenAI GPT-4o-mini + Embeddings (Ollama/OpenAI) |
| **Vector DB** | ChromaDB |
| **Data** | Puppeteer + Cheerio web scraping |
| **Caching** | Redis (optional) + In-memory |

---

## Features

- **RAG-powered chat** - Semantic search over product database for accurate recommendations
- **Real-time streaming** - See responses as they're generated with SSE
- **Dark mode** - Light, dark, and system theme options
- **Self-hosted embeddings** - Use Ollama for local embeddings (no API costs)
- **Reliability infrastructure** - Redis persistence, rate limiting, caching
- **Product cards** - Rich product displays with images and direct links

---

## Screenshots

<!-- TODO: Add dark mode screenshots -->


<table>
  <tr>
    <td align="center">
      <strong>Welcome Screen</strong><br/><br/>
      <img width="1608" height="1027" alt="image" src="https://github.com/user-attachments/assets/4f2481f0-e9ea-460f-9516-3630dd7e4738" />
    </td>
    <td align="center">
      <strong>Product Search</strong><br/><br/>
      <img width="1603" height="1025" alt="image" src="https://github.com/user-attachments/assets/26a6c9a0-aec7-4906-b1af-c334cf8e614a" />
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <strong>Product Cards with Rich Details</strong><br/><br/>
      <img width="600" alt="Product cards" src="https://github.com/user-attachments/assets/bd4ee171-585a-4342-a5a0-d26c5b349231" />
    </td>
  </tr>
</table>

---

## Prerequisites

- Node.js 18+
- Python 3.10+ (for ChromaDB)
- OpenAI API key
- **Optional**: Ollama (for self-hosted embeddings)
- **Optional**: Redis (for persistent conversations)

## Quick Start

### 1. Install dependencies

```bash
npm install
python3 -m pip install chromadb
```

### 2. Create `.env`

```bash
# Required
OPENAI_API_KEY=your_key_here

# ChromaDB
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=partselect_products

# Embedding Configuration (optional - defaults to Ollama)
EMBEDDING_PROVIDER=ollama          # 'ollama' or 'openai'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Redis (optional - falls back to in-memory)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000         # 1 minute window
RATE_LIMIT_MAX_REQUESTS=20         # Max requests per window

# Cache Settings
CACHE_TTL_SECONDS=300              # Embedding cache TTL
CONVERSATION_TTL_SECONDS=86400     # Conversation TTL (24 hours)

# Server
PORT=3001
REACT_APP_API_URL=http://localhost:3001

# Scraping
SCRAPE_PARTSELECT=true
FORCE_REFRESH=false
SCRAPE_TEST_MODE=true              # Set to false for full scrape (~700 products)
```

### 3. Set up Ollama (optional, for self-hosted embeddings)

```bash
# Install Ollama
brew install ollama

# Pull embedding model
ollama pull nomic-embed-text

# Start Ollama server
ollama serve
```

### 4. Run

**Terminal 1: ChromaDB**
```bash
npm run chroma
```

**Terminal 2: App (backend + frontend)**
```bash
npm run dev
```

**Optional Terminal 3: Redis**
```bash
redis-server
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| ChromaDB | http://localhost:8000 |
| Ollama | http://localhost:11434 |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Standard chat (waits for full response) |
| `/api/chat/stream` | POST | Streaming chat (SSE, real-time tokens) |
| `/api/health` | GET | Health check with service status |
| `/api/debug/products` | GET | View products in vector store |

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "hasApiKey": true,
  "services": {
    "redis": { "connected": true, "url": "redis://localhost:6379" },
    "embeddings": { "healthy": true, "provider": "ollama", "model": "nomic-embed-text", "dimensions": 768 },
    "conversations": { "count": 5, "backend": "redis", "ttlSeconds": 86400 },
    "cache": { "hits": 42, "misses": 8, "hitRate": "84.0%", "size": 50 },
    "rateLimit": { "windowMs": 60000, "maxRequests": 20, "backend": "redis" }
  }
}
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run server` | Start backend only |
| `npm start` | Start frontend only |
| `npm run chroma` | Start ChromaDB |
| `npm run reindex` | Re-index products (use after changing embedding model) |
| `npm test` | Run tests |
| `npm run build` | Production build |

## File Structure

```
├── server.js                      # Express backend (chat, streaming, health)
├── scripts/
│   └── reindex.js                 # Re-indexing script for embedding changes
├── src/
│   ├── services/
│   │   ├── embeddingService.js    # Unified embedding provider (Ollama/OpenAI)
│   │   ├── chromaVectorStore.js   # ChromaDB operations
│   │   ├── ragService.js          # RAG context retrieval
│   │   ├── conversationStore.js   # Persistent conversations (Redis/memory)
│   │   ├── redisClient.js         # Redis singleton with fallback
│   │   ├── embeddingCache.js      # In-memory embedding cache
│   │   └── partSelectScraper.js   # Web scraper
│   ├── middleware/
│   │   └── rateLimiter.js         # Rate limiting (Redis/memory)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ThemeToggle.tsx    # Light/dark/system toggle
│   │   │   └── StreamingText.tsx  # Animated streaming cursor
│   │   ├── chat/                  # Chat components
│   │   └── ProductCard.tsx        # Product display card
│   ├── hooks/
│   │   ├── useGPT.ts              # Chat state + streaming
│   │   └── useTheme.ts            # Theme management
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn)
│   ├── pages/
│   │   └── Chat.tsx               # Main chat page
│   └── api/
│       └── api.ts                 # API client (standard + streaming)
└── data/chroma/                   # ChromaDB storage
```

## Key Features Explained

### Streaming vs Standard Mode

The app supports two response modes, toggleable in the UI:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Streaming** | Tokens appear as generated (SSE) | Interactive feel, can cancel mid-response |
| **Standard** | Waits for complete response | Simpler, full response at once |

### Embedding Providers

| Provider | Pros | Cons |
|----------|------|------|
| **Ollama** (default) | Free, private, no API limits | Requires local setup |
| **OpenAI** | High quality, no setup | API costs, rate limits |

Switch providers via `EMBEDDING_PROVIDER` in `.env`. Run `npm run reindex` after changing.

### Dark Mode

Three theme options available via header toggle:
- **Light** - White background, dark text
- **Dark** - Dark background, light text
- **System** - Follows OS preference

Theme persists in localStorage.

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌───────────────────────────────┐      ┌───────────────────────────────────┐  │
│  │   OFFLINE INGESTION PIPELINE  │      │       ONLINE QUERY PATH           │  │
│  │                               │      │                                   │  │
│  │  ┌─────────────────────────┐  │      │  ┌─────────────────────────────┐  │  │
│  │  │    Puppeteer Scraper    │  │      │  │         React UI            │  │  │
│  │  │    (partSelectScraper)  │  │      │  │    (Chat.tsx + Streaming)   │  │  │
│  │  └───────────┬─────────────┘  │      │  └─────────────┬───────────────┘  │  │
│  │              │                │      │                │                  │  │
│  │              ▼                │      │                ▼                  │  │
│  │  ┌─────────────────────────┐  │      │  ┌─────────────────────────────┐  │  │
│  │  │     Cheerio Parser      │  │      │  │      Express API Server     │  │  │
│  │  │   (HTML → structured)   │  │      │  │   (Rate Limited + Cached)   │  │  │
│  │  └───────────┬─────────────┘  │      │  └─────────────┬───────────────┘  │  │
│  │              │                │      │                │                  │  │
│  │              ▼                │      │                ▼                  │  │
│  │  ┌─────────────────────────┐  │      │  ┌─────────────────────────────┐  │  │
│  │  │    Text Formatter       │  │      │  │        RAG Service          │  │  │
│  │  │   (productToText)       │  │      │  │      (ragService.js)        │──┼──┼──┐
│  │  └───────────┬─────────────┘  │      │  └─────────────┬───────────────┘  │  │  │
│  │              │                │      │                │                  │  │  │
│  │              ▼                │      │                │ Prompt assembly  │  │  │
│  │  ┌─────────────────────────┐  │      │                ▼                  │  │  │
│  │  │   Embedding Service     │  │      │  ┌─────────────────────────────┐  │  │  │
│  │  │   (Ollama or OpenAI)    │  │      │  │        OpenAI LLM           │  │  │  │
│  │  └───────────┬─────────────┘  │      │  │    (gpt-4o-mini + SSE)      │  │  │  │
│  │              │                │      │  └─────────────┬───────────────┘  │  │  │
│  │              ▼                │      │                │ Stream/Complete  │  │  │
│  │  ┌─────────────────────────┐  │      │                ▼                  │  │  │
│  │  │       ChromaDB          │◄─┼──────┼────────── Response ───────────────┘  │  │
│  │  │    (Vector Storage)     │  │      │                                   │  │  │
│  │  └─────────────────────────┘  │      └───────────────────────────────────┘  │  │
│  │         Top-K search ▲        │                                             │  │
│  └───────────────────────┼───────┘                                             │  │
│                          │                                                     │  │
│                          └─────────────────────────────────────────────────────┘  │
│                                        Semantic search                            │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Reliability Stack

```
┌──────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Request ──▶ Rate Limiter ──▶ Conversation Store ──▶ RAG   │
│                    │                   │                     │
│                    ▼                   ▼                     │
│              ┌─────────┐        ┌───────────┐               │
│              │  Redis  │        │   Redis   │               │
│              │ (or mem)│        │ (or mem)  │               │
│              └─────────┘        └───────────┘               │
│                                                              │
│   Embedding ──▶ Cache Check ──▶ Ollama/OpenAI               │
│                    │                                         │
│                    ▼                                         │
│              ┌─────────┐                                    │
│              │ NodeCache│                                    │
│              │ (in-mem) │                                    │
│              └─────────┘                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for chat |
| `CHROMA_URL` | Yes | `http://localhost:8000` | ChromaDB server URL |
| `EMBEDDING_PROVIDER` | No | `ollama` | Embedding provider (`ollama` or `openai`) |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_EMBEDDING_MODEL` | No | `nomic-embed-text` | Ollama model name |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis URL (optional) |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `20` | Max requests per window |
| `CACHE_TTL_SECONDS` | No | `300` | Embedding cache TTL |
| `CONVERSATION_TTL_SECONDS` | No | `86400` | Conversation TTL |
| `SCRAPE_TEST_MODE` | No | `true` | `true` = 15 products, `false` = ~700 |
| `FORCE_REFRESH` | No | `false` | Re-scrape and rebuild vector store |

## Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.2.0 | Frontend framework |
| `express` | 5.2.1 | Backend server |
| `openai` | 6.16.0 | Chat completions + embeddings |
| `chromadb` | 3.2.2 | Vector database client |

### Reliability

| Package | Version | Purpose |
|---------|---------|---------|
| `ioredis` | 5.3.2 | Redis client |
| `express-rate-limit` | 7.1.5 | Rate limiting |
| `rate-limit-redis` | 4.2.0 | Redis store for rate limiter |
| `node-cache` | 5.1.2 | In-memory caching |

### UI

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 3.4.1 | Styling |
| `clsx` | 2.1.0 | Conditional classes |
| `tailwind-merge` | 2.2.1 | Class deduplication |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer` | 24.36.1 | Web scraping |
| `cheerio` | 1.2.0 | HTML parsing |
| `cors` | 2.8.6 | Cross-origin requests |
| `dotenv` | 17.2.3 | Environment variables |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | 1.13.4 | HTTP client |
| `marked` | 9.1.2 | Markdown rendering |
| `typescript` | 5.9.3 | Type safety |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage --watchAll=false
```

## Troubleshooting

### Ollama not connecting
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull model if missing
ollama pull nomic-embed-text
```

### ChromaDB connection error
```bash
# Start ChromaDB
npm run chroma

# Or manually
chroma run --host localhost --port 8000 --path ./data/chroma
```

### Re-index after changing embedding model
```bash
npm run reindex
```

### Redis not connecting
The app falls back to in-memory storage automatically. Check `/api/health` for status.

## License

MIT
