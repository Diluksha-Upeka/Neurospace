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
