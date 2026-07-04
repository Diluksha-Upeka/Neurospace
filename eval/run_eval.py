"""
NeuroSpace Evaluation — Main Eval Runner
==========================================
Sends each question from questions.json to the NeuroSpace /chat API,
records responses, computes metrics, and outputs results.

Usage:
    1. Ensure backend is running: cd backend && uvicorn app.main:app --reload
    2. Ensure Neo4j is running with ingested test corpus
    3. Run: python eval/run_eval.py

Options:
    --api-url       Backend URL (default: http://localhost:8000)
    --mode          Retrieval mode: hybrid, vector_only, synonym_only (default: hybrid)
    --output-dir    Output directory (default: eval/results)
    --delay         Delay between queries in seconds (default: 20, for Groq rate limits)
"""

import json
import os
import sys
import time
import argparse
from datetime import datetime

import requests

# Add project root to path for imports
sys.path.insert(0, os.path.dirname(__file__))
from metrics import compute_all_metrics


def load_questions(questions_path: str) -> list[dict]:
    """Load the evaluation question set."""
    with open(questions_path, "r", encoding="utf-8") as f:
        return json.load(f)


def query_neurospace(api_url: str, question: str, mode: str = "hybrid") -> dict:
    """
    Send a question to the NeuroSpace /chat endpoint and record the response + latency.
    """
    payload = {"message": question, "mode": mode}

    start = time.perf_counter()
    try:
        resp = requests.post(f"{api_url}/chat", json=payload, timeout=120)
        elapsed_ms = (time.perf_counter() - start) * 1000

        if resp.status_code == 200:
            data = resp.json()
            return {
                "answer": data.get("answer", ""),
                "sources": data.get("sources", []),
                "latency_ms": round(elapsed_ms, 1),
                "api_latency_ms": data.get("latency_ms"),  # Backend-measured latency if available
                "status": "success",
            }
        else:
            return {
                "answer": f"API Error: {resp.status_code} - {resp.text[:200]}",
                "sources": [],
                "latency_ms": round(elapsed_ms, 1),
                "status": "error",
            }
    except requests.exceptions.RequestException as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return {
            "answer": f"Connection Error: {str(e)}",
            "sources": [],
            "latency_ms": round(elapsed_ms, 1),
            "status": "connection_error",
        }


def run_evaluation(
    api_url: str = "http://localhost:8000",
    mode: str = "hybrid",
    questions_path: str = None,
    output_dir: str = None,
    delay: float = 20.0,
) -> dict:
    """
    Run the full evaluation pipeline.
    """
    # Defaults
    if questions_path is None:
        questions_path = os.path.join(os.path.dirname(__file__), "questions.json")
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "results")

    os.makedirs(output_dir, exist_ok=True)

    # Load questions
    questions = load_questions(questions_path)
    print(f"\n{'='*60}")
    print(f"  NeuroSpace Evaluation Runner")
    print(f"  Mode: {mode}")
    print(f"  Questions: {len(questions)}")
    print(f"  API: {api_url}")
    print(f"{'='*60}\n")

    # Check API health
    try:
        health = requests.get(f"{api_url}/", timeout=5)
        if health.status_code != 200:
            print(f"❌ API health check failed: {health.status_code}")
            return {}
        print(f"✅ API is healthy: {health.json()}\n")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot reach API at {api_url}: {e}")
        print("   Make sure the backend is running: cd backend && uvicorn app.main:app --reload")
        return {}

    # Run queries
    results = []
    errors = 0

    for i, q in enumerate(questions):
        qid = q["id"]
        question_text = q["question"]
        category = q["category"]
        answerable = q["answerable"]

        print(f"  [{i+1}/{len(questions)}] Q{qid} ({category}): {question_text[:60]}...")

        response = query_neurospace(api_url, question_text, mode)

        result = {
            "id": qid,
            "question": question_text,
            "category": category,
            "answerable": answerable,
            "expected_answer_keywords": q.get("expected_answer_keywords", []),
            "expected_sources": q.get("expected_sources", []),
            "actual_answer": response["answer"],
            "actual_sources": response["sources"],
            "latency_ms": response["latency_ms"],
            "api_latency_ms": response.get("api_latency_ms"),
            "status": response["status"],
        }
        results.append(result)

        if response["status"] != "success":
            errors += 1
            print(f"    ⚠️  {response['status']}: {response['answer'][:80]}")
        else:
            answer_preview = response["answer"][:80].replace("\n", " ")
            n_sources = len(response["sources"])
            print(f"    ✅ {response['latency_ms']:.0f}ms | {n_sources} sources | {answer_preview}...")

        # Rate limiting delay
        if i < len(questions) - 1:
            time.sleep(delay)

    # Compute metrics
    print(f"\n{'='*60}")
    print(f"  Computing Metrics...")
    print(f"{'='*60}\n")

    metrics = compute_all_metrics(results)

    # Build output
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output = {
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "mode": mode,
            "api_url": api_url,
            "total_questions": len(questions),
            "errors": errors,
        },
        "metrics": metrics,
        "results": results,
    }

    # Save raw results
    results_file = os.path.join(output_dir, f"eval_{mode}_{timestamp}.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"  📄 Raw results saved: {results_file}")

    # Generate summary markdown
    summary_file = os.path.join(output_dir, f"eval_summary_{mode}_{timestamp}.md")
    summary_md = generate_summary_markdown(output)
    with open(summary_file, "w", encoding="utf-8") as f:
        f.write(summary_md)
    print(f"  📋 Summary saved: {summary_file}")

    # Also save as latest
    latest_file = os.path.join(output_dir, f"eval_{mode}_latest.json")
    with open(latest_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Print summary
    print_summary(metrics)

    return output


def generate_summary_markdown(output: dict) -> str:
    """Generate a human-readable markdown summary of eval results."""
    m = output["metrics"]
    meta = output["metadata"]
    mode = meta["mode"]

    lines = [
        f"# NeuroSpace Evaluation Results — `{mode}` mode",
        f"",
        f"**Date**: {meta['timestamp']}  ",
        f"**Total Questions**: {meta['total_questions']}  ",
        f"**Errors**: {meta['errors']}  ",
        f"",
        f"---",
        f"",
        f"## Summary Metrics",
        f"",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| **Answer Groundedness** | {m['groundedness']['groundedness_pct']}% ({m['groundedness']['grounded_count']}/{m['groundedness']['total_answerable']} answerable) |",
        f"| **Hallucination Rate** | {m['hallucination']['hallucination_rate_pct']}% ({m['hallucination']['hallucinated_count']}/{m['hallucination']['total_unanswerable']} unanswerable) |",
        f"| **Hallucination Rejection** | {100 - m['hallucination']['hallucination_rate_pct']}% ({m['hallucination']['correctly_refused']}/{m['hallucination']['total_unanswerable']}) |",
        f"| **Source Precision** | {m['source_precision']['source_precision_pct']}% ({m['source_precision']['correctly_cited']}/{m['source_precision']['total_cited']}) |",
        f"| **Source Recall** | {m['source_recall']['source_recall_pct']}% ({m['source_recall']['sources_found']}/{m['source_recall']['total_expected']}) |",
        f"| **Keyword Coverage** | {m['keyword_coverage']['keyword_coverage_pct']}% |",
        f"",
        f"## Latency",
        f"",
        f"| Stat | Value |",
        f"|------|-------|",
        f"| **Median (p50)** | {m['latency']['p50_ms']} ms |",
        f"| **95th percentile (p95)** | {m['latency']['p95_ms']} ms |",
        f"| **Mean** | {m['latency']['mean_ms']} ms |",
        f"| **Min** | {m['latency']['min_ms']} ms |",
        f"| **Max** | {m['latency']['max_ms']} ms |",
        f"",
    ]

    # Hallucination details
    hall_details = m["hallucination"].get("hallucination_details", [])
    if hall_details:
        lines.extend([
            f"## Hallucination Details",
            f"",
            f"These unanswerable questions received fabricated answers:",
            f"",
        ])
        for d in hall_details:
            lines.append(f"- **Q{d['question_id']}**: {d['question']}")
            lines.append(f"  - Answer: _{d['answer_snippet']}_")
            lines.append(f"")

    # Per-question keyword coverage (only show low performers)
    kw_details = m["keyword_coverage"].get("per_question", [])
    low_coverage = [q for q in kw_details if q["coverage_pct"] < 50]
    if low_coverage:
        lines.extend([
            f"## Low Keyword Coverage Questions",
            f"",
            f"Questions where <50% of expected keywords were found:",
            f"",
            f"| Q# | Coverage | Missing Keywords |",
            f"|----|----------|-----------------|",
        ])
        for q in low_coverage:
            missing = ", ".join(q["missing"][:5])
            lines.append(f"| Q{q['question_id']} | {q['coverage_pct']}% | {missing} |")
        lines.append(f"")

    return "\n".join(lines)


def print_summary(metrics: dict):
    """Print a colorful terminal summary."""
    print(f"\n{'='*60}")
    print(f"  EVALUATION RESULTS")
    print(f"{'='*60}")
    print(f"")
    print(f"  📊 Answer Groundedness:    {metrics['groundedness']['groundedness_pct']}%")
    print(f"  🛡️  Hallucination Rate:     {metrics['hallucination']['hallucination_rate_pct']}%")
    print(f"  🎯 Source Precision:        {metrics['source_precision']['source_precision_pct']}%")
    print(f"  📡 Source Recall:           {metrics['source_recall']['source_recall_pct']}%")
    print(f"  🔑 Keyword Coverage:        {metrics['keyword_coverage']['keyword_coverage_pct']}%")
    print(f"  ⚡ Median Latency:          {metrics['latency']['p50_ms']} ms")
    print(f"  ⚡ p95 Latency:             {metrics['latency']['p95_ms']} ms")
    print(f"")
    print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(description="NeuroSpace Evaluation Runner")
    parser.add_argument("--api-url", default="http://localhost:8000", help="Backend API URL")
    parser.add_argument("--mode", default="hybrid", choices=["hybrid", "vector_only", "synonym_only"],
                        help="Retrieval mode to evaluate")
    parser.add_argument("--output-dir", default=None, help="Output directory for results")
    parser.add_argument("--delay", type=float, default=20.0, help="Delay between queries (seconds)")
    args = parser.parse_args()

    run_evaluation(
        api_url=args.api_url,
        mode=args.mode,
        output_dir=args.output_dir,
        delay=args.delay,
    )


if __name__ == "__main__":
    main()
