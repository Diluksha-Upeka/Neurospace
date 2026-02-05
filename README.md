# NeuroSpace

NeuroSpace is a full-stack system for storing, connecting, and querying educational content:

- Videos (MP4)
- PDFs / Documents
- Concepts / Topics

It combines:

- **Neo4j** for graph relationships
- **MinIO** for S3-compatible file storage
- **FastAPI** for the backend API
    
## Architecture

```mermaid

	U[User / Client] -->|HTTP| API[FastAPI Backend]
	API -->|Bolt| NEO[(Neo4j)]
	API -->|S3 API| MINIO[(MinIO)]
```

## Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Git

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

Health check endpoint:

- http://127.0.0.1:8000

## Services & Ports

| Service | Container | Ports | Notes |
|---|---|---|---|
| Neo4j | `neuro_graph` | `7474` (HTTP), `7687` (Bolt) | Default auth: `neo4j/password123` |
| MinIO | `neuro_files` | `9000` (API), `9001` (Console) | Default auth: `minioadmin/minioadmin` |

## Configuration

The backend reads environment variables via `python-dotenv`.

Create `backend/.env` (optional) with:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
```

Notes:

- `NEO4J_URI` uses `bolt://` (not HTTP).
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

- Day 1: Infrastructure setup with Docker Compose (Neo4j + MinIO)
- Day 2: Backend skeleton with FastAPI (Neo4j driver + health check)

## Last Updated

**05th of February 2026**
