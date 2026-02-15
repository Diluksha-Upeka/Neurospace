from app.database import db


def setup_constraints():
    """
    Runs Cypher queries to set up unique constraints and indexes.
    Run this ONCE when the app starts.
    """
    commands = [
        # 1. Ensure Document filenames are unique
        "CREATE CONSTRAINT doc_id_unique IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
        # 2. Ensure Chunks have unique IDs
        "CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE",
        # 3. Ensure Entities (Concepts) are unique (Don't create duplicate 'Elon Musk' nodes)
        "CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.name IS UNIQUE",
        # 4. Create a Vector Index for Chunks (for Similarity Search)
        # We call it 'chunk_vector_index'.
        # dimensions=1536 is standard for OpenAI embeddings.
        """
        CREATE VECTOR INDEX chunk_vector_index IF NOT EXISTS
        FOR (c:Chunk) ON (c.embedding)
        OPTIONS {indexConfig: {
         `vector.dimensions`: 1536,
         `vector.similarity_function`: 'cosine'
        }}
        """,
    ]

    print("🏗️ Setting up Graph Constraints & Indexes...")
    try:
        # Get a session from our Singleton DB
        with db.get_session() as session:
            for cmd in commands:
                session.run(cmd)
        print("✅ Graph Schema Configured!")
    except Exception as e:
        print(f"❌ Graph Setup Failed: {e}")


if __name__ == "__main__":
    # Allow running this script directly
    db.connect()
    setup_constraints()
    db.close()
