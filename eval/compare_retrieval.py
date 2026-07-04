"""
NeuroSpace Evaluation — Retrieval Mode Comparison
===================================================
Runs the evaluation suite in both 'hybrid' (GraphRAG) and 'vector_only' modes,
then generates a head-to-head comparison report.

This directly produces the CV bullet:
"Improving answer groundedness on multi-hop questions vs. vector-only retrieval"

Usage:
    1. Ensure backend is running with test corpus ingested
    2. Run: python eval/compare_retrieval.py

Output:
    eval/results/comparison_<timestamp>.md
"""

import json
import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))
from run_eval import run_evaluation


def run_comparison(
    api_url: str = "http://localhost:8000",
    delay: float = 20.0,
):
    """
    Runs evaluation in both hybrid and vector_only modes,
    then produces a comparison report.
    """
    output_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(output_dir, exist_ok=True)

    print("\n" + "=" * 60)
    print("  NeuroSpace Retrieval Mode Comparison")
    print("  Mode 1: vector_only (baseline)")
    print("  Mode 2: hybrid (GraphRAG)")
    print("=" * 60)

    # --- Run vector-only evaluation ---
    print("\n\n🔵 PHASE 1: Running VECTOR-ONLY evaluation...")
    print("-" * 60)
    vector_results = run_evaluation(
        api_url=api_url,
        mode="vector_only",
        output_dir=output_dir,
        delay=delay,
    )

    # Brief pause between modes to avoid rate limiting
    print("\n⏳ Pausing 10 seconds before hybrid evaluation...")
    time.sleep(10)

    # --- Run hybrid (GraphRAG) evaluation ---
    print("\n\n🟢 PHASE 2: Running HYBRID (GraphRAG) evaluation...")
    print("-" * 60)
    hybrid_results = run_evaluation(
        api_url=api_url,
        mode="hybrid",
        output_dir=output_dir,
        delay=delay,
    )

    # --- Generate comparison report ---
    if not vector_results or not hybrid_results:
        print("❌ Could not complete both evaluations. Comparison aborted.")
        return

    report = generate_comparison_report(vector_results, hybrid_results)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(output_dir, f"comparison_{timestamp}.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    # Also save as latest
    latest_path = os.path.join(output_dir, "comparison_latest.md")
    with open(latest_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\n📊 Comparison report saved: {report_path}")

    # Save raw comparison data
    comparison_data = {
        "timestamp": datetime.now().isoformat(),
        "vector_only": vector_results.get("metrics", {}),
        "hybrid": hybrid_results.get("metrics", {}),
    }
    data_path = os.path.join(output_dir, f"comparison_{timestamp}.json")
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(comparison_data, f, indent=2)

    # Print terminal comparison
    print_comparison(vector_results.get("metrics", {}), hybrid_results.get("metrics", {}))


def compute_category_metrics(results: dict, category: str) -> dict:
    """Compute metrics for a specific question category."""
    all_results = results.get("results", [])
    category_results = [r for r in all_results if r.get("category") == category]

    if not category_results:
        return {"count": 0}

    from metrics import compute_groundedness, compute_keyword_coverage, compute_latency_stats

    return {
        "count": len(category_results),
        "groundedness": compute_groundedness(category_results),
        "keyword_coverage": compute_keyword_coverage(category_results),
        "latency": compute_latency_stats(category_results),
    }


def generate_comparison_report(vector_results: dict, hybrid_results: dict) -> str:
    """Generate a comprehensive markdown comparison report."""
    vm = vector_results.get("metrics", {})
    hm = hybrid_results.get("metrics", {})

    # Per-category breakdown
    categories = ["single_hop", "multi_hop", "cross_document"]
    cat_data = {}
    for cat in categories:
        cat_data[cat] = {
            "vector": compute_category_metrics(vector_results, cat),
            "hybrid": compute_category_metrics(hybrid_results, cat),
        }

    def delta(hybrid_val, vector_val, higher_is_better=True):
        """Format delta with arrow."""
        diff = hybrid_val - vector_val
        if abs(diff) < 0.1:
            return "→ (same)"
        arrow = "↑" if (diff > 0) == higher_is_better else "↓"
        sign = "+" if diff > 0 else ""
        return f"{arrow} {sign}{diff:.1f}%"

    def delta_ms(hybrid_val, vector_val):
        diff = hybrid_val - vector_val
        if abs(diff) < 1:
            return "→ (same)"
        arrow = "↑" if diff > 0 else "↓"
        sign = "+" if diff > 0 else ""
        return f"{arrow} {sign}{diff:.0f}ms"

    lines = [
        "# NeuroSpace — Hybrid vs. Vector-Only Retrieval Comparison",
        "",
        f"**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M')}  ",
        f"**Evaluated on**: 50-question test set (25 single-hop, 10 multi-hop, 5 cross-document, 10 unanswerable)",
        "",
        "---",
        "",
        "## Overall Metrics",
        "",
        "| Metric | Vector-Only | Hybrid (GraphRAG) | Delta |",
        "|--------|-------------|-------------------|-------|",
        f"| **Answer Groundedness** | {vm.get('groundedness',{}).get('groundedness_pct',0)}% | {hm.get('groundedness',{}).get('groundedness_pct',0)}% | {delta(hm.get('groundedness',{}).get('groundedness_pct',0), vm.get('groundedness',{}).get('groundedness_pct',0))} |",
        f"| **Hallucination Rate** | {vm.get('hallucination',{}).get('hallucination_rate_pct',0)}% | {hm.get('hallucination',{}).get('hallucination_rate_pct',0)}% | {delta(hm.get('hallucination',{}).get('hallucination_rate_pct',0), vm.get('hallucination',{}).get('hallucination_rate_pct',0), higher_is_better=False)} |",
        f"| **Source Precision** | {vm.get('source_precision',{}).get('source_precision_pct',0)}% | {hm.get('source_precision',{}).get('source_precision_pct',0)}% | {delta(hm.get('source_precision',{}).get('source_precision_pct',0), vm.get('source_precision',{}).get('source_precision_pct',0))} |",
        f"| **Source Recall** | {vm.get('source_recall',{}).get('source_recall_pct',0)}% | {hm.get('source_recall',{}).get('source_recall_pct',0)}% | {delta(hm.get('source_recall',{}).get('source_recall_pct',0), vm.get('source_recall',{}).get('source_recall_pct',0))} |",
        f"| **Keyword Coverage** | {vm.get('keyword_coverage',{}).get('keyword_coverage_pct',0)}% | {hm.get('keyword_coverage',{}).get('keyword_coverage_pct',0)}% | {delta(hm.get('keyword_coverage',{}).get('keyword_coverage_pct',0), vm.get('keyword_coverage',{}).get('keyword_coverage_pct',0))} |",
        f"| **Median Latency** | {vm.get('latency',{}).get('p50_ms',0)} ms | {hm.get('latency',{}).get('p50_ms',0)} ms | {delta_ms(hm.get('latency',{}).get('p50_ms',0), vm.get('latency',{}).get('p50_ms',0))} |",
        f"| **p95 Latency** | {vm.get('latency',{}).get('p95_ms',0)} ms | {hm.get('latency',{}).get('p95_ms',0)} ms | {delta_ms(hm.get('latency',{}).get('p95_ms',0), vm.get('latency',{}).get('p95_ms',0))} |",
        "",
        "## Per-Category Breakdown",
        "",
    ]

    for cat in categories:
        cat_label = cat.replace("_", " ").title()
        v = cat_data[cat]["vector"]
        h = cat_data[cat]["hybrid"]

        v_ground = v.get("groundedness", {}).get("groundedness_pct", 0)
        h_ground = h.get("groundedness", {}).get("groundedness_pct", 0)
        v_kw = v.get("keyword_coverage", {}).get("keyword_coverage_pct", 0)
        h_kw = h.get("keyword_coverage", {}).get("keyword_coverage_pct", 0)
        v_lat = v.get("latency", {}).get("p50_ms", 0)
        h_lat = h.get("latency", {}).get("p50_ms", 0)

        lines.extend([
            f"### {cat_label} Questions ({v.get('count', 0)} questions)",
            "",
            f"| Metric | Vector-Only | Hybrid | Delta |",
            f"|--------|-------------|--------|-------|",
            f"| Groundedness | {v_ground}% | {h_ground}% | {delta(h_ground, v_ground)} |",
            f"| Keyword Coverage | {v_kw}% | {h_kw}% | {delta(h_kw, v_kw)} |",
            f"| Median Latency | {v_lat} ms | {h_lat} ms | {delta_ms(h_lat, v_lat)} |",
            "",
        ])

    lines.extend([
        "---",
        "",
        "## Key Takeaways",
        "",
        "> Fill in after reviewing the results above:",
        "> - Hybrid retrieval shows the largest improvement on ___ questions",
        "> - Hallucination rejection rate: ___% ",
        "> - The latency trade-off for hybrid is ___ms additional per query",
        "",
        "## CV-Ready Bullet Points",
        "",
        "> Based on these results, update your CV bullets with the real numbers:",
        "> - \"Engineered a hybrid query pipeline combining vector search with Neo4j graph traversal, ",
        ">    improving answer groundedness by X% on multi-hop questions vs. vector-only retrieval ",
        ">    (evaluated on a 50-question test set).\"",
        "> - \"Built anti-hallucination guardrails achieving X% rejection rate on unanswerable questions.\"",
        "",
    ])

    return "\n".join(lines)


def print_comparison(vm: dict, hm: dict):
    """Print a terminal-friendly comparison table."""
    print("\n" + "=" * 70)
    print("  COMPARISON: Vector-Only vs. Hybrid (GraphRAG)")
    print("=" * 70)
    print(f"  {'Metric':<25} {'Vector-Only':>12} {'Hybrid':>12} {'Delta':>12}")
    print(f"  {'-'*25} {'-'*12} {'-'*12} {'-'*12}")

    metrics_pairs = [
        ("Groundedness", vm.get("groundedness", {}).get("groundedness_pct", 0), hm.get("groundedness", {}).get("groundedness_pct", 0), "%"),
        ("Hallucination Rate", vm.get("hallucination", {}).get("hallucination_rate_pct", 0), hm.get("hallucination", {}).get("hallucination_rate_pct", 0), "%"),
        ("Source Precision", vm.get("source_precision", {}).get("source_precision_pct", 0), hm.get("source_precision", {}).get("source_precision_pct", 0), "%"),
        ("Source Recall", vm.get("source_recall", {}).get("source_recall_pct", 0), hm.get("source_recall", {}).get("source_recall_pct", 0), "%"),
        ("Keyword Coverage", vm.get("keyword_coverage", {}).get("keyword_coverage_pct", 0), hm.get("keyword_coverage", {}).get("keyword_coverage_pct", 0), "%"),
        ("Median Latency", vm.get("latency", {}).get("p50_ms", 0), hm.get("latency", {}).get("p50_ms", 0), "ms"),
    ]

    for name, v_val, h_val, unit in metrics_pairs:
        diff = h_val - v_val
        sign = "+" if diff > 0 else ""
        print(f"  {name:<25} {v_val:>10.1f}{unit:>2} {h_val:>10.1f}{unit:>2} {sign}{diff:>8.1f}{unit:>2}")

    print("=" * 70)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="NeuroSpace Retrieval Comparison")
    parser.add_argument("--api-url", default="http://localhost:8000")
    parser.add_argument("--delay", type=float, default=20.0)
    args = parser.parse_args()

    run_comparison(api_url=args.api_url, delay=args.delay)
