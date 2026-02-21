from llama_index.core import PropertyGraphIndex
from app.services.llm_factory import llm_factory

class QueryService:
    def __init__(self):
        print("⚡ Initializing Hybrid Query Engine...")
        self.storage_context = llm_factory.get_storage_context()
        
        # Load the existing graph we built on Day 10
        # 'from_existing' ensures we don't accidentally overwrite data
        self.index = PropertyGraphIndex.from_existing(
            property_graph_store=self.storage_context.property_graph_store,
            embed_model=llm_factory.embed_model,
            llm=llm_factory.llm,
        )
        
        # Configure the Retriever
        # include_text=True ensures we use Vector Search (Chunk Text)
        # similarity_top_k=3 gets the top 3 best matching chunks
        self.query_engine = self.index.as_query_engine(
            include_text=True, 
            similarity_top_k=3
        )
        print(" Query Engine Ready!")

    def ask(self, question: str) -> str:
        """
        Sends the question through the Hybrid pipeline to Groq.
        """
        print(f" Thinking about: '{question}'...")
        response = self.query_engine.query(question)
        return str(response)

# Singleton instance
query_service = QueryService()