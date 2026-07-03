"""
NeuroSpace Evaluation — Test Corpus Generator
===============================================
Generates 4 AI/ML-themed PDF documents that serve as the evaluation corpus.
Each document is ~1500-2000 words across 3-4 pages, covering distinct but
overlapping topics to enable single-hop, multi-hop, and cross-document evaluation.

Usage:
    pip install fpdf2
    python eval/create_test_corpus.py

Output:
    eval/test_corpus/
        ├── Fundamentals_of_RAG.pdf
        ├── Neural_Networks_Essentials.pdf
        ├── Transformer_Architecture.pdf
        └── Knowledge_Graphs_in_AI.pdf
"""

import os
from fpdf import FPDF


# ─────────────────────────────────────────────────────────────
# DOCUMENT CONTENT — 4 comprehensive AI/ML topic documents
# Each fact is deliberately placed so questions.json can reference it.
# ─────────────────────────────────────────────────────────────

DOCUMENTS = {
    "Fundamentals_of_RAG.pdf": {
        "title": "Fundamentals of Retrieval-Augmented Generation",
        "pages": [
            # Page 1
            (
                "Chapter 1: What is Retrieval-Augmented Generation?\n\n"
                "Retrieval-Augmented Generation (RAG) is a technique introduced by Patrick Lewis and colleagues at "
                "Facebook AI Research (FAIR) in their 2020 paper. RAG combines a pre-trained language model with a "
                "retrieval mechanism that fetches relevant documents from an external knowledge base before generating "
                "a response. This approach addresses a fundamental limitation of large language models: their knowledge "
                "is frozen at training time and cannot be updated without expensive retraining.\n\n"
                "The core RAG pipeline consists of three stages: (1) Indexing, where documents are split into chunks "
                "and converted to vector embeddings; (2) Retrieval, where user queries are embedded and compared against "
                "the document embeddings using similarity search; and (3) Generation, where the retrieved context is "
                "concatenated with the user query and passed to a language model for answer synthesis.\n\n"
                "RAG differs fundamentally from fine-tuning. Fine-tuning modifies the model's weights using "
                "task-specific data, which is computationally expensive and can cause catastrophic forgetting. RAG, "
                "by contrast, keeps the model weights frozen and dynamically retrieves relevant information at "
                "inference time. This makes RAG particularly suitable for knowledge-intensive tasks where information "
                "changes frequently, such as customer support, legal research, and medical question answering.\n\n"
                "A key metric for evaluating RAG systems is answer groundedness — the degree to which the generated "
                "answer is supported by the retrieved documents. High groundedness indicates low hallucination risk. "
                "Other important metrics include retrieval precision (are the retrieved documents relevant?), "
                "retrieval recall (were all relevant documents retrieved?), and end-to-end latency."
            ),
            # Page 2
            (
                "Chapter 2: Vector Embeddings and Similarity Search\n\n"
                "The retrieval component of RAG relies on vector embeddings — dense numerical representations of text "
                "that capture semantic meaning. Popular embedding models include OpenAI's text-embedding-ada-002 "
                "(1536 dimensions), Cohere's embed-v3, and open-source models like sentence-transformers/all-MiniLM-L6-v2 "
                "(384 dimensions). The choice of embedding model significantly impacts retrieval quality.\n\n"
                "all-MiniLM-L6-v2 is a particularly efficient model: it produces 384-dimensional vectors, runs on CPU "
                "without GPU requirements, and achieves competitive performance on semantic similarity benchmarks. "
                "It was trained on over 1 billion sentence pairs using contrastive learning.\n\n"
                "Similarity search typically uses cosine similarity, which measures the angle between two vectors "
                "in high-dimensional space. A cosine similarity of 1.0 indicates identical direction (maximum "
                "similarity), while 0.0 indicates orthogonality (no similarity). In practice, relevant documents "
                "typically have cosine similarity scores between 0.6 and 0.9.\n\n"
                "Vector databases such as Pinecone, Weaviate, Chroma, and FAISS are purpose-built for efficient "
                "similarity search. However, Neo4j also supports vector indexes natively since version 5.11, "
                "allowing organizations to store both graph relationships and vector embeddings in a single database. "
                "This eliminates the need for a separate vector database and enables hybrid queries that combine "
                "structural graph traversal with semantic vector search."
            ),
            # Page 3
            (
                "Chapter 3: Chunking Strategies\n\n"
                "Before embedding, documents must be split into smaller chunks. The chunking strategy directly "
                "affects retrieval quality. Common approaches include:\n\n"
                "Fixed-size chunking: Splits text into chunks of a fixed number of characters or tokens (e.g., "
                "1000 characters with 200-character overlap). Simple but may split sentences mid-thought.\n\n"
                "Recursive chunking: Attempts to split on natural boundaries (paragraphs, then sentences, then "
                "characters) while staying within a size limit. This is the default strategy in LangChain and "
                "LlamaIndex, and generally produces higher-quality chunks than fixed-size splitting.\n\n"
                "Semantic chunking: Groups sentences by semantic similarity, creating chunks where all sentences "
                "are topically related. More computationally expensive but produces the most coherent chunks.\n\n"
                "The optimal chunk size depends on the use case. Smaller chunks (200-500 tokens) provide more "
                "precise retrieval but may lack context. Larger chunks (1000-2000 tokens) provide more context "
                "but may include irrelevant information. Research by Greg Kamradt suggests that chunk sizes between "
                "512 and 1024 tokens offer the best trade-off for most RAG applications.\n\n"
                "Chunk overlap is equally important: a 10-20% overlap ensures that information at chunk boundaries "
                "is not lost. For example, a chunk size of 1000 characters with 200 characters of overlap means "
                "each chunk shares its last 200 characters with the next chunk."
            ),
            # Page 4
            (
                "Chapter 4: Advanced RAG Techniques\n\n"
                "Basic RAG retrieves the top-k most similar chunks and passes them directly to the LLM. Advanced "
                "RAG techniques improve upon this baseline in several ways:\n\n"
                "Hybrid Search combines vector similarity with keyword matching (BM25). This addresses cases where "
                "semantic search misses exact terms — for example, searching for 'Python 3.11' might not match "
                "a chunk about 'CPython version 3.11.0' using pure semantic search.\n\n"
                "Re-ranking applies a cross-encoder model (such as ms-marco-MiniLM-L-6-v2) to re-score retrieved "
                "chunks based on their relevance to the query. Cross-encoders are more accurate than bi-encoders "
                "for ranking but too slow for initial retrieval over large corpora.\n\n"
                "Query Decomposition breaks complex questions into simpler sub-queries, retrieves context for each, "
                "and synthesizes a final answer. This is particularly effective for multi-hop questions that require "
                "combining information from multiple sources.\n\n"
                "GraphRAG extends traditional RAG by incorporating knowledge graph structure into the retrieval "
                "process. Instead of treating documents as flat text, GraphRAG models entities and relationships "
                "between concepts, enabling multi-hop reasoning. For example, a question like 'What techniques "
                "improve transformer training stability?' can be answered by traversing entity relationships in "
                "the graph rather than relying solely on text similarity. Microsoft Research published a prominent "
                "GraphRAG paper in 2024 that demonstrated significant improvements on global summarization tasks."
            ),
        ],
    },
    "Neural_Networks_Essentials.pdf": {
        "title": "Neural Networks and Deep Learning Essentials",
        "pages": [
            # Page 1
            (
                "Chapter 1: Foundations of Neural Networks\n\n"
                "A neural network is a computational model inspired by the structure of biological neurons. "
                "The fundamental unit is the perceptron, proposed by Frank Rosenblatt in 1958. A perceptron "
                "takes multiple inputs, multiplies each by a weight, sums them, adds a bias term, and applies "
                "an activation function to produce an output.\n\n"
                "Modern neural networks stack multiple layers of neurons: an input layer, one or more hidden "
                "layers, and an output layer. Networks with two or more hidden layers are called deep neural "
                "networks, and the field of training them is called deep learning. The term 'deep learning' "
                "was popularized by Geoffrey Hinton, Yann LeCun, and Yoshua Bengio, who are often called the "
                "'Godfathers of AI' and jointly received the 2018 Turing Award.\n\n"
                "Activation functions introduce non-linearity into the network. Common activation functions include:\n"
                "- Sigmoid: Maps values to the range (0, 1). Historically popular but suffers from vanishing gradients.\n"
                "- ReLU (Rectified Linear Unit): f(x) = max(0, x). Currently the most widely used activation "
                "function. Fast to compute and mitigates vanishing gradients, but can cause 'dying ReLU' problems.\n"
                "- GELU (Gaussian Error Linear Unit): Used in Transformer models like BERT and GPT. Smoother than "
                "ReLU and empirically performs better in NLP tasks.\n"
                "- Softmax: Used in output layers for multi-class classification. Converts raw scores into "
                "probabilities that sum to 1."
            ),
            # Page 2
            (
                "Chapter 2: Training Neural Networks\n\n"
                "Training a neural network involves minimizing a loss function using gradient descent. The process "
                "has three key steps: (1) Forward pass — input data flows through the network to produce predictions; "
                "(2) Loss computation — the difference between predictions and actual labels is calculated; "
                "(3) Backpropagation — gradients of the loss with respect to each weight are computed using the "
                "chain rule of calculus, and weights are updated accordingly.\n\n"
                "Backpropagation was popularized by Rumelhart, Hinton, and Williams in their seminal 1986 paper "
                "'Learning representations by back-propagating errors.' It remains the foundation of all modern "
                "deep learning training.\n\n"
                "Optimization algorithms control how weights are updated:\n"
                "- SGD (Stochastic Gradient Descent): Updates weights using gradients from a mini-batch. Simple but "
                "can be slow to converge and sensitive to learning rate.\n"
                "- Adam (Adaptive Moment Estimation): Combines momentum and adaptive learning rates. Published by "
                "Kingma and Ba in 2014, Adam is the most popular optimizer in deep learning. It maintains per-parameter "
                "learning rates and is relatively insensitive to hyperparameter choices.\n"
                "- AdamW: A variant of Adam with decoupled weight decay, proposed by Loshchilov and Hutter in 2017. "
                "Used to train most modern LLMs including GPT-4 and Llama.\n\n"
                "Learning rate scheduling is critical for training stability. Common schedules include step decay, "
                "cosine annealing, and warmup-then-decay. The warmup phase gradually increases the learning rate "
                "from near-zero over the first few hundred steps, preventing early divergence."
            ),
            # Page 3
            (
                "Chapter 3: Convolutional and Recurrent Networks\n\n"
                "Convolutional Neural Networks (CNNs) are specialized for grid-structured data like images. "
                "Key innovations include LeNet-5 (Yann LeCun, 1998) for handwritten digit recognition, "
                "AlexNet (Alex Krizhevsky, 2012) which won the ImageNet competition and reignited interest in "
                "deep learning, and ResNet (Kaiming He, 2015) which introduced skip connections enabling training "
                "of networks with 152+ layers.\n\n"
                "A CNN uses convolutional layers that apply learnable filters across the input, detecting features "
                "like edges, textures, and shapes. Pooling layers (max pooling or average pooling) downsample "
                "feature maps to reduce computation and provide spatial invariance.\n\n"
                "Recurrent Neural Networks (RNNs) are designed for sequential data like text and time series. "
                "Standard RNNs suffer from vanishing and exploding gradient problems when processing long sequences. "
                "Long Short-Term Memory (LSTM) networks, proposed by Hochreiter and Schmidhuber in 1997, address "
                "this with a gating mechanism that controls information flow. Gated Recurrent Units (GRUs), proposed "
                "by Cho et al. in 2014, offer a simpler alternative with comparable performance.\n\n"
                "However, both LSTMs and GRUs have been largely superseded by Transformer architectures for most "
                "NLP tasks. Transformers process entire sequences in parallel rather than sequentially, enabling "
                "much faster training on modern GPU hardware. The transition from RNNs to Transformers is one of "
                "the most significant architectural shifts in deep learning history."
            ),
            # Page 4
            (
                "Chapter 4: Regularization and Generalization\n\n"
                "Regularization techniques prevent neural networks from overfitting to training data:\n\n"
                "Dropout: Randomly sets a fraction of neuron activations to zero during training. Proposed by "
                "Srivastava et al. in 2014, dropout effectively creates an ensemble of sub-networks. A typical "
                "dropout rate is 0.1 to 0.5, with 0.1 being common for Transformer models.\n\n"
                "Weight Decay (L2 Regularization): Adds a penalty proportional to the square of weight magnitudes "
                "to the loss function. This encourages smaller weights and smoother decision boundaries.\n\n"
                "Batch Normalization: Normalizes layer inputs to have zero mean and unit variance. Proposed by "
                "Ioffe and Szegedy in 2015, batch normalization accelerates training and provides a mild "
                "regularization effect. Layer Normalization is preferred for Transformer models because it "
                "normalizes across features rather than across the batch, making it independent of batch size.\n\n"
                "Data Augmentation: Artificially increases training data variety through transformations like "
                "rotation, flipping, and color jittering (for images) or synonym replacement and back-translation "
                "(for text).\n\n"
                "Transfer Learning: Pre-trains a model on a large general dataset, then fine-tunes on a smaller "
                "task-specific dataset. Transfer learning dramatically reduces the amount of labeled data needed. "
                "In NLP, pre-trained models like BERT, GPT, and Llama serve as foundations that can be fine-tuned "
                "for downstream tasks with as few as 100 labeled examples."
            ),
        ],
    },
    "Transformer_Architecture.pdf": {
        "title": "The Transformer Architecture",
        "pages": [
            # Page 1
            (
                "Chapter 1: The Attention Mechanism\n\n"
                "The Transformer architecture was introduced by Vaswani et al. in the landmark 2017 paper "
                "'Attention Is All You Need.' It fundamentally changed natural language processing by replacing "
                "recurrent connections with self-attention mechanisms, enabling parallel processing of entire "
                "sequences.\n\n"
                "Self-attention computes relationships between all positions in a sequence simultaneously. For a "
                "given input sequence, three vectors are computed for each token: Query (Q), Key (K), and Value (V). "
                "The attention score between two tokens is the dot product of the query of one token with the key "
                "of another, scaled by the square root of the key dimension (sqrt(d_k)). These scores are passed "
                "through a softmax function to obtain attention weights, which are then used to compute a weighted "
                "sum of the value vectors.\n\n"
                "The mathematical formula is: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V\n\n"
                "This scaling factor (sqrt(d_k)) prevents the dot products from becoming too large, which would "
                "push the softmax into regions with extremely small gradients. For a typical dimension of d_k = 64, "
                "the scaling factor is 8.\n\n"
                "Multi-head attention runs multiple attention operations in parallel, each with different learned "
                "projection matrices. The original Transformer uses 8 attention heads with d_k = 64 each, for a "
                "total model dimension of 512. Multi-head attention allows the model to attend to information from "
                "different representation subspaces at different positions simultaneously."
            ),
            # Page 2
            (
                "Chapter 2: Transformer Architecture Details\n\n"
                "The original Transformer follows an encoder-decoder structure:\n\n"
                "The Encoder consists of 6 identical layers. Each layer has two sub-layers: (1) multi-head "
                "self-attention and (2) a position-wise feed-forward network. Residual connections and layer "
                "normalization are applied around each sub-layer. The feed-forward network consists of two "
                "linear transformations with a ReLU activation in between, with an inner dimension of 2048 "
                "(4x the model dimension of 512).\n\n"
                "The Decoder also consists of 6 identical layers. In addition to the two sub-layers present in "
                "the encoder, the decoder has a third sub-layer: cross-attention over the encoder's output. "
                "The decoder's self-attention is masked to prevent positions from attending to future tokens, "
                "ensuring autoregressive generation.\n\n"
                "Positional Encoding is necessary because self-attention is permutation-invariant — it has no "
                "inherent notion of token order. The original Transformer uses sinusoidal positional encodings: "
                "PE(pos, 2i) = sin(pos / 10000^(2i/d_model)) and PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model)). "
                "Modern models like GPT and Llama use learned positional embeddings or Rotary Position Embedding "
                "(RoPE), which encodes positional information directly into the attention computation.\n\n"
                "The original Transformer model had approximately 65 million parameters and was trained on the "
                "WMT 2014 English-to-German translation dataset. Training took 3.5 days on 8 NVIDIA P100 GPUs."
            ),
            # Page 3
            (
                "Chapter 3: Modern Transformer Variants\n\n"
                "BERT (Bidirectional Encoder Representations from Transformers): Published by Devlin et al. at "
                "Google in 2018. BERT is an encoder-only model pre-trained with two objectives: Masked Language "
                "Modeling (MLM), which randomly masks 15% of input tokens and predicts them, and Next Sentence "
                "Prediction (NSP). BERT-base has 110 million parameters with 12 layers and 768 hidden dimensions. "
                "BERT-large has 340 million parameters with 24 layers and 1024 hidden dimensions.\n\n"
                "GPT (Generative Pre-trained Transformer): Developed by OpenAI, GPT models are decoder-only "
                "Transformers trained autoregressively. GPT-2 (2019) had 1.5 billion parameters. GPT-3 (2020) "
                "scaled to 175 billion parameters and demonstrated remarkable few-shot learning abilities. "
                "GPT-4 (2023) is a multimodal model with an estimated 1.76 trillion parameters across a "
                "mixture-of-experts architecture.\n\n"
                "Llama (Large Language Model Meta AI): Released by Meta AI, Llama models are open-weight "
                "decoder-only Transformers. Llama 2 (2023) was released in sizes of 7B, 13B, and 70B parameters. "
                "Llama 3 (2024) improved upon Llama 2 with a larger training corpus of 15 trillion tokens and "
                "introduced a 405B parameter variant. Llama 3.1 further extended the context window to 128K tokens "
                "and added multilingual support. Llama models use Grouped Query Attention (GQA) for efficient "
                "inference and RoPE for positional encoding."
            ),
            # Page 4
            (
                "Chapter 4: Scaling Laws and Efficiency\n\n"
                "The Chinchilla scaling laws, published by Hoffmann et al. at DeepMind in 2022, established that "
                "for a given compute budget, the optimal model size and training data size should scale proportionally. "
                "Specifically, they found that many existing LLMs (including GPT-3) were significantly undertrained "
                "relative to their size. Chinchilla, with only 70 billion parameters but trained on 1.4 trillion "
                "tokens, outperformed the 280 billion parameter Gopher model.\n\n"
                "Efficient attention mechanisms address the quadratic O(n^2) memory and computation cost of standard "
                "self-attention:\n"
                "- Flash Attention (Dao et al., 2022): Reorders the attention computation to minimize GPU memory "
                "reads/writes, achieving 2-4x speedup without approximation.\n"
                "- Sparse Attention: Only computes attention over a subset of token pairs, reducing complexity "
                "to O(n * sqrt(n)) or O(n * log(n)).\n"
                "- Sliding Window Attention: Used in Mistral models, limits attention to a fixed window of "
                "neighboring tokens.\n\n"
                "Mixture of Experts (MoE): Routes each token to a subset of specialized 'expert' sub-networks. "
                "Only a fraction of the total parameters are active for any given input, enabling models with "
                "trillions of total parameters to have inference costs comparable to much smaller dense models. "
                "Mixtral 8x7B, for example, has 46.7B total parameters but only uses about 12.9B per token.\n\n"
                "Quantization reduces model size by representing weights in lower precision (e.g., 4-bit integers "
                "instead of 16-bit floats). GPTQ and AWQ are popular quantization methods that maintain most of "
                "the model's quality while reducing memory requirements by 4x."
            ),
        ],
    },
    "Knowledge_Graphs_in_AI.pdf": {
        "title": "Knowledge Graphs in AI Systems",
        "pages": [
            # Page 1
            (
                "Chapter 1: Introduction to Knowledge Graphs\n\n"
                "A knowledge graph is a structured representation of real-world entities and the relationships "
                "between them. The concept was popularized by Google in 2012 when they launched the Google Knowledge "
                "Graph to enhance search results with structured information. Knowledge graphs store data as "
                "triples: (subject, predicate, object) — for example, (Albert Einstein, born_in, Ulm).\n\n"
                "Knowledge graphs differ from traditional relational databases in several important ways. Relational "
                "databases store data in fixed-schema tables with rows and columns. Knowledge graphs use a flexible "
                "schema (or no schema at all), where new entity types and relationship types can be added without "
                "modifying existing structure. This makes knowledge graphs particularly well-suited for domains "
                "where the data model evolves over time.\n\n"
                "The Resource Description Framework (RDF) is a W3C standard for representing knowledge graph data. "
                "In RDF, all data is expressed as triples of (subject, predicate, object), where subjects and "
                "predicates are URIs and objects can be URIs or literal values. SPARQL is the standard query "
                "language for RDF data.\n\n"
                "Property graphs offer an alternative representation where both nodes and edges can have arbitrary "
                "key-value properties attached to them. Neo4j is the most widely-used property graph database, with "
                "its query language Cypher. Property graphs are generally considered more intuitive and performant "
                "for application developers than RDF triple stores."
            ),
            # Page 2
            (
                "Chapter 2: Neo4j and Cypher Query Language\n\n"
                "Neo4j is the world's leading graph database, first released in 2007 by Neo4j, Inc. (formerly "
                "Neo Technology). It uses the ACID-compliant property graph model and is written in Java. "
                "Neo4j stores data natively as graphs, with index-free adjacency — each node directly references "
                "its neighbors, enabling constant-time relationship traversal regardless of graph size.\n\n"
                "Cypher is Neo4j's declarative query language, designed to be visually intuitive. Pattern matching "
                "uses ASCII art-like syntax: (a)-[:KNOWS]->(b) matches a node 'a' connected to node 'b' via a "
                "'KNOWS' relationship. Key Cypher clauses include MATCH (pattern matching), CREATE (creating nodes/"
                "relationships), MERGE (create-if-not-exists), WHERE (filtering), and RETURN (projecting results).\n\n"
                "Neo4j 5.11 introduced native vector search indexes, allowing vector similarity queries alongside "
                "traditional graph pattern matching. This is done via: CALL db.index.vector.queryNodes(indexName, k, "
                "queryVector). The combination of graph structure and vector search in a single database is "
                "particularly powerful for GraphRAG applications.\n\n"
                "Graph traversal queries excel at multi-hop reasoning. For example, finding all concepts that are "
                "two hops away from 'Transformer' in a knowledge graph: MATCH (t {name: 'Transformer'})-[*2]-(c) "
                "RETURN DISTINCT c.name. This type of query would require multiple JOINs in a relational database "
                "and is impractical in a pure vector search system."
            ),
            # Page 3
            (
                "Chapter 3: GraphRAG — Combining Graphs with RAG\n\n"
                "GraphRAG integrates knowledge graph structure into the Retrieval-Augmented Generation pipeline. "
                "Unlike traditional RAG, which treats all documents as independent text chunks, GraphRAG models "
                "the relationships between concepts, enabling answers that require connecting information across "
                "multiple documents.\n\n"
                "A typical GraphRAG pipeline works as follows:\n"
                "1. Ingestion: Documents are processed into text chunks. An LLM extracts entities and relationships "
                "from each chunk, building a knowledge graph.\n"
                "2. Indexing: Text chunks are embedded as vectors and stored alongside graph nodes. Each chunk node "
                "in the graph is connected to the entities it mentions.\n"
                "3. Retrieval: Queries trigger two parallel retrieval paths:\n"
                "   a. Vector search: Finds the most semantically similar chunks.\n"
                "   b. Graph traversal: Follows entity relationships to find structurally connected information.\n"
                "4. Generation: Retrieved context from both paths is merged, deduplicated, and passed to the LLM.\n\n"
                "The key advantage of GraphRAG over traditional RAG is multi-hop question answering. Consider: "
                "'What optimization algorithm is commonly used to train the architecture that replaced RNNs?' "
                "Answering this requires: (1) knowing that Transformers replaced RNNs, (2) knowing that Adam "
                "is commonly used to train Transformers. A vector search might find documents about either topic "
                "separately, but graph traversal can follow the chain: RNN -> replaced_by -> Transformer -> "
                "trained_with -> Adam.\n\n"
                "Microsoft Research's 2024 GraphRAG paper demonstrated that graph-based retrieval significantly "
                "outperforms vector-only retrieval on global summarization and multi-hop reasoning tasks."
            ),
            # Page 4
            (
                "Chapter 4: Entity Extraction and Graph Construction\n\n"
                "Automated knowledge graph construction from unstructured text requires entity extraction and "
                "relation extraction. Traditional approaches used Named Entity Recognition (NER) models like "
                "spaCy's en_core_web_trf, which identifies entities such as persons, organizations, locations, "
                "and dates. However, NER models are limited to predefined entity types and cannot identify "
                "domain-specific concepts.\n\n"
                "LLM-based entity extraction uses prompting to identify entities and relationships from text. "
                "For example, given the text 'BERT was developed by Google and uses the Transformer architecture,' "
                "an LLM can extract: (BERT, DEVELOPED_BY, Google), (BERT, USES, Transformer). This approach is "
                "more flexible than NER but is slower and more expensive due to LLM inference costs.\n\n"
                "LlamaIndex provides the SimpleLLMPathExtractor, which prompts the LLM to extract up to N "
                "knowledge graph triples per text chunk. It supports configurable entity types and relation types. "
                "The extraction is done in parallel across chunks, with rate limiting to avoid API throttling. "
                "For example, with Groq's free tier limit of 6000 tokens per minute, processing a 20-chunk document "
                "with ~1500 tokens per extraction requires approximately 5 minutes with 15-second intervals.\n\n"
                "Graph quality depends heavily on the extraction prompt. Overly broad extraction produces noisy "
                "graphs with meaningless entities (e.g., 'Page 5', 'Copyright 2024'). Constrained extraction "
                "with explicit entity types (Person, Organization, Concept, Event, Place) and relationship types "
                "(MENTIONS, RELATED_TO, PART_OF, CAUSES) produces cleaner, more useful knowledge graphs. "
                "Post-processing steps like entity resolution (merging 'ML' and 'Machine Learning' into one node) "
                "further improve graph quality."
            ),
        ],
    },
}


class PDFGenerator(FPDF):
    """Custom PDF class with consistent styling for NeuroSpace test corpus."""

    # Unicode -> ASCII replacements for latin-1 compatible fonts
    UNICODE_REPLACEMENTS = {
        '\u2014': '--',   # em-dash
        '\u2013': '-',    # en-dash
        '\u2018': "'",    # left single quote
        '\u2019': "'",    # right single quote
        '\u201c': '"',    # left double quote
        '\u201d': '"',    # right double quote
        '\u2026': '...',  # ellipsis
        '\u2022': '*',    # bullet
        '\u00b7': '*',    # middle dot
        '\u2212': '-',    # minus sign
        '\u00d7': 'x',    # multiplication sign
    }

    def _sanitize(self, text: str) -> str:
        """Replace Unicode characters with ASCII equivalents for Helvetica compatibility."""
        for unicode_char, replacement in self.UNICODE_REPLACEMENTS.items():
            text = text.replace(unicode_char, replacement)
        return text

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        if hasattr(self, "_doc_title"):
            self.cell(0, 8, self._sanitize(self._doc_title), align="R")
        self.ln(5)

    def footer(self):
        self.set_y(-20)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def add_title_page(self, title: str):
        self.add_page()
        self.ln(40)
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 12, self._sanitize(title), align="C")
        self.ln(10)
        self.set_font("Helvetica", "", 12)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "NeuroSpace Evaluation Test Corpus", align="C")
        self.ln(6)
        self.cell(0, 8, "Auto-generated for retrieval quality benchmarking", align="C")

    def add_content_page(self, text: str):
        self.add_page()
        self.set_font("Helvetica", "", 11)
        self.set_text_color(0, 0, 0)

        for line in text.split("\n"):
            stripped = self._sanitize(line.strip())
            if stripped.startswith("Chapter"):
                self.set_x(self.l_margin)
                self.set_font("Helvetica", "B", 14)
                self.set_text_color(30, 30, 120)
                self.ln(3)
                self.multi_cell(0, 8, stripped)
                self.ln(2)
                self.set_font("Helvetica", "", 11)
                self.set_text_color(0, 0, 0)
            elif stripped.startswith("- "):
                indent = 15
                self.set_x(self.l_margin + indent)
                available_width = self.w - self.l_margin - self.r_margin - indent
                self.multi_cell(available_width, 6, stripped)
            elif stripped == "":
                self.set_x(self.l_margin)
                self.ln(3)
            else:
                self.set_x(self.l_margin)
                self.multi_cell(0, 6, stripped)


def generate_corpus():
    """Generate all test corpus PDFs."""
    output_dir = os.path.join(os.path.dirname(__file__), "test_corpus")
    os.makedirs(output_dir, exist_ok=True)

    for filename, doc in DOCUMENTS.items():
        print(f"  Generating {filename}...")
        pdf = PDFGenerator()
        pdf._doc_title = doc["title"]

        # Title page
        pdf.add_title_page(doc["title"])

        # Content pages
        for page_text in doc["pages"]:
            pdf.add_content_page(page_text)

        output_path = os.path.join(output_dir, filename)
        pdf.output(output_path)
        print(f"  [OK] {filename} ({len(doc['pages'])} content pages)")

    print(f"\n[OK] Test corpus generated in: {output_dir}")
    print(f"   Total documents: {len(DOCUMENTS)}")
    print(f"   Total pages: {sum(len(d['pages']) + 1 for d in DOCUMENTS.values())}")  # +1 for title page
    print(f"\n[NEXT] Ingest these PDFs into NeuroSpace via the /ingest endpoint.")


if __name__ == "__main__":
    generate_corpus()
