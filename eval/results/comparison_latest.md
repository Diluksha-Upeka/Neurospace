# NeuroSpace — Hybrid vs. Vector-Only Retrieval Comparison

**Date**: 2026-07-14 00:47  
**Evaluated on**: 50-question test set (25 single-hop, 10 multi-hop, 5 cross-document, 10 unanswerable)

---

## Overall Metrics

| Metric | Vector-Only | Hybrid (GraphRAG) | Delta |
|--------|-------------|-------------------|-------|
| **Answer Groundedness** | 100.0% | 100.0% | → (same) |
| **Hallucination Rate** | 0.0% | 0.0% | → (same) |
| **Source Precision** | 86.2% | 91.8% | ↑ +5.6% |
| **Source Recall** | 75.5% | 77.4% | ↑ +1.9% |
| **Keyword Coverage** | 60.8% | 59.4% | ↓ -1.4% |
| **Median Latency** | 3627.6 ms | 4629.6 ms | ↑ +1002ms |
| **p95 Latency** | 9423.2 ms | 9439.9 ms | ↑ +17ms |

## Per-Category Breakdown

### Single Hop Questions (25 questions)

| Metric | Vector-Only | Hybrid | Delta |
|--------|-------------|--------|-------|
| Groundedness | 100.0% | 100.0% | → (same) |
| Keyword Coverage | 70.4% | 67.6% | ↓ -2.8% |
| Median Latency | 2906.0 ms | 5274.3 ms | ↑ +2368ms |

### Multi Hop Questions (10 questions)

| Metric | Vector-Only | Hybrid | Delta |
|--------|-------------|--------|-------|
| Groundedness | 100.0% | 100.0% | → (same) |
| Keyword Coverage | 48.9% | 46.7% | ↓ -2.2% |
| Median Latency | 4999.9 ms | 4489.9 ms | ↓ -510ms |

### Cross Document Questions (5 questions)

| Metric | Vector-Only | Hybrid | Delta |
|--------|-------------|--------|-------|
| Groundedness | 100.0% | 100.0% | → (same) |
| Keyword Coverage | 55.6% | 59.3% | ↑ +3.7% |
| Median Latency | 5532.0 ms | 4629.6 ms | ↓ -902ms |

---

## Key Takeaways

> Fill in after reviewing the results above:
> - Hybrid retrieval shows the largest improvement on ___ questions
> - Hallucination rejection rate: ___% 
> - The latency trade-off for hybrid is ___ms additional per query

## CV-Ready Bullet Points

> Based on these results, update your CV bullets with the real numbers:
> - "Engineered a hybrid query pipeline combining vector search with Neo4j graph traversal, 
>    improving answer groundedness by X% on multi-hop questions vs. vector-only retrieval 
>    (evaluated on a 50-question test set)."
> - "Built anti-hallucination guardrails achieving X% rejection rate on unanswerable questions."
