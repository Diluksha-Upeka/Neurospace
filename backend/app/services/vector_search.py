from app.database import db
from app.services.llm_factory import llm_factory

# Vector Search Service
class VectorSearchService:
    def __init__(self):
        self.embed_model = llm_factory.embed_model

    def search_similar_chunks(self, query: str, limit: int = 3):
        """
        1. Embed the user's query (Text -> Vector).
        2. Send vector to Neo4j.
        3. Neo4j calculates Cosine Similarity. (Vector Search)
        4. Return top X text chunks.
        """
        print(f" Vector Searching for: '{query}'")
        
        # 1. Generate Vector (384 float values)
        query_vector = self.embed_model.get_query_embedding(query)
        
        # 2. Cypher Query for Vector Search
        # CALL db.index.vector.queryNodes(INDEX_NAME, K, VECTOR)
        cypher_query = """
        CALL db.index.vector.queryNodes('chunk_vector_index', $limit, $embedding)
        YIELD node, score
        RETURN node.text AS text, score
        """
        
        results = []
        with db.get_session() as session:
            result = session.run(cypher_query, limit=limit, embedding=query_vector)
            for record in result:
                results.append({
                    "text": record["text"],
                    "score": record["score"] # Similarity score (0 to 1)
                })
        
        return results

# Singleton
vector_search = VectorSearchService()