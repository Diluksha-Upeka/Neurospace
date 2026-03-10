
from llama_index.core import PropertyGraphIndex, PromptTemplate
from app.services.llm_factory import llm_factory
from cachetools import TTLCache
import hashlib
 # --- 🛡️ THE NEUROSPACE PERSONA ---
# This forces Groq to act as an intelligent graph-aware assistant.
# {context_str} contains both text chunks AND retrieved graph relationships (facts/triples).
# {query_str} is the user's question.
NEUROSPACE_PROMPT_TMPL = (
    "You are the NeuroSpace Multi-Modal Assistant, an advanced AI engine analyzing a Knowledge Graph.\n"
    "Your directive is to answer the user's question based on the provided context, which includes both text snippets and extracted structural facts (Entity -> Relationship -> Entity).\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "Rules:\n"
    "1. Synthesize the text chunks and structural facts to formulate a comprehensive answer.\n"
    "2. If the context does not contain enough information, state clearly what you *do* know, and what is missing.\n"
    "3. Be concise and professional. Do not mention that you were provided with context or 'extracted facts'.\n"
    "Query: {query_str}\n"
    "Answer: "
)
neurospace_prompt = PromptTemplate(NEUROSPACE_PROMPT_TMPL)
# ---------------------------------

class QueryService:
    def __init__(self):
        print("⚙️ Initializing Hybrid Query Engine Cache...")
        self.storage_context = llm_factory.get_storage_context()
        # 🧠 Initialize the Cache
        # maxsize=100: Remembers the last 100 questions.
        # ttl=3600: Forgets them after 1 hour (3600 seconds).
        self.cache = TTLCache(maxsize=100, ttl=3600)
        print("✅ Query Engine Cache Ready!")

    def _get_query_engine(self):
        """Builds the query engine dynamically to ensure it captures newly ingested files."""
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
        vector_retriever = VectorContextRetriever(
            index.property_graph_store,
            embed_model=llm_factory.embed_model,
        )

        return index.as_query_engine(
            sub_retrievers=[
                synonym_retriever,
                vector_retriever
            ],
            text_qa_template=neurospace_prompt
        )

    def _generate_cache_key(self, text: str) -> str:
        """Converts the question into a unique hash string."""
        # Convert to lowercase and strip whitespace so "What is RAG?" and "what is rag? " match
        normalized_text = text.lower().strip()
        return hashlib.md5(normalized_text.encode('utf-8')).hexdigest()


    def ask(self, question: str) -> dict:
        """
        Sends the question through the Hybrid pipeline.
        Checks the cache first for instant responses.
        """
        # 1. Check Cache
        cache_key = self._generate_cache_key(question)
        if cache_key in self.cache:
            print(f"⚡ CACHE HIT! Instant response for: '{question}'")
            return self.cache[cache_key]

        # 2. Not in cache, run the heavy engine on the LIVE graph state
        print(f"🧠 Thinking deeply about: '{question}'...")
        query_engine = self._get_query_engine()
        response = query_engine.query(question)
        answer_text = str(response)
        sources = []
        if response.source_nodes:
            for node in response.source_nodes:
                meta = node.metadata
                source_info = {
                    "filename": meta.get("filename", "Unknown File"),
                    "text_snippet": node.text[:150] + "...",
                    "score": round(node.score, 3) if node.score else None
                }
                if "page_number" in meta:
                    source_info["page"] = meta["page_number"]
                if "start" in meta and "end" in meta:
                    source_info["timestamp"] = f"{meta['start']}s - {meta['end']}s"
                sources.append(source_info)
        final_result = {
            "answer": answer_text,
            "sources": sources
        }
        # 3. Save to Cache for next time
        self.cache[cache_key] = final_result
        return final_result

# Singleton instance
query_service = QueryService()