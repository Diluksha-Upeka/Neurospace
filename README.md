<div align="center">
  <img src="assets/logo.png" alt="NeuroSpace" width="400">
</div>

# NeuroSpace: Multi-Modal RAG Engine

## Ingestion Pipeline

### Features
- **Video Processing:** Uses `FFmpeg` and `Faster-Whisper` to extract time-aligned text from MP4s.
- **Document Processing:** Uses `PyPDF` and `LangChain` to chunk PDFs recursively.
- **Storage:** Local S3-compatible object storage using `MinIO`.
- **API:** Asynchronous `FastAPI` endpoints with Background Tasks.

### How to Run
1. `docker-compose up -d` (Starts Neo4j & MinIO)
2. `cd backend && uvicorn app.main:app --reload`
3. POST file to `http://localhost:8000/ingest`

Dev notes / learnings: see [LEARNINGS.md](LEARNINGS.md).

NeuroSpace is a full-stack system for storing, connecting, and querying educational content:

- Videos (MP4)
- PDFs / Documents
- Concepts / Topics

It combines:

- **Neo4j** for graph relationships
- **MinIO** for S3-compatible file storage
- **FastAPI** for the backend API
- **Groq** for fast LLM inference (Llama 3.1)
- **HuggingFace** for local embeddings (no API calls)
    
## Architecture

```mermaid
graph LR
  U[User / Client] -->|HTTP| API[FastAPI Backend]
  API -->|Bolt| NEO[(Neo4j)]
  API -->|S3 API| MINIO[(MinIO)]
```

### Diagram 1: System Overview

```mermaid
graph TD
  subgraph Client ["🖥️ Frontend (Next.js)"]
    UI[User Interface]
    Upload[Upload Portal]
    Chat[Chat Interface]
  end

  subgraph Server ["⚙️ Backend (FastAPI + Agents)"]
    API[API Gateway]
    Ingest[Ingestion Agent]
    Retriever[GraphRAG Retriever]
    Groq[Groq LLM]
    Embed[Local Embeddings]
  end

  subgraph Data ["💽 Knowledge & Storage"]
    Neo4j[(Neo4j Graph DB)]
    Storage[File Storage]
  end

  %% Flows
  UI --> API
  Upload --> API
  Chat --> API

  API --> Ingest
  API --> Retriever
    
  Ingest -->|Parse PDF/Video| Groq
  Ingest -->|Create Nodes| Neo4j
  Ingest -->|Embed Chunks| Embed
    
  Retriever -->|Hybrid Search| Neo4j
  Retriever -->|Vector Search| Embed
  Retriever --> Groq
    
  Groq -->|Synthesized Answer| API
```

### Diagram 2: The "Multi-Modal Ingestion" Flow


```mermaid
sequenceDiagram
  participant U as User
  participant S as System (NeuroSpace)
  participant AI as Vision/LLM Model
  participant G as Graph DB

  U->>S: Uploads Video Lecture (MP4)
  S->>S: Extracts Audio (Whisper)
  S->>S: Extracts Frames (OpenCV)
    
  par Parallel Processing
    S->>AI: Transcribe Audio
    S->>AI: Describe Key Frames
  end
    
  AI-->>S: Returns Text & Descriptions
    
  loop Graph Construction
    S->>AI: Identify Concepts (Nodes)
    S->>AI: Identify Relationships (Edges)
    S->>G: Create Node: "Concept A"
    S->>G: Create Edge: "Concept A" -> "Timestamp 04:20"
  end
    
  S-->>U: Processing Complete. Graph Ready.
```

## Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Git
- FFmpeg (required for `/test-extract` audio extraction)
- Faster-Whisper (for on-device audio transcription)
- pypdf + langchain-text-splitters (for PDF extraction & chunking)
- **Groq API Key** (get from https://console.groq.com/)

Notes: Install Python libraries into the `backend/venv` (see Quickstart).

## Quickstart

### 1) Clone the repository

```bash
git clone https://github.com/Diluksha-Upeka/Neurospace.git
cd neurospace
```

### 2) Start infrastructure (Neo4j + MinIO)

```bash
docker compose up -d
```

Open dashboards:

- Neo4j Browser: http://localhost:7474
- MinIO Console: http://localhost:9001

Create a MinIO bucket named `raw-uploads` (via the MinIO Console).

### 3) Run the backend API (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Note:** The first time you run the backend, it will download the HuggingFace embedding model (~100MB). This may take 30-60 seconds.

If you prefer to run from the repository root (no `cd backend`), use:

```bash
uvicorn backend.app.main:app --reload
```

Health check endpoint:

- http://127.0.0.1:8000

Swagger API documentation:

- http://127.0.0.1:8000/docs

Testing endpoints (manual checks)

- POST `/test-extract?video_path=...` — Extract audio from a video (requires FFmpeg). Use Swagger or:

```bash
curl -X POST "http://127.0.0.1:8000/test-extract?video_path=C:\\path\\to\\video.mp4"
```

- POST `/test-transcribe?audio_path=...` — Transcribe `.mp3` audio into time-aligned segments (Faster-Whisper). Use Swagger or:

```bash
curl -X POST "http://127.0.0.1:8000/test-transcribe?audio_path=C:\\path\\to\\audio.mp3"
```

- POST `/test-pdf?pdf_path=...` — Extract & chunk PDF text (pypdf + text splitters). Use Swagger or:

```bash
curl -X POST "http://127.0.0.1:8000/test-pdf?pdf_path=C:\\path\\to\\doc.pdf"
```


## Services & Ports

| Service | Container | Ports | Notes |
|---|---|---|---|
| Neo4j | `neuro_graph` | `7474` (HTTP), `7687` (Bolt) | Default auth: `neo4j/password123` |
| MinIO | `neuro_files` | `9000` (API), `9001` (Console) | Default auth: `minioadmin/minioadmin` |

## Configuration

The backend reads environment variables via `python-dotenv`.

Create `backend/.env` with:

```env
# Neo4j Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123

# Groq API (required for LLM inference)
GROQ_API_KEY=your_groq_api_key_here

# Optional: if ffmpeg is not on PATH, set the full path to ffmpeg.exe
# FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
```

Notes:

- `NEO4J_URI` uses `bolt://` (not HTTP).
- Get your `GROQ_API_KEY` from https://console.groq.com/
- If you later run the backend inside Docker on the same Compose network, you’ll likely want `NEO4J_URI=bolt://neo4j:7687`.

## Common Commands

| Task | Command |
|---|---|
| Start infra | `docker compose up -d` |
| Stop infra | `docker compose down` |
| Follow Neo4j logs | `docker logs -f neuro_graph` |
| Follow MinIO logs | `docker logs -f neuro_files` |
| Run backend (from `backend/`) | `uvicorn app.main:app --reload` |

## Current Progress
Features implemented so far:
- Video audio extraction (FFmpeg)
- Audio transcription (Faster-Whisper)
- PDF text extraction & chunking (pypdf + LangChain)
- Graph storage (Neo4j)
- Local embeddings (HuggingFace `all-MiniLM-L6-v2`)
- Fast LLM inference (Groq Llama 3.1)
- API endpoints for testing ingestion steps
- Basic graph queries (see `QUERIES.md`)

## Architecture Highlights

- **Groq Llama 3.1**: Blazing fast LLM inference for entity extraction
- **Local Embeddings**: HuggingFace `all-MiniLM-L6-v2` runs on CPU, zero API costs
- **Neo4j 5.26**: Latest version with advanced graph capabilities
- **Rate Limit Free**: No more API quota issues for embeddings
## Last Updated

**18th of February 2026**
