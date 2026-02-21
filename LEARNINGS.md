# Learnings / Notes 

A compact dev journal for NeuroSpace - keep operational instructions in README.md and record discoveries, decisions, and experiments here.

## 2026-02-13

### 1) Uvicorn import path - `No module named 'app'` 

**Symptom**
- `ModuleNotFoundError: No module named 'app'`

**Cause**
- Running Uvicorn from the repo root with `uvicorn app.main:app` while the package lives under `backend/app/`.

**Fix**
- Run from `backend/`:

```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

- Or from the repo root (point Uvicorn at `backend`):

```bash
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload
```

### 2) FFmpeg missing during `/test-extract` — `[WinError 2]`

**Symptom**
- API returns: `ffmpeg executable not found...` or Windows raises `[WinError 2]`.

**Cause**
- `ffmpeg.exe` not on PATH for the process running Uvicorn (VS Code terminals can miss PATH updates until restarted).

**Fix**
- Install FFmpeg (Windows):

```powershell
winget install --id Gyan.FFmpeg -e
```

- Restart VS Code / open a new terminal and verify:

```powershell
where ffmpeg
```

**Alternative**
- If you prefer not to update PATH, set the full executable path in `backend/.env`:

```env
FFMPEG_PATH=C:\\path\\to\\ffmpeg.exe
```

### 3) Backend request lifecycle (quick mental model) 

- Browser / Swagger UI sends an HTTP request (e.g., `POST /test-extract`).
- Uvicorn receives the request and forwards it to FastAPI.
- FastAPI validates inputs and calls your endpoint function.
- Your code runs (may call OS binaries like FFmpeg or model inference).
- The endpoint returns a Python object → FastAPI serializes it to JSON.
- Uvicorn sends the HTTP response back to the client (Swagger shows the result).

### 4) Day 4 — The Ears (Audio transcription) 

**Goal**
- Produce time-aligned text segments from audio so we can reference precise timestamps (e.g., “neural networks explained at ~00:15”).

**What we added**
- Faster-Whisper dependency in `backend/requirements.txt`.
- Structured schema objects:
  - `TranscriptSegment` (`start`, `end`, `text`)
  - `TranscriptionResult` (`filename`, `segments`, `language`)
- A singleton transcription service that loads the model once and reuses it.
- A test endpoint: `POST /test-transcribe?audio_path=...`

**Files**
- `backend/app/schemas.py`
- `backend/app/services/transcription.py`
- `backend/app/main.py`

**Install & run (Windows)**
- Install deps into venv:
  - `backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt`
- Run API (IMPORTANT: run from `backend/` so `app.*` imports resolve):
  - `cd backend`
  - `.\venv\Scripts\python.exe -m uvicorn app.main:app --reload`

**Test**
- Open Swagger: `http://127.0.0.1:8000/docs`
- Call `POST /test-transcribe` with:
  - `audio_path=C:\full\path\to\your.mp3`
- Expected: JSON response with `segments[]`, each containing `start`/`end` seconds + `text`.

**Gotchas**
- The first run downloads and loads the Whisper model — startup can take a minute.
- If PATH changes aren’t visible in VS Code, run the server from a new terminal that has the updated environment.

**Why singleton?**
- `transcriber` is a singleton so the Whisper model is loaded once (expensive to initialize) and all requests reuse the same in-memory model.
- `video_processor` follows the same pattern for consistency (it’s lightweight but the pattern keeps imports and usage simple).

---

## 2026-02-13

### 1) Missing dependencies: `ModuleNotFoundError: No module named 'boto3'`

**Symptom**
- Uvicorn fails to start with `ModuleNotFoundError: No module named 'boto3'`.

**Cause**
- `boto3` is used for MinIO/S3 storage but wasn't listed in `backend/requirements.txt`.

**Fix**
- Add `boto3` to `backend/requirements.txt`.
- Install into venv: `backend\venv\Scripts\python -m pip install boto3`.
- Also add `python-multipart` for FastAPI file uploads.

**Notes**
- Run `pip freeze > backend/requirements.txt` to sync after installs.

### 2) MinIO upload skipped for videos: `Could not reach MinIO/S3 endpoint`

**Symptom**
- Video processing completes but MinIO upload fails with endpoint unreachable error.
- PDFs upload fine, videos don't appear in MinIO console.

**Cause**
- MinIO container might not be fully ready when the background task starts.
- IPv6 localhost resolution issues on Windows (MinIO bound to `0.0.0.0:9000` but boto3 uses `localhost`).

**Fix**
- Ensure Docker Desktop is running and `docker compose up -d` completes.
- Use `http://127.0.0.1:9000` instead of `localhost` in config.
- Updated `worker.py` to retry MinIO upload at the end of processing if initial attempt failed.

**Notes**
- Test MinIO connectivity: `curl http://127.0.0.1:9000/minio/health/ready`
- Videos now upload reliably after processing completes.

### 3) Ingestion test fails: `Only .pdf and .mp4 supported for now.`

**Symptom**
- `test_ingestion.py` fails with 400 error even for valid MP4/PDF files.

**Cause**
- Script was overwriting MIME type with `"application/octet-stream"` instead of using the detected type.

**Fix**
- Removed the duplicate `files = {"file": (filename, f, "application/octet-stream")}` line in `test_ingestion.py`.
- Now correctly sends `"video/mp4"` for MP4s and `"application/pdf"` for PDFs.

**Notes**
- Backend validation expects exact MIME types: `["application/pdf", "video/mp4"]`.

---

## 2026-02-21

### 1) Semantic Search and RAG Implementation Notes

**Overview**
- NeuroSpace implements semantic search via vector embeddings, but full RAG (Retrieval-Augmented Generation) is not yet complete—only retrieval is implemented.

**Embeddings**
- **Model**: Local HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vectors).
- **Where**: Runs on CPU, no API calls required.
- **Usage**: Converts text chunks (from PDFs/videos) and user queries into vectors for similarity comparison.

**Similarities**
- **Engine**: Neo4j database using cosine similarity.
- **How**: Query vector sent via Cypher: `CALL db.index.vector.queryNodes('chunk_vector_index', $limit, $embedding)`.
- **Storage**: Vectors stored as node properties in Neo4j graph database (not Pinecone or external vector DB).

**RAG Status**
- **Retrieval**: Implemented—`vector_search.search_similar_chunks()` embeds query, finds top similar chunks in Neo4j, returns with scores.
- **Generation**: Not implemented—no LLM endpoint to generate answers from retrieved chunks.
- **LLM Usage**: Groq (online, Llama 3.1-8B-Instant) used for entity extraction in graph building, not for query answering.
- **Local vs Online**: Embeddings local; LLM online via API.

**Test Script Fix**
- **Symptom**: `ModuleNotFoundError: No module named 'app'` when running `test_vector.py` from repo root.
- **Cause**: Script imports `from app.services.vector_search import vector_search`, but `app` is in `backend/app/`.
- **Fix**: Added `sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))` to prepend `backend` to Python path.

**Notes**
- To add full RAG, implement an endpoint that retrieves chunks and sends them + query to Groq for generation.
- Neo4j handles both graph (entities/relations) and vector storage, keeping everything local.

### 2) Query Engine Initialization Errors

**Symptom**
- `AttributeError: 'Neo4jGraphStore' object has no attribute 'supports_vector_queries'` when initializing `QueryService`.

**Cause**
- In `query_engine.py`, `PropertyGraphIndex.from_existing` was passed `property_graph_store=self.storage_context.graph_store` (Neo4jGraphStore), but it needs `self.storage_context.property_graph_store` (Neo4jPropertyGraphStore).

**Fix**
- Changed to `property_graph_store=self.storage_context.property_graph_store`.
- Installed missing packages: `llama-index-llms-groq`, `llama-index-embeddings-huggingface`.
- Upgraded `llama-index-graph-stores-neo4j` to latest version.

**Notes**
- Full RAG now works: Retrieves similar chunks via vector search, generates answers using Groq LLM.
- Updated `requirements.txt` with `pip freeze`.

### 3) Query Method Name Mismatch

**Symptom**
- `AttributeError: 'QueryService' object has no attribute 'query'` when running `test_query.py`.

**Cause**
- Test script calls `query_service.query(question)`, but the method was named `ask`.

**Fix**
- Renamed `ask` method to `query` in `query_engine.py` to match the test expectations.

**Notes**
- The `query` method returns a dict with 'answer' (generated text) and 'sources' (retrieved chunks with metadata).
- RAG pipeline is now fully functional.

---

## Template

### Title
**Symptom**
- 

**Cause**
- 

**Fix**
- 

**Notes**
- 
