
from llama_index.core import PropertyGraphIndex, PromptTemplate
from app.services.llm_factory import llm_factory
from cachetools import TTLCache
import hashlib
 # --- 🛡️ THE NEUROSPACE PERSONA ---
# This forces Groq to act as a strict, professional assistant.
# {context_str} is where LlamaIndex injects the retrieved chunks.
# {query_str} is the user's question.
NEUROSPACE_PROMPT_TMPL = (
    "You are the NeuroSpace Multi-Modal Assistant, an advanced AI engine.\n"
    "Your core directive is to answer the user's question STRICTLY based on the context information provided below.\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "Rules:\n"
    "1. If the answer is not contained in the context, politely state: 'I cannot answer this based on the provided documents.' Do not guess or use outside knowledge.\n"
    "2. Be concise, professional, and directly address the query.\n"
    "3. Do not mention that you are an AI or that you were provided with context.\n"
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
        return index.as_query_engine(
            include_text=True, 
            similarity_top_k=3,
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