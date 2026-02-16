from llama_index.core import PropertyGraphIndex
from llama_index.core.indices.property_graph import SimpleLLMPathExtractor
from llama_index.core import Document
from app.services.llm_factory import LLMFactory


class GraphService:
    def __init__(self):
        self._llm_factory = None
        self._storage_context = None
        self._extractor = None

        # Define what we want the AI to extract
        # This acts as a schema for the LLM
        self.entities = ["Person", "Organization", "Event", "Concept", "Place"]
        self.relations = ["FOUNDED", "LOCATED_AT", "PART_OF", "CAUSES", "MENTIONS", "RELATED_TO"]

    def _init_components(self):
        """Lazy initialization — only connects to Neo4j when first needed."""
        if self._llm_factory is not None:
            return
        self._llm_factory = LLMFactory()
        self._storage_context = self._llm_factory.get_storage_context()

        # Configure the Extractor
        # This tells the LLM: "Find these entities and relations in the text"
        self._extractor = SimpleLLMPathExtractor(
            llm=self._llm_factory.llm,
            extract_prompt_template=None,  # Use default prompt
            kg_entities=self.entities,
            kg_relations=self.relations,
            max_paths_per_chunk=10,  # Limit complexity
            num_workers=4,
        )

    def process_document(self, text_chunks: list, filename: str):
        """
        Takes a list of text chunks (strings), creates Document objects,
        and builds the Graph.
        """
        self._init_components()

        print(f"🕸️ Building Knowledge Graph for {filename}...")

        # Convert strings to LlamaIndex Document objects
        documents = [
            Document(text=chunk, metadata={"filename": filename})
            for chunk in text_chunks
        ]

        # Create the Property Graph Index
        # This step calls OpenAI to extract entities and inserts them into Neo4j
        index = PropertyGraphIndex.from_documents(
            documents,
            storage_context=self._storage_context,
            kg_extractors=[self._extractor],
            embed_model=self._llm_factory.embed_model,
            show_progress=True,
        )

        print(f"✅ Graph built successfully for {filename}!")
        return index


# Singleton — no Neo4j connection until process_document() is called
graph_service = GraphService()
