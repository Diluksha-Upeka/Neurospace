# NeuroSpace Evaluation Framework

This directory contains the evaluation infrastructure for measuring NeuroSpace's GraphRAG retrieval quality, hallucination rate, and latency.

## Quick Start (Manual — No Docker)

### Prerequisites
- **Neo4j** running locally (either via Docker or standalone install)
- **Python 3.11+** with the backend's virtual environment
- **Groq API Key** configured in `backend/.env`

### Step-by-step

```bash
# 1. Install eval dependencies (from project root)
cd backend
.\venv\Scripts\python.exe -m pip install fpdf2 requests
cd ..

# 2. Generate test corpus PDFs
cd backend
.\venv\Scripts\python.exe ..\eval\create_test_corpus.py
cd ..

# 3. Start Neo4j (via existing docker-compose config to ensure APOC plugin loads correctly)
docker compose up -d neo4j

# 4. Start the backend (new terminal)
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload

# 5. Ingest the test corpus (new terminal, from project root)
#    Upload each PDF via the /ingest endpoint:
cd backend
.\venv\Scripts\python.exe ..\eval\ingest_corpus.py

# 6. Wait for ingestion to complete (~5 min per document due to rate limiting)
#    Watch the backend terminal for "Graph built successfully" messages

# 7. Run the evaluation
cd backend
.\venv\Scripts\python.exe ..\eval\run_eval.py --mode hybrid

# 8. Run the comparison (hybrid vs vector-only)
cd backend
.\venv\Scripts\python.exe ..\eval\compare_retrieval.py
```

### PowerShell One-liner (after steps 1-6 are done)
```powershell
# Run hybrid eval
cd backend; .\venv\Scripts\python.exe ..\eval\run_eval.py --mode hybrid; cd ..

# Run full comparison
cd backend; .\venv\Scripts\python.exe ..\eval\compare_retrieval.py; cd ..
```

## File Structure

```
eval/
├── README.md                 # This file
├── create_test_corpus.py     # Generates 4 AI/ML test PDFs
├── ingest_corpus.py          # Uploads test PDFs to NeuroSpace
├── questions.json            # 50-question evaluation set
├── metrics.py                # Metric computation functions
├── run_eval.py               # Main evaluation runner
├── compare_retrieval.py      # Hybrid vs. vector-only comparison
├── test_corpus/              # Generated test PDFs (gitignored)
└── results/                  # Evaluation results (gitignored)
```

## Metrics Measured

| Metric | Description |
|--------|-------------|
| **Answer Groundedness** | % of answerable questions that have cited sources |
| **Hallucination Rate** | % of unanswerable questions that get fabricated answers |
| **Source Precision** | Of cited sources, % that match expected sources |
| **Source Recall** | Of expected sources, % that were actually cited |
| **Keyword Coverage** | % of expected answer keywords found in responses |
| **Latency (p50, p95)** | Wall-clock response time per query |

## Test Corpus

4 AI/ML documents (~1500-2000 words each):
1. **Fundamentals of RAG** — RAG pipeline, embeddings, chunking, advanced techniques
2. **Neural Networks Essentials** — Perceptrons, training, CNNs/RNNs, regularization
3. **Transformer Architecture** — Attention, encoder/decoder, BERT/GPT/Llama, scaling
4. **Knowledge Graphs in AI** — Graph databases, Neo4j, Cypher, GraphRAG, entity extraction

## Question Categories

| Category | Count | Purpose |
|----------|-------|---------|
| Single-hop | 25 | Answer is in one chunk — tests basic retrieval |
| Multi-hop | 10 | Answer requires linking concepts across documents |
| Cross-document | 5 | Answer spans information from multiple files |
| Unanswerable | 10 | Tests hallucination guardrails (should be refused) |

## CLI Options

```bash
# Run eval with specific mode
python eval/run_eval.py --mode hybrid          # default
python eval/run_eval.py --mode vector_only     # baseline comparison
python eval/run_eval.py --mode synonym_only    # graph-only

# Custom API URL and delay
python eval/run_eval.py --api-url http://localhost:8000 --delay 3

# Full comparison
python eval/compare_retrieval.py --api-url http://localhost:8000 --delay 3
```
