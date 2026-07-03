"""
NeuroSpace Evaluation — Metric Functions
==========================================
Computes evaluation metrics for the GraphRAG pipeline.

Metrics:
    - Answer Groundedness: % of answers that cite at least one source
    - Hallucination Rate: % of unanswerable questions where the system fabricates an answer
    - Source Precision: Of cited sources, what % match the expected sources
    - Source Recall: Of expected sources, what % were cited
    - Keyword Coverage: % of expected answer keywords present in the response
    - Latency: p50, p95, mean response times
"""

import re
import statistics
from typing import Any


def compute_groundedness(results: list[dict]) -> dict:
    """
    Measures what % of answerable questions have at least one cited source.
    A 'grounded' answer is one that includes inline citations like [filename, page X].
    """
    answerable = [r for r in results if r["answerable"]]
    if not answerable:
        return {"groundedness_pct": 0.0, "grounded_count": 0, "total_answerable": 0}

    grounded = 0
    for r in answerable:
        answer = r.get("actual_answer", "")
        # Check for inline citation patterns
        citations = re.findall(r'\[([^\]]+)\]', answer)
        # Filter out generic markdown-like brackets
        real_citations = [c for c in citations if any(ext in c.lower() for ext in ['.pdf', '.mp4', 'page', 's-', 's -'])]
        if real_citations or r.get("actual_sources", []):
            grounded += 1

    return {
        "groundedness_pct": round((grounded / len(answerable)) * 100, 1),
        "grounded_count": grounded,
        "total_answerable": len(answerable),
    }


def compute_hallucination_rate(results: list[dict]) -> dict:
    """
    Measures what % of UNANSWERABLE questions the system incorrectly answers.
    A correct response to an unanswerable question should say "documents do not contain"
    or similar refusal language.
    """
    unanswerable = [r for r in results if not r["answerable"]]
    if not unanswerable:
        return {"hallucination_rate_pct": 0.0, "hallucinated_count": 0, "total_unanswerable": 0}

    refusal_phrases = [
        "do not contain",
        "does not contain",
        "not contain information",
        "no information",
        "cannot find",
        "not mentioned",
        "not discussed",
        "not covered",
        "not found in",
        "no relevant",
        "unable to find",
        "outside the scope",
    ]

    hallucinated = 0
    details = []
    for r in unanswerable:
        answer = r.get("actual_answer", "").lower()
        refused = any(phrase in answer for phrase in refusal_phrases)
        if not refused:
            hallucinated += 1
            details.append({
                "question_id": r["id"],
                "question": r["question"],
                "answer_snippet": r.get("actual_answer", "")[:150],
            })

    return {
        "hallucination_rate_pct": round((hallucinated / len(unanswerable)) * 100, 1),
        "hallucinated_count": hallucinated,
        "total_unanswerable": len(unanswerable),
        "correctly_refused": len(unanswerable) - hallucinated,
        "hallucination_details": details,
    }


def compute_source_precision(results: list[dict]) -> dict:
    """
    Of the sources the system cited, what % match the expected sources?
    Matching is case-insensitive filename containment.
    """
    answerable = [r for r in results if r["answerable"]]
    if not answerable:
        return {"source_precision_pct": 0.0}

    total_cited = 0
    correctly_cited = 0

    for r in answerable:
        expected = {s.lower() for s in r.get("expected_sources", [])}
        actual = r.get("actual_sources", [])

        for source in actual:
            fname = source.get("filename", "").lower()
            total_cited += 1
            if any(exp in fname or fname in exp for exp in expected):
                correctly_cited += 1

    precision = (correctly_cited / total_cited * 100) if total_cited > 0 else 0.0
    return {
        "source_precision_pct": round(precision, 1),
        "correctly_cited": correctly_cited,
        "total_cited": total_cited,
    }


def compute_source_recall(results: list[dict]) -> dict:
    """
    Of the expected sources, what % were actually cited?
    """
    answerable = [r for r in results if r["answerable"]]
    if not answerable:
        return {"source_recall_pct": 0.0}

    total_expected = 0
    found = 0

    for r in answerable:
        expected = r.get("expected_sources", [])
        actual_filenames = {s.get("filename", "").lower() for s in r.get("actual_sources", [])}

        for exp_src in expected:
            total_expected += 1
            if any(exp_src.lower() in af or af in exp_src.lower() for af in actual_filenames):
                found += 1

    recall = (found / total_expected * 100) if total_expected > 0 else 0.0
    return {
        "source_recall_pct": round(recall, 1),
        "sources_found": found,
        "total_expected": total_expected,
    }


def compute_keyword_coverage(results: list[dict]) -> dict:
    """
    For answerable questions, what % of expected keywords appear in the response?
    This is a rough proxy for answer correctness.
    """
    answerable = [r for r in results if r["answerable"]]
    if not answerable:
        return {"keyword_coverage_pct": 0.0}

    total_keywords = 0
    found_keywords = 0
    per_question = []

    for r in answerable:
        expected_kw = r.get("expected_answer_keywords", [])
        answer = r.get("actual_answer", "").lower()

        q_total = len(expected_kw)
        q_found = sum(1 for kw in expected_kw if kw.lower() in answer)
        total_keywords += q_total
        found_keywords += q_found

        per_question.append({
            "question_id": r["id"],
            "coverage_pct": round((q_found / q_total * 100) if q_total > 0 else 0, 1),
            "found": q_found,
            "total": q_total,
            "missing": [kw for kw in expected_kw if kw.lower() not in answer],
        })

    overall = (found_keywords / total_keywords * 100) if total_keywords > 0 else 0.0
    return {
        "keyword_coverage_pct": round(overall, 1),
        "found_keywords": found_keywords,
        "total_keywords": total_keywords,
        "per_question": per_question,
    }


def compute_latency_stats(results: list[dict]) -> dict:
    """
    Computes latency statistics (p50, p95, mean, min, max) from recorded response times.
    """
    latencies = [r["latency_ms"] for r in results if r.get("latency_ms") is not None]
    if not latencies:
        return {"p50_ms": 0, "p95_ms": 0, "mean_ms": 0, "min_ms": 0, "max_ms": 0}

    latencies.sort()
    n = len(latencies)

    return {
        "p50_ms": round(latencies[n // 2], 1),
        "p95_ms": round(latencies[int(n * 0.95)], 1) if n >= 20 else round(latencies[-1], 1),
        "mean_ms": round(statistics.mean(latencies), 1),
        "min_ms": round(min(latencies), 1),
        "max_ms": round(max(latencies), 1),
        "total_queries": n,
    }


def compute_all_metrics(results: list[dict]) -> dict:
    """
    Master function: computes all metrics and returns a single summary dict.
    """
    return {
        "groundedness": compute_groundedness(results),
        "hallucination": compute_hallucination_rate(results),
        "source_precision": compute_source_precision(results),
        "source_recall": compute_source_recall(results),
        "keyword_coverage": compute_keyword_coverage(results),
        "latency": compute_latency_stats(results),
        "total_questions": len(results),
        "answerable_questions": len([r for r in results if r["answerable"]]),
        "unanswerable_questions": len([r for r in results if not r["answerable"]]),
    }
