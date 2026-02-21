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

    def query(self, question: str) -> dict:
        """
        Sends the question through the Hybrid pipeline.
        Returns the answer AND the sources used.
        """
        print(f" Thinking about: '{question}'...")
        response = self.query_engine.query(question)
        
        # 1. Extract the synthesized text answer
        answer_text = str(response)
        
        # 2. Extract the source nodes (the chunks it used)
        sources = []
        if response.source_nodes:
            for node in response.source_nodes:
                # LlamaIndex stores metadata in node.metadata
                meta = node.metadata
                
                # Build a clean source object
                source_info = {
                    "filename": meta.get("filename", "Unknown File"),
                    "text_snippet": node.text[:150] + "...", # First 150 chars
                    "score": round(node.score, 3) if node.score else None
                }
                
                # Add specific metadata depending on if it's a PDF or Video
                if "page_number" in meta:
                    source_info["page"] = meta["page_number"]
                if "start" in meta and "end" in meta:
                    source_info["timestamp"] = f"{meta['start']}s - {meta['end']}s"
                    
                sources.append(source_info)
                
        return {
            "answer": answer_text,
            "sources": sources
        }

# Singleton instance
query_service = QueryService()