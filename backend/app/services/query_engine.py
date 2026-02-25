
from llama_index.core import PropertyGraphIndex
from app.services.llm_factory import llm_factory
from cachetools import TTLCache
import hashlib

class QueryService:
    def __init__(self):
        print("⚙️ Initializing Hybrid Query Engine...")
        self.storage_context = llm_factory.get_storage_context()
        self.index = PropertyGraphIndex.from_existing(
            property_graph_store=self.storage_context.property_graph_store,
            embed_model=llm_factory.embed_model,
            llm=llm_factory.llm,
        )
        self.query_engine = self.index.as_query_engine(
            include_text=True, 
            similarity_top_k=3
        )
        # 🧠 Initialize the Cache
        # maxsize=100: Remembers the last 100 questions.
        # ttl=3600: Forgets them after 1 hour (3600 seconds).
        self.cache = TTLCache(maxsize=100, ttl=3600)
        print("✅ Query Engine Ready!")

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

        # 2. Not in cache, run the heavy engine
        print(f"🧠 Thinking deeply about: '{question}'...")
        response = self.query_engine.query(question)
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