# PartSelect Assistant (RAG Chatbot)

A full-stack AI-powered chatbot for finding refrigerator and dishwasher replacement parts on PartSelect.

| | |
|:---:|:---:|
| **Frontend** | React + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express |
| **AI/ML** | OpenAI GPT-4o-mini + Embeddings |
| **Vector DB** | ChromaDB |
| **Data** | Puppeteer + Cheerio web scraping |

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <strong>Welcome Screen</strong><br/><br/>
      <img width="400" alt="Welcome screen" src="https://github.com/user-attachments/assets/cd9e80cf-55ed-419b-81c5-32284c4e8274" />
    </td>
    <td align="center">
      <strong>Product Search</strong><br/><br/>
      <img width="400" alt="Product search" src="https://github.com/user-attachments/assets/0633a625-e1bc-4831-825e-af544c366092" />
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

# Optional
PORT=3001
REACT_APP_API_URL=http://localhost:3001
SCRAPE_PARTSELECT=true
FORCE_REFRESH=false
SCRAPE_TEST_MODE=true  # Set to false for full scrape (~700 products)
```

### 3. Run

**Terminal 1:**
```bash
npm run chroma
```

**Terminal 2:**
```bash
npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| ChromaDB | http://localhost:8000 |

## API Endpoints

- `POST /api/chat` - Chat with the assistant
- `GET /api/health` - Health check
- `GET /api/debug/products` - View products in vector store

## File Structure

```
├── server.js                      # Express backend server
├── src/
│   ├── services/                  # Core backend logic
│   ├── components/                # React UI components
│   ├── constants/                 # Configuration files
│   ├── hooks/                     # React hooks
│   ├── pages/                     # Page components
│   ├── types/                     # TypeScript definitions
│   └── utils/                     # Helper functions
└── data/chroma/                   # ChromaDB storage
```

## Key Files

### Backend Services

| File | Purpose |
|------|---------|
| `server.js` | Express server with `/api/chat` endpoint. Handles conversation history, calls RAG service, and forwards to OpenAI |
| `src/services/chromaVectorStore.js` | ChromaDB operations: `initialize()`, `searchProducts()`, `getAllProducts()`. Computes embeddings via OpenAI and stores in Chroma |
| `src/services/ragService.js` | RAG orchestration: takes user query, performs semantic search, formats product context for LLM |
| `src/services/vectorStore.js` | Initialization wrapper: checks if DB has data, triggers scraping if empty, manages `FORCE_REFRESH` |
| `src/services/partSelectScraper.js` | Web scraper using Puppeteer + Cheerio. Crawls PartSelect brand pages, extracts product metadata (part numbers, symptoms, compatible models) |

### Frontend Components

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component with header and connection status |
| `src/pages/Chat.tsx` | Main chat page with message list, input, and loading states |
| `src/components/ProductCard.tsx` | Displays product info with image, part number, and link to PartSelect |
| `src/components/ConnectionStatus.tsx` | Real-time backend health indicator (Online/Offline) |
| `src/components/chat/MessageBubble.tsx` | Chat message container with user/assistant styling |
| `src/components/chat/MessageContent.tsx` | Parses message content, injects ProductCards when part numbers detected |
| `src/components/chat/ChatInput.tsx` | Input field with send button |
| `src/components/chat/TypingIndicator.tsx` | Animated dots shown while waiting for response |

### Hooks & API

| File | Purpose |
|------|---------|
| `src/hooks/useGPT.ts` | React hook managing chat state, message history, product data fetching, and API calls |
| `src/api/api.ts` | Axios client for backend communication (`getAIMessage`, `getProductByPartNumber`) |

### Configuration

| File | Purpose |
|------|---------|
| `src/constants/prompts.js` | System prompt defining assistant behavior, scope rules, and response patterns |
| `src/constants/scraper.js` | Scraper config: base URLs, timeouts, selectors |
| `src/constants/products.js` | Sample product data for fallback when scraping disabled |
| `src/constants/mock.js` | Mock response generator for testing without API key |
| `src/constants/server.js` | Server config: port, API settings |

### Types

| File | Purpose |
|------|---------|
| `src/types/chat/GPTMessage.ts` | Message types: `ChatRequest`, `ChatResponse`, `MessageRole` |
| `src/types/chat/ChatComponents.ts` | Props for chat components |
| `src/types/product/ProductComponents.ts` | Props for `ProductCard` |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings + chat |
| `CHROMA_URL` | Yes | ChromaDB server URL |
| `SCRAPE_TEST_MODE` | No | `true` = 15 products, `false` = ~700 products |
| `FORCE_REFRESH` | No | `true` = re-scrape and rebuild vector store |

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
│  │  │    (partSelectScraper)  │  │      │  │         (Chat.tsx)          │  │  │
│  │  └───────────┬─────────────┘  │      │  └─────────────┬───────────────┘  │  │
│  │              │                │      │                │                  │  │
│  │              ▼                │      │                ▼                  │  │
│  │  ┌─────────────────────────┐  │      │  ┌─────────────────────────────┐  │  │
│  │  │     Cheerio Parser      │  │      │  │      Express API Server     │  │  │
│  │  │   (HTML → structured)   │  │      │  │        (server.js)          │  │  │
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
│  │  │    OpenAI Embedder      │  │      │  ┌─────────────────────────────┐  │  │  │
│  │  │  (text-embedding-ada)   │  │      │  │        OpenAI LLM           │  │  │  │
│  │  └───────────┬─────────────┘  │      │  │       (gpt-4o-mini)         │  │  │  │
│  │              │                │      │  └─────────────┬───────────────┘  │  │  │
│  │              ▼                │      │                │ Completion       │  │  │
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

### Runtime Query Flow

```
┌──────┐    ┌──────────┐    ┌────────────┐    ┌─────────────┐    ┌──────────┐
│ User │───▶│ Chat UI  │───▶│ API Server │───▶│ Embed Query │───▶│ ChromaDB │
└──────┘    └──────────┘    └────────────┘    └─────────────┘    └────┬─────┘
                                   │                                  │
                                   │ Cache/rate                       │ Top-K
                                   │ limit (future)                   │ Products
                                   │                                  │
                                   ▼                                  ▼
            ┌──────────┐    ┌────────────┐    ┌─────────────┐    ┌──────────┐
            │ Response │◀───│   OpenAI   │◀───│   Prompt    │◀───│ Product  │
            │          │    │    LLM     │    │   Builder   │    │ Context  │
            └──────────┘    └────────────┘    └─────────────┘    └──────────┘
                             Latency hotspot      Token budget
```

### Design Tradeoffs

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│      CHOSE FOR CASE STUDY       │      │        AT SCALE I'D USE         │
├─────────────────────────────────┤      ├─────────────────────────────────┤
│                                 │      │                                 │
│  Local ChromaDB                 │ ───▶ │  Hosted vector DB (Pinecone)    │
│                                 │      │                                 │
│  Batch scraping on startup      │ ───▶ │  Job queue + workers            │
│                                 │      │                                 │
│  OpenAI embeddings              │ ───▶ │  Self-hosted embeddings         │
│                                 │      │                                 │
│  Single Express server          │ ───▶ │  Load balancer + replicas       │
│                                 │      │                                 │
│  Puppeteer crawl                │ ───▶ │  Distributed scraping           │
│                                 │      │                                 │
│  In-memory conversations        │ ───▶ │  Redis/PostgreSQL sessions      │
│                                 │      │                                 │
│  Mock fallback on API error     │ ───▶ │  Model fallback (Claude, etc.)  │
│                                 │      │                                 │
│  No rate limiting               │ ───▶ │  Auth + quotas + rate limits    │
│                                 │      │                                 │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

## How It Works

1. **Scraping**: On startup, `partSelectScraper.js` crawls PartSelect brand pages and extracts product metadata
2. **Parsing**: Cheerio extracts structured data (part numbers, symptoms, compatible models) from HTML
3. **Formatting**: `productToText()` converts product objects to searchable text strings
4. **Embedding**: `chromaVectorStore.js` converts text to vectors using OpenAI `text-embedding-ada-002`
5. **Storage**: Vectors stored in ChromaDB for fast similarity search
6. **Query**: User message → RAG service embeds query → searches ChromaDB → returns top 10 products
7. **Response**: Product context injected into prompt → OpenAI generates answer → returned to UI

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage --watchAll=false
```

## CI/CD

GitHub Actions runs on every push/PR to `main`:
- Linting
- Unit tests
- Build verification

## Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.2.0 | Frontend framework |
| `express` | 5.2.1 | Backend server |
| `openai` | 6.16.0 | Chat completions + embeddings |
| `chromadb` | 3.2.2 | Vector database client |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer` | 24.36.1 | Web scraping (headless Chrome) |
| `cheerio` | 1.2.0 | HTML parsing |
| `cors` | 2.8.6 | Cross-origin requests |
| `dotenv` | 17.2.3 | Environment variables |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | 1.13.4 | HTTP client |
| `marked` | 9.1.2 | Markdown rendering |
| `typescript` | 5.9.3 | Type safety |
| `tailwindcss` | 3.4.1 | Styling |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `@testing-library/react` | 13.4.0 | React component testing |
| `@testing-library/jest-dom` | 5.17.0 | DOM matchers |

