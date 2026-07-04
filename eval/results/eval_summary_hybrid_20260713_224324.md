# NeuroSpace Evaluation Results — `hybrid` mode

**Date**: 2026-07-13T22:43:24.250881  
**Total Questions**: 50  
**Errors**: 16  

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| **Answer Groundedness** | 85.0% (34/40 answerable) |
| **Hallucination Rate** | 100.0% (10/10 unanswerable) |
| **Hallucination Rejection** | 0.0% (0/10) |
| **Source Precision** | 86.2% (56/65) |
| **Source Recall** | 67.9% (36/53) |
| **Keyword Coverage** | 50.3% |

## Latency

| Stat | Value |
|------|-------|
| **Median (p50)** | 6035.0 ms |
| **95th percentile (p95)** | 16908.6 ms |
| **Mean** | 9125.3 ms |
| **Min** | 4558.3 ms |
| **Max** | 69199.9 ms |

## Hallucination Details

These unanswerable questions received fabricated answers:

- **Q41**: What is the capital of Sri Lanka?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q42**: What programming language is TensorFlow written in?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q43**: How much does a Groq API subscription cost per month?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q44**: What is the latest version of Python as of 2026?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q45**: Who is the CEO of OpenAI?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q46**: What is reinforcement learning from human feedback (RLHF)?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q47**: How does Docker containerization work?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q48**: What are the system requirements for running Stable Diffusion locally?
  - Answer: _API Error: 500 - Internal Server Error_

- **Q49**: Explain the MapReduce algorithm used in distributed computing.
  - Answer: _API Error: 500 - Internal Server Error_

- **Q50**: What is the difference between SQL and NoSQL databases?
  - Answer: _API Error: 500 - Internal Server Error_

## Low Keyword Coverage Questions

Questions where <50% of expected keywords were found:

| Q# | Coverage | Missing Keywords |
|----|----------|-----------------|
| Q10 | 0.0% | Geoffrey Hinton, Yann LeCun, Yoshua Bengio, Turing Award, 2018 |
| Q12 | 0.0% | forward pass, loss computation, backpropagation |
| Q14 | 0.0% | gradually increases, learning rate, preventing, divergence |
| Q15 | 33.3% | Alex Krizhevsky, 2012 |
| Q23 | 0.0% | create-if-not-exists |
| Q27 | 0.0% | all-MiniLM-L6-v2, 384, chunks, vector embeddings, cosine similarity |
| Q34 | 0.0% | attention, relationships, tokens, entities, edges |
| Q35 | 0.0% | layer normalization, batch normalization, features, batch size, Transformer |
| Q36 | 0.0% | NER, spaCy, LLM, prompting, flexible |
| Q37 | 0.0% | chunking, embedding, entity extraction, knowledge graph, retrieval |
| Q38 | 0.0% | perceptron, backpropagation, CNN, RNN, Transformer |
| Q39 | 0.0% | Flash Attention, quantization, MoE, dropout |
| Q40 | 0.0% | transfer learning, fine-tuning, RAG, retrieval, pre-trained |
