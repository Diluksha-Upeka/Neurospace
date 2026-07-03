"""
NeuroSpace Evaluation — Corpus Ingestion Script
=================================================
Uploads all test corpus PDFs to the NeuroSpace /ingest endpoint.

Usage:
    Ensure backend is running, then:
    python eval/ingest_corpus.py

Note: Ingestion takes ~5 minutes per document due to LLM rate limiting
      during knowledge graph construction.
"""

import os
import sys
import time
import requests

API_URL = "http://localhost:8000"
CORPUS_DIR = os.path.join(os.path.dirname(__file__), "test_corpus")


def ingest_file(filepath: str, filename: str) -> bool:
    """Upload a single file to the /ingest endpoint."""
    # Determine MIME type
    if filepath.endswith(".pdf"):
        mime_type = "application/pdf"
    elif filepath.endswith(".mp4"):
        mime_type = "video/mp4"
    else:
        print(f"  ⚠️ Unsupported file type: {filename}")
        return False

    with open(filepath, "rb") as f:
        files = {"file": (filename, f, mime_type)}
        try:
            resp = requests.post(f"{API_URL}/ingest", files=files, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                print(f"  ✅ {filename}: {data.get('message', 'Accepted')}")
                return True
            else:
                print(f"  ❌ {filename}: HTTP {resp.status_code} - {resp.text[:100]}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"  ❌ {filename}: Connection error - {e}")
            return False


def main():
    # Check API is running
    try:
        health = requests.get(f"{API_URL}/", timeout=5)
        print(f"✅ API healthy: {health.json()}")
    except requests.exceptions.RequestException:
        print(f"❌ Cannot reach API at {API_URL}")
        print("   Start the backend: cd backend && .\\venv\\Scripts\\python.exe -m uvicorn app.main:app --reload")
        sys.exit(1)

    # Check corpus exists
    if not os.path.exists(CORPUS_DIR):
        print(f"❌ Test corpus not found at: {CORPUS_DIR}")
        print("   Generate it first: python eval/create_test_corpus.py")
        sys.exit(1)

    # Get all PDFs
    pdfs = sorted([f for f in os.listdir(CORPUS_DIR) if f.endswith(".pdf")])
    if not pdfs:
        print("❌ No PDF files found in test_corpus/")
        sys.exit(1)

    print(f"\n📁 Found {len(pdfs)} documents to ingest:")
    for pdf in pdfs:
        print(f"   • {pdf}")

    print(f"\n⚠️  Ingestion will take ~{len(pdfs) * 5} minutes (rate-limited graph construction)")
    print(f"   Watch the backend terminal for progress.\n")

    # Ingest each file
    success = 0
    for i, pdf in enumerate(pdfs):
        filepath = os.path.join(CORPUS_DIR, pdf)
        print(f"\n[{i+1}/{len(pdfs)}] Ingesting {pdf}...")
        if ingest_file(filepath, pdf):
            success += 1

        # Wait between files to avoid overwhelming the background processor
        if i < len(pdfs) - 1:
            print(f"   ⏳ Waiting 5 seconds before next file...")
            time.sleep(5)

    print(f"\n{'='*50}")
    print(f"  Ingestion complete: {success}/{len(pdfs)} files submitted")
    print(f"  ⚠️  Background processing is still running!")
    print(f"  Watch the backend terminal for 'Graph built successfully' messages.")
    print(f"  Wait for ALL documents to finish before running evaluations.")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
