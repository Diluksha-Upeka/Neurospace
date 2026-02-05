from neo4j import GraphDatabase

from app.config import settings


class GraphDB:
    def __init__(self):
        self.driver = None

    def connect(self):
        if not self.driver:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            )
            print("Connected to Neo4j Graph Database!")

    def close(self):
        if self.driver:
            self.driver.close()
            print("Disconnected from Neo4j.")

    def get_session(self):
        return self.driver.session()


# Singleton instance
db = GraphDB()
