from neo4j import GraphDatabase

from .config import settings


class GraphDB:
    def __init__(self):
        self.driver = None

    def connect(self):
        if not self.driver:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                encrypted=False,
            )
            print("Connected to Neo4j Graph Database!")

    def close(self):
        if self.driver:
            self.driver.close()
            print("Disconnected from Neo4j.")

    def get_session(self):
        return self.driver.session()

    def clear_graph(self):
        """Deletes ALL nodes and relationships from the Neo4j database."""
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            print("🗑️ Neo4j graph cleared — all nodes and relationships deleted.")

    def get_graph_stats(self) -> dict:
        """
        Returns comprehensive statistics about the current knowledge graph.
        Used for the /stats API endpoint and for CV metrics.
        """
        stats = {}
        with self.driver.session() as session:
            # Total nodes and relationships
            result = session.run("MATCH (n) RETURN count(n) as total_nodes")
            stats["total_nodes"] = result.single()["total_nodes"]

            result = session.run("MATCH ()-[r]->() RETURN count(r) as total_relationships")
            stats["total_relationships"] = result.single()["total_relationships"]

            # Node counts by label
            result = session.run(
                "MATCH (n) UNWIND labels(n) AS label "
                "RETURN label, count(*) AS count ORDER BY count DESC"
            )
            stats["node_labels"] = {record["label"]: record["count"] for record in result}

            # Relationship counts by type
            result = session.run(
                "MATCH ()-[r]->() RETURN type(r) AS rel_type, count(*) AS count "
                "ORDER BY count DESC"
            )
            stats["relationship_types"] = {record["rel_type"]: record["count"] for record in result}

            # Documents ingested
            result = session.run("MATCH (d:Document) RETURN count(d) as doc_count")
            stats["documents_ingested"] = result.single()["doc_count"]

            # Chunks with vectors
            result = session.run(
                "MATCH (c:Chunk) WHERE c.embedding IS NOT NULL "
                "RETURN count(c) as vector_count"
            )
            stats["vector_indexed_chunks"] = result.single()["vector_count"]

            # Entity count (non-Chunk, non-Document nodes)
            result = session.run(
                "MATCH (e) WHERE NOT e:Chunk AND NOT e:Document "
                "RETURN count(e) as entity_count"
            )
            stats["total_entities"] = result.single()["entity_count"]

        return stats


# Singleton instance
db = GraphDB()
