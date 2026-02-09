# Learnings / Notes

This file is a lightweight dev journal for NeuroSpace. Keep the main setup instructions in README.md; put gotchas, decisions, and experiments here.

## 2026-02-09

### 1) Uvicorn import path (`No module named 'app'`)
**Symptom**
- `ModuleNotFoundError: No module named 'app'`

**Cause**
- Running Uvicorn from the repo root with `uvicorn app.main:app` while the package lives under `backend/app/`.

**Fix**
- Run from `backend/`:
  - `cd backend`
  - `./venv/Scripts/python.exe -m uvicorn app.main:app --reload`

  Or run from repo root:
  - `./backend/venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --reload`

### 2) FFmpeg not found (`[WinError 2]`) during `/test-extract`
**Symptom**
- API returns: `ffmpeg executable not found...` or Windows raises `[WinError 2]`.

**Cause**
- `ffmpeg.exe` not on PATH for the process running Uvicorn (VS Code terminals can miss PATH updates until restarted).

**Fix**
- Install FFmpeg (Windows): `winget install --id Gyan.FFmpeg -e`
- Restart VS Code / open a new terminal.
- Verify:
  - `where ffmpeg`

**Alternative**
- Set an explicit `FFMPEG_PATH` in `backend/.env`, e.g.
  - `FFMPEG_PATH=C:\\path\\to\\ffmpeg.exe`

### 3) Backend lifecycle (Swagger → FastAPI → OS)
- Browser/Swagger UI sends an HTTP request (e.g., `POST /test-extract`).
- Uvicorn receives it on `127.0.0.1:8000` and forwards it to FastAPI.
- FastAPI parses/validates inputs (e.g., `video_path`) and calls the endpoint function.
- Your Python code runs and may invoke OS-level binaries (e.g., FFmpeg).
- The endpoint returns a Python dict → FastAPI serializes it to JSON.
- Uvicorn sends the HTTP response back → Swagger displays the result.

### 4) Day 4: The Ears (Audio Transcription)
**Goal**
- Convert extracted audio into time-aligned text segments so we can link knowledge back to timestamps (e.g., “explained neural networks at ~00:15”).

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
- First run downloads the Whisper model and loads it into memory; startup can take a minute.
- If VS Code can’t see your PATH updates, prefer using the venv python to run Uvicorn (same terminal session).

**Why singleton?**
- `transcriber` is a singleton so the Whisper model loads once (loading is expensive) and every request reuses the same in-memory model.
- `video_processor` is a singleton mostly for consistency and clean imports (it’s lightweight, but the pattern stays the same).

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
