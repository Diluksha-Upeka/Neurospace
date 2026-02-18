import os
from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.graph_stores.neo4j import Neo4jGraphStore, Neo4jPropertyGraphStore
from llama_index.core import StorageContext
from app.config import settings


class LLMFactory:
    def __init__(self):
        # 1. Setup the LLM (Groq - Llama 3)
        # Groq is insanely fast, perfect for extraction.
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("Error: GROQ_API_KEY not found in .env file!")

        print("⚡ Initializing Groq (Llama 3)...")
        self.llm = Groq(
            model="llama-3.1-8b-instant",
            api_key=groq_key,
            temperature=0
        )

        # 2. Setup the Embedder (Local HuggingFace)
        # This runs ON YOUR CPU. No API calls. No Rate Limits.
        # 'all-MiniLM-L6-v2' is the industry standard for fast, efficient embeddings.
        print(" Initializing Local HuggingFace Embeddings...")
        self.embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # 3. Apply to Global Settings
        Settings.llm = self.llm
        Settings.embed_model = self.embed_model
        Settings.chunk_size = 512

    def get_storage_context(self):
        graph_store = Neo4jGraphStore(
            username=settings.NEO4J_USER,
            password=settings.NEO4J_PASSWORD,
            url=settings.NEO4J_URI,
            database="neo4j",
        )

        # PropertyGraphIndex requires Neo4jPropertyGraphStore to persist triples
        property_graph_store = Neo4jPropertyGraphStore(
            username=settings.NEO4J_USER,
            password=settings.NEO4J_PASSWORD,
            url=settings.NEO4J_URI,
            database="neo4j",
        )

        return StorageContext.from_defaults(
            graph_store=graph_store,
            property_graph_store=property_graph_store,
        )


# Initialize
try:
    llm_factory = LLMFactory()
except Exception as e:
    print(f"Error: LLM Factory Init Failed: {e}")
    llm_factory = None
