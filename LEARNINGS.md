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
