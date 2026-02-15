import os
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.graph_stores.neo4j import Neo4jGraphStore
from llama_index.core import StorageContext
from app.config import settings


class LLMFactory:
    def __init__(self):
        # 1. Setup the LLM (The Reasoning Engine)
        # We use GPT-3.5-Turbo for speed/cost, or GPT-4o for complex reasoning
        self.llm = OpenAI(model="gpt-3.5-turbo", temperature=0)

        # 2. Setup the Embedder (The Translator)
        # Converts text to vectors for Similarity Search
        self.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

        # 3. Apply to Global Settings
        Settings.llm = self.llm
        Settings.embed_model = self.embed_model
        Settings.chunk_size = 512  # Smaller chunks are better for graphs

    def get_storage_context(self):
        """
        Connects LlamaIndex to our Neo4j Docker Container.
        """
        graph_store = Neo4jGraphStore(
            username=settings.NEO4J_USER,
            password=settings.NEO4J_PASSWORD,
            url=settings.NEO4J_URI,
            database="neo4j",
        )

        # StorageContext is the container for VectorStore, GraphStore, and DocStore
        storage_context = StorageContext.from_defaults(graph_store=graph_store)
        return storage_context


# Initialize immediately
llm_factory = LLMFactory()
