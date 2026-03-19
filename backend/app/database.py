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


# Singleton instance
db = GraphDB()
