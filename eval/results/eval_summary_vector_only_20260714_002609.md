# NeuroSpace Evaluation Results — `vector_only` mode

**Date**: 2026-07-14T00:26:09.744751  
**Total Questions**: 50  
**Errors**: 0  

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| **Answer Groundedness** | 100.0% (40/40 answerable) |
| **Hallucination Rate** | 0.0% (0/10 unanswerable) |
| **Hallucination Rejection** | 100.0% (10/10) |
| **Source Precision** | 86.2% (69/80) |
| **Source Recall** | 75.5% (40/53) |
| **Keyword Coverage** | 60.8% |

## Latency

| Stat | Value |
|------|-------|
| **Median (p50)** | 3627.6 ms |
| **95th percentile (p95)** | 9423.2 ms |
| **Mean** | 5010.3 ms |
| **Min** | 2747.4 ms |
| **Max** | 28055.3 ms |

## Low Keyword Coverage Questions

Questions where <50% of expected keywords were found:

| Q# | Coverage | Missing Keywords |
|----|----------|-----------------|
| Q10 | 0.0% | Geoffrey Hinton, Yann LeCun, Yoshua Bengio, Turing Award, 2018 |
| Q12 | 0.0% | forward pass, loss computation, backpropagation |
| Q14 | 25.0% | gradually increases, preventing, divergence |
| Q21 | 0.0% | key-value properties, nodes, edges, Neo4j, Cypher |
| Q23 | 0.0% | create-if-not-exists |
| Q27 | 0.0% | all-MiniLM-L6-v2, 384, chunks, vector embeddings, cosine similarity |
| Q29 | 40.0% | vanishing gradient, self-attention, parallel |
| Q30 | 25.0% | AdamW, Loshchilov, Hutter |
| Q34 | 20.0% | relationships, tokens, entities, edges |
| Q37 | 33.3% | chunking, embedding, entity extraction, knowledge graph |
| Q38 | 33.3% | backpropagation, CNN, RNN, Transformer |
| Q39 | 0.0% | Flash Attention, quantization, MoE, dropout |
