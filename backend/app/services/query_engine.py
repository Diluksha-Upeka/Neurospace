
from llama_index.core import PropertyGraphIndex, PromptTemplate
from app.services.llm_factory import llm_factory
from cachetools import TTLCache
import hashlib
import re
import time

# --- 🛡️ THE NEUROSPACE ANTI-HALLUCINATION PROMPT ---
# This forces the LLM to ONLY use provided context and cite exact sources.
# {context_str} contains text chunks AND retrieved graph relationships.
# {query_str} is the user's question.
NEUROSPACE_PROMPT_TMPL = (
    "You are the NeuroSpace Assistant. You answer questions using ONLY the context provided below.\n"
    "The context contains text chunks from uploaded documents. Each chunk has metadata including filename, page number (for PDFs), or timestamp (for videos).\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "STRICT RULES — FOLLOW EVERY ONE:\n"
    "1. Answer ONLY using information found in the context above. NEVER use your own knowledge or training data.\n"
    "2. For EVERY factual claim in your answer, cite the source inline: [filename, page X] for PDFs or [filename, Xs-Ys] for videos.\n"
    "3. If the context does not contain the answer, respond ONLY with: 'The uploaded documents do not contain information about this topic.'\n"
    "4. NEVER fabricate, guess, or infer information that is not explicitly stated in the context.\n"
    "5. If multiple sources discuss the same topic, present information from each source with its own citation.\n"
    "6. When quoting specific facts (numbers, dates, names), use the EXACT wording from the context.\n"
    "7. Be concise and factual. Do not add disclaimers or preambles.\n"
    "\n"
    "Query: {query_str}\n"
    "Answer: "
)
neurospace_prompt = PromptTemplate(NEUROSPACE_PROMPT_TMPL)
# ---------------------------------

# Valid retrieval modes
VALID_MODES = ("hybrid", "vector_only", "synonym_only")

class QueryService:
    def __init__(self):
        print("⚙️ Initializing Hybrid Query Engine Cache...")
        self.storage_context = llm_factory.get_storage_context()
        # 🧠 Initialize the Cache
        # maxsize=100: Remembers the last 100 questions.
        # ttl=3600: Forgets them after 1 hour (3600 seconds).
        self.cache = TTLCache(maxsize=100, ttl=3600)
        print("✅ Query Engine Cache Ready!")

    def _get_query_engine(self, mode: str = "hybrid"):
        """
        Builds the query engine dynamically to ensure it captures newly ingested files.

        Modes:
            - "hybrid": Uses both LLM Synonym + Vector retrievers (default)
            - "vector_only": Uses only the Vector Context Retriever
            - "synonym_only": Uses only the LLM Synonym Retriever
        """
        index = PropertyGraphIndex.from_existing(
            property_graph_store=self.storage_context.property_graph_store,
            embed_model=llm_factory.embed_model,
            llm=llm_factory.llm,
        )
        # We use explicit graph traversal sub-retrievers
        from llama_index.core.indices.property_graph.sub_retrievers.llm_synonym import LLMSynonymRetriever
        from llama_index.core.indices.property_graph.sub_retrievers.vector import VectorContextRetriever

        # 1. LLM Synonym Retriever: Uses the LLM to generate synonyms for the query, and searches the Neo4j graph for them explicitly.
        synonym_retriever = LLMSynonymRetriever(
            index.property_graph_store,
            llm=llm_factory.llm,
            include_text=True,
        )

        # 2. Vector Context Retriever: Extracts paragraphs and metadata directly from the Node's properties
        # Higher similarity_top_k = more chunks = better coverage for citations
        vector_retriever = VectorContextRetriever(
            index.property_graph_store,
            embed_model=llm_factory.embed_model,
            include_text=True,
            similarity_top_k=5,
        )

        # Select sub-retrievers based on mode
        if mode == "vector_only":
            sub_retrievers = [vector_retriever]
        elif mode == "synonym_only":
            sub_retrievers = [synonym_retriever]
        else:  # "hybrid" — default
            sub_retrievers = [synonym_retriever, vector_retriever]

        return index.as_query_engine(
            sub_retrievers=sub_retrievers,
            text_qa_template=neurospace_prompt
        )

    def _generate_cache_key(self, text: str, mode: str = "hybrid") -> str:
        """Converts the question + mode into a unique hash string."""
        # Include mode in the cache key so different modes don't share cached results
        normalized_text = f"{mode}:{text.lower().strip()}"
        return hashlib.md5(normalized_text.encode('utf-8')).hexdigest()

    def _filter_cited_sources(self, answer_text: str, all_sources: list) -> list:
        """
        Parses the LLM answer for inline citations like [filename, page X] or [filename, Xs-Ys]
        and returns ONLY the sources the LLM actually referenced.
        If no citations are found in the text, returns all sources as fallback.
        """
        # Extract all citation patterns from the answer:
        #   [filename, page X]  or  [filename, Xs-Ys]  or  [filename]
        citation_patterns = re.findall(r'\[([^\]]+)\]', answer_text)

        if not citation_patterns:
            # LLM didn't use inline citations — return all sources as fallback
            print("  ⚠️ No inline citations found in answer, returning all sources")
            return all_sources

        # Build a set of (filename_lower, page_or_none) from the citations
        cited_refs = set()
        for citation in citation_patterns:
            citation = citation.strip()
            # Try to parse "filename, page X"
            page_match = re.match(r'(.+?),\s*page\s+(\d+)', citation, re.IGNORECASE)
            if page_match:
                fname = page_match.group(1).strip().lower()
                page = int(page_match.group(2))
                cited_refs.add((fname, page, None))
                continue

            # Try to parse "filename, Xs-Ys" (timestamp)
            ts_match = re.match(r'(.+?),\s*([\d.]+)s?\s*-\s*([\d.]+)s?', citation, re.IGNORECASE)
            if ts_match:
                fname = ts_match.group(1).strip().lower()
                cited_refs.add((fname, None, "timestamp"))
                continue

            # Just a filename reference like [filename]
            cited_refs.add((citation.strip().lower(), None, None))

        print(f"  🔍 Citations found in answer: {cited_refs}")

        # Filter sources to only those cited
        cited_sources = []
        for source in all_sources:
            source_fname = source["filename"].lower()
            source_page = source.get("page")
            source_ts = source.get("timestamp")

            # Check if this source matches any citation
            is_cited = False
            for (cited_fname, cited_page, cited_type) in cited_refs:
                # Filename match (fuzzy — handles slight variations)
                if cited_fname in source_fname or source_fname in cited_fname:
                    if cited_page is not None and source_page == cited_page:
                        is_cited = True
                        break
                    elif cited_type == "timestamp" and source_ts:
                        is_cited = True
                        break
                    elif cited_page is None and cited_type is None:
                        # Generic filename-only citation
                        is_cited = True
                        break

            if is_cited:
                cited_sources.append(source)

        # If filtering removed everything (parsing mismatch), return all as fallback
        if not cited_sources:
            print("  ⚠️ Citation filtering matched nothing, returning all sources")
            return all_sources

        print(f"  ✅ Filtered {len(all_sources)} sources down to {len(cited_sources)} cited sources")
        return cited_sources


    def ask(self, question: str, mode: str = "hybrid") -> dict:
        """
        Sends the question through the retrieval pipeline.
        Checks the cache first for instant responses.

        Args:
            question: The user's question
            mode: Retrieval mode — "hybrid" (default), "vector_only", or "synonym_only"
        """
        # Validate mode
        if mode not in VALID_MODES:
            mode = "hybrid"

        # 1. Check Cache
        cache_key = self._generate_cache_key(question, mode)
        if cache_key in self.cache:
            print(f"⚡ CACHE HIT! Instant response for: '{question}' (mode={mode})")
            cached = self.cache[cache_key]
            cached["latency_ms"] = 0.0  # Instant from cache
            return cached

        # 2. Not in cache, run the heavy engine on the LIVE graph state
        print(f"🧠 Thinking deeply about: '{question}' (mode={mode})...")
        start_time = time.perf_counter()

        query_engine = self._get_query_engine(mode=mode)
        response = query_engine.query(question)

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        answer_text = str(response)
        all_sources = []
        seen_sources = set()  # Deduplicate citations

        if response.source_nodes:
            for node in response.source_nodes:
                meta = node.metadata
                # Debug: log exactly what metadata comes back from Neo4j
                print(f"  📋 Source node metadata keys: {list(meta.keys())}")
                print(f"  📋 Source node metadata: {meta}")

                # Try multiple key variants for filename
                # LlamaIndex may store as file_name, we store as filename
                filename = (
                    meta.get("filename")
                    or meta.get("file_name")
                    or meta.get("source")
                    or "Unknown File"
                )

                # Try multiple key variants for page number
                page = meta.get("page_number") or meta.get("page_label")
                if page is not None:
                    try:
                        page = int(page)
                    except (ValueError, TypeError):
                        page = None

                # Try multiple key variants for timestamps (video)
                start = meta.get("start")
                end = meta.get("end")
                timestamp = None
                if start is not None and end is not None:
                    timestamp = f"{start}s - {end}s"

                # Deduplicate by (filename, page, timestamp)
                dedup_key = (filename, page, timestamp)
                if dedup_key in seen_sources:
                    continue
                seen_sources.add(dedup_key)

                # Build text snippet — node.text can sometimes be None for graph nodes
                node_text = node.text or node.node.get_content() if hasattr(node, 'node') else node.text
                node_text = node_text or ""
                text_snippet = node_text[:200] + "..." if len(node_text) > 200 else node_text
                if not text_snippet:
                    text_snippet = "(Graph relationship node)"

                source_info = {
                    "filename": filename,
                    "text_snippet": text_snippet,
                    "score": round(node.score, 3) if node.score is not None else None
                }
                if page is not None:
                    source_info["page"] = page
                if timestamp:
                    source_info["timestamp"] = timestamp
                all_sources.append(source_info)

        # 3. Filter to only sources the LLM actually cited in its answer
        cited_sources = self._filter_cited_sources(answer_text, all_sources)

        print(f"  ⏱️ Query completed in {elapsed_ms:.0f}ms (mode={mode})")

        final_result = {
            "answer": answer_text,
            "sources": cited_sources,
            "latency_ms": round(elapsed_ms, 1),
        }
        # 4. Save to Cache for next time
        self.cache[cache_key] = final_result
        return final_result

# Singleton instance
query_service = QueryService()