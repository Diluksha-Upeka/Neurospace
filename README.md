<div align="center">
  <img src="assets/logo.png" alt="NeuroSpace Logo" width="300" />
  <!-- <h1>🪐 NeuroSpace</h1> -->
  <p><strong>A Multi-Modal GraphRAG Engine That Turns Lectures Into Queryable Knowledge Graphs</strong></p>

  [![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-009688.svg)](https://fastapi.tiangolo.com/)
  [![Neo4j](https://img.shields.io/badge/Neo4j-5.15+-008CC1.svg)](https://neo4j.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

<hr />

## 🎬 Demo

<div align="center">
  <video src="assets/neurospace_demo.mp4" width="100%" controls autoplay muted>
    Your browser does not support the video tag.
  </video>
  <p><em>60-second walkthrough — problem statement, live GraphRAG query, knowledge graph exploration</em></p>
</div>

<div align="center">
  <img src="assets/screenshots/dashboard_overview.png" alt="NeuroSpace Dashboard" width="100%" />
  <p><em>NeuroSpace Dashboard — Knowledge Graph, Chat Assistant & Ingestion Pipeline in one view</em></p>
</div>

This project runs locally via Docker. To try it:

```bash
git clone https://github.com/Diluksha-Upeka/Neurospace.git
cd Neurospace && docker compose up --build -d
# Open http://localhost:3000
```

---

## 🔥 Problem Statement

Educational content — video lectures, dense PDFs, scattered notes — is consumed **linearly** but understood **relationally**. Traditional search treats documents as flat text, missing the conceptual links that make knowledge stick.

**NeuroSpace** solves this by:
1. **Ingesting** multi-modal content (PDFs, video lectures with audio transcription)
2. **Building** a knowledge graph of interconnected concepts in Neo4j
3. **Answering** questions with graph-aware, citation-backed responses using a hybrid **GraphRAG** retrieval pipeline

Instead of keyword matches, you get structurally grounded answers that trace back to exact pages and timestamps.

---

## 🏗️ Architecture

### High-Level System Flow

```mermaid
graph TD
  subgraph Client ["🖥️ Frontend — Next.js"]
    UI[Dashboard]
    Upload[Upload Manager]
  end

  subgraph Server ["⚙️ Backend — FastAPI"]
    API[API Gateway]
    Ingest[Ingestion Pipeline]
    Retriever[GraphRAG Retriever]
  end

  subgraph Data ["💽 Storage & AI"]
    Neo4j[(Neo4j Graph DB)]
    Storage[(MinIO S3)]
    Groq[Groq LLM]
    Embed[Local Embeddings]
  end

  UI --> API
  API --> Ingest & Retriever
  Ingest --> Storage & Neo4j & Groq & Embed
  Retriever --> Neo4j & Embed & Groq
```

### Multi-Modal Ingestion Pipeline

When a video or PDF is uploaded, NeuroSpace parallelizes extraction and structures the content into relational graph nodes.

```mermaid
sequenceDiagram
  participant U as User
  participant S as NeuroSpace Backend
  participant AI as Groq / Whisper
  participant G as Neo4j

  U->>S: Uploads Video / PDF
  S->>S: Extract Audio / Chunk Text
  S->>AI: Transcribe & Synthesize
  AI-->>S: Return Parsed Insights
  loop Graph Construction
    S->>G: Create Context Nodes
    S->>G: Map Edge Relationships
  end
  S-->>U: Knowledge Graph Ready
```

### GraphRAG Query Pipeline

The hybrid retrieval engine combines two strategies before feeding context to the LLM:

```mermaid
graph LR
  Q[User Question] --> SYN[LLM Synonym Retriever]
  Q --> VEC[Vector Context Retriever]

  SYN -->|"Graph traversal<br/>via generated synonyms"| NEO[(Neo4j<br/>Property Graph)]
  VEC -->|"Top-k cosine similarity<br/>all-MiniLM-L6-v2"| NEO

  NEO --> MERGE[Merge & Deduplicate<br/>Source Nodes]
  MERGE --> PROMPT["Anti-Hallucination<br/>Prompt Template"]
  PROMPT --> LLM[Groq Llama 3.1 70B]
  LLM --> FILTER[Citation Filter]
  FILTER --> ANS["Answer +<br/>Cited Sources Only"]
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| ----- | ------------ |
| **Frontend** | React, Next.js 14, TypeScript, TailwindCSS |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn |
| **Data & Storage** | Neo4j (Property Graph + Vector Index), MinIO (S3 Object Storage) |
| **AI / ML** | LlamaIndex (GraphRAG), Groq Llama 3.3 70B, Faster-Whisper, HuggingFace `all-MiniLM-L6-v2` |
| **Infrastructure** | Docker, Docker Compose |

---

## ✨ Key Features

### 🎥 Multi-Modal Ingestion
Process PDFs into recursive text chunks and MP4 videos into time-aligned, transcribed knowledge graph nodes.

<div align="center">
  <img src="assets/screenshots/upload_flow.png" alt="Upload Flow — drag-and-drop PDF/MP4 ingestion with real-time processing" width="90%" />
  <p><em>Upload PDFs or MP4 videos — NeuroSpace handles the rest</em></p>
</div>

### 🧠 Hybrid GraphRAG Retrieval
Combines **Vector Similarity Search** (cosine distance on embeddings) with **LLM Synonym Graph Traversal** for pinpoint, context-aware answers with inline source citations.

<div align="center">
  <img src="assets/screenshots/chat_indexing_algorithms.png" alt="Chat — graph-aware response with inline citations" width="350" />
  <p><em>Ask a question → get a cited, graph-grounded answer</em></p>
</div>

<details>
<summary>More chat examples</summary>
<br />
<div align="center">
  <img src="assets/screenshots/chat_language_model_problems.png" alt="Chat — follow-up query with page-level citations" width="350" />
  <br /><br />
  <img src="assets/screenshots/chat_language_model_types.png" alt="Chat — Language Model Types" width="350" />
</div>
</details>

### 🖥️ Interactive Knowledge Graph
Explore the generated knowledge graph visually. Click on nodes and edges to inspect concepts. Open in a dedicated full-screen tab for deep exploration.

<div align="center">
  <img src="assets/screenshots/fullscreen_graph.png" alt="Full-screen knowledge graph — 223 nodes, 414 edges" width="90%" />
  <p><em>Full-screen graph explorer — 223 nodes, 414 edges, all interconnected</em></p>
</div>

### 📄 In-App Document Viewer
Click any citation to jump directly to the referenced page inside the embedded PDF viewer — no context-switching.

<div align="center">
  <img src="assets/screenshots/document_viewer.png" alt="Document Viewer — PDF rendered inline with page navigation" width="90%" />
  <p><em>Built-in PDF viewer with synchronized chat and graph panels</em></p>
</div>

### ⚡ Blazing Fast Inference
Groq's Llama 3.1 70B delivers instant responses. Local HuggingFace embeddings (`all-MiniLM-L6-v2`) keep vector search zero-cost with no API calls.

### 🛡️ Anti-Hallucination Guardrails
A strict prompt template + post-processing citation filter grounds every answer in retrieved context. The system cites exact sources (`[filename, page X]` or `[filename, Xs-Ys]`) and strips uncited claims. See [EVALUATION.md](EVALUATION.md) for measured hallucination rejection rates.

### 📦 Fully Containerized
One `docker compose up` sets up the entire pipeline — Frontend, Backend API, MinIO Storage, and Neo4j Database.

### 🕸️ Neo4j Graph Database
579 nodes and 1,000+ semantic relationships stored in Neo4j. The full entity-relationship schema is explorable via the Neo4j Browser.

<div align="center">
  <img src="assets/screenshots/neo4j_browser.png" alt="Neo4j Browser — full knowledge graph with entity labels and relationship types" width="90%" />
  <p><em>Neo4j Browser — 563 nodes, 971 relationships powering the knowledge graph</em></p>
</div>

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- A [Groq API Key](https://console.groq.com/) (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/Diluksha-Upeka/Neurospace.git
cd Neurospace
```

### 2. Configure Environment Variables
Inside the `backend/` directory, create a `.env` file:
```env
# LLM & Embeddings (Required)
GROQ_API_KEY=your_groq_api_key_here

# Graph Database (Neo4j)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123

# Object Storage (MinIO / S3)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
S3_BUCKET_NAME=neuro-uploads
S3_ENDPOINT_URL=http://localhost:9000
```
> A `.env.example` file is included for reference.

### 3. Launch with Docker
```bash
docker compose up --build -d
```
> Initial startup may take a few minutes as Docker downloads models and OS packages.

### 4. Access the Application
| Service | URL | Credentials |
|---------|-----|-------------|
| 🎛️ **NeuroSpace Web UI** | [localhost:3000](http://localhost:3000) | — |
| 🕸️ **Full-Screen Graph** | [localhost:3000/graph/fullscreen](http://localhost:3000/graph/fullscreen) | — |
| 🔌 **Backend API (Swagger)** | [localhost:8000/docs](http://localhost:8000/docs) | — |
| 🧭 **Neo4j Browser** | [localhost:7474](http://localhost:7474) | `neo4j` / `password123` |
| 📦 **MinIO Console** | [localhost:9001](http://localhost:9001) | `minioadmin` / `minioadmin` |

### Local Development (Without Docker)

<details>
<summary>Click to expand manual setup instructions</summary>

**Backend:**
```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows PowerShell
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload
```
> Requires `ffmpeg` on your system PATH for video extraction.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

</details>

---

## 📊 Evaluation

NeuroSpace includes a built-in evaluation framework that measures retrieval quality, hallucination rates, and latency across 50 test questions. See [EVALUATION.md](EVALUATION.md) for detailed results and methodology.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built by <a href="https://github.com/Diluksha-Upeka">Diluksha Upeka</a> · Last Updated: July 2026</sub>
</div>