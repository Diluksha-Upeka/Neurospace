import threading
from llama_index.core import PropertyGraphIndex
from llama_index.core.indices.property_graph import SimpleLLMPathExtractor
from llama_index.core import Document
from app.services.llm_factory import LLMFactory
import nest_asyncio

# Patch asyncio to allow nested event loops.
# LlamaIndex internally uses async for LLM/embedding calls.
nest_asyncio.apply()


class GraphService:
    def __init__(self):
        self._llm_factory = None
        self._storage_context = None
        self._extractor = None

        # Guard against duplicate concurrent processing of the same file
        self._processing_lock = threading.Lock()
        self._files_in_progress = set()

        # Define what we want the AI to extract
        self.entities = ["Person", "Organization", "Event", "Concept", "Place"]
        self.relations = ["FOUNDED", "LOCATED_AT", "PART_OF", "CAUSES", "MENTIONS", "RELATED_TO"]

    def _init_components(self):
        """Lazy initialization — only connects to Neo4j when first needed."""
        if self._llm_factory is not None:
            return
        self._llm_factory = LLMFactory()
        self._storage_context = self._llm_factory.get_storage_context()

        # Configure the Extractor
        # Groq is fast enough to handle higher parallelism
        self._extractor = SimpleLLMPathExtractor(
            llm=self._llm_factory.llm,
            max_paths_per_chunk=5,
            num_workers=1,
        )

    def _is_already_ingested(self, filename: str) -> bool:
        """Check if this file has already been ingested into Neo4j."""
        try:
            from app.database import db
            with db.get_session() as session:
                result = session.run(
                    "MATCH (d:Document {id: $filename})-[:HAS_CHUNK]->(c:Chunk) "
                    "RETURN count(c) as chunk_count",
                    filename=filename
                )
                record = result.single()
                if record and record["chunk_count"] > 0:
                    return True
        except Exception as e:
            print(f"  ⚠️ Could not check for existing document: {e}")
        return False

    def process_document(self, text_chunks: list, filename: str):
        """
        Takes a list of text chunks (strings or dicts), creates Document objects,
        and builds the Graph.
        Includes deduplication: skips if the file is already in the graph or currently being processed.
        """
        # --- Deduplication Guard ---
        with self._processing_lock:
            if filename in self._files_in_progress:
                print(f"  ⚠️ SKIPPED: {filename} is already being processed by another thread.")
                return None
            self._files_in_progress.add(filename)

        try:
            self._init_components()

            # Check if already ingested in Neo4j
            if self._is_already_ingested(filename):
                print(f"  ⚠️ SKIPPED: {filename} is already in the Knowledge Graph. "
                      f"Use /clear to re-ingest.")
                return None

            print(f"  Building Knowledge Graph for {filename}...")

            # Convert the incoming data to LlamaIndex Document objects
            # IMPORTANT: Do NOT mutate the input dicts (no .pop())
            documents = []
            for chunk in text_chunks:
                if isinstance(chunk, dict):
                    text = chunk.get("text", "")
                    # Build metadata without mutating the original dict
                    meta = {k: v for k, v in chunk.items() if k != "text"}
                    # Preserve source filename in both custom and LlamaIndex-standard keys
                    meta["filename"] = filename
                    meta["file_name"] = filename
                    # Normalize page_number for LlamaIndex compatibility
                    if "page_number" in meta:
                        meta["page_label"] = str(meta["page_number"])
                    documents.append(Document(text=text, metadata=meta))
                else:
                    # Backwards compatible for plain string chunks
                    documents.append(Document(
                        text=chunk,
                        metadata={"filename": filename, "file_name": filename}
                    ))

            import time

            # Create the Property Graph Index with an empty document list first
            print(f"  Initializing empty graph index...")
            index = PropertyGraphIndex.from_documents(
                [],
                storage_context=self._storage_context,
                kg_extractors=[self._extractor],
                embed_model=self._llm_factory.embed_model,
            )

            # Intelligent Batching to prevent Groq API 6000 TPM Rate Limit
            print(f"  Start extraction sequence for {len(documents)} chunks (Token Rate-Limit Safe)...")
            for i, doc in enumerate(documents):
                print(f"  Extracting Graph from Chunk {i+1}/{len(documents)}...")
                try:
                    index.insert(doc)
                    # A chunk + extraction prompt is ~1500 tokens. 
                    # 6000 TPM Limit / 1500 tokens = 4 chunks per minute.
                    # 60 seconds / 4 chunks = 15 seconds sleep per chunk.
                    time.sleep(15)
                except Exception as e:
                    print(f"  ⚠️ Chunk {i+1} extraction failed (likely rate limits): {e}")
                    time.sleep(30) # Back-off if we hit a hard 429 Error

            try:
                from app.database import db
                with db.get_session() as session:
                    session.run(
                        "MATCH (c:Chunk) WHERE c.filename = $filename "
                        "MERGE (d:Document {id: $filename, name: $filename}) "
                        "MERGE (d)-[:HAS_CHUNK]->(c)",
                        filename=filename
                    )
                print(f"  Linked chunks to Document node for {filename}")
            except Exception as e:
                print(f"  Failed to link Document node: {e}")

            print(f"  Graph built successfully for {filename}!")
            return index

        finally:
            # Always release the lock, even if processing failed
            with self._processing_lock:
                self._files_in_progress.discard(filename)


# Singleton — no Neo4j connection until process_document() is called
graph_service = GraphService()
