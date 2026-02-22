from app.database import db
from app.schemas import GraphNode, GraphEdge, GraphDataResponse

class GraphVisualizerService:
    def get_react_flow_data(self, limit: int = 100) -> GraphDataResponse:
        """
        Fetches a subset of the graph and formats it for React Flow.
        We use a limit so we don't crash the browser with 10,000 nodes.
        """
        print(f"📊 Fetching graph data for visualization (Limit: {limit})...")
        
        # Cypher query: Get paths between nodes
        cypher_query = """
        MATCH (n)-[r]->(m)
        RETURN n, r, m
        LIMIT $limit
        """
        
        nodes_dict = {}
        edges_list = []
        
        with db.get_session() as session:
            result = session.run(cypher_query, limit=limit)
            
            for record in result:
                n = record["n"]
                m = record["m"]
                r = record["r"]
                
                # --- PROCESS NODES ---
                # We use a dictionary to automatically deduplicate nodes
                for node in [n, m]:
                    # Neo4j gives every node a unique internal element_id
                    node_id = str(node.element_id)
                    
                    if node_id not in nodes_dict:
                        # Determine label and group based on what type of node it is
                        labels = list(node.labels)
                        group = labels[0] if labels else "Unknown"
                        
                        # Try to find the best text to display
                        display_label = node.get("name") or node.get("id") or "Node"
                        if group == "Chunk":
                            display_label = node.get("text", "")[:20] + "..."
                            
                        nodes_dict[node_id] = GraphNode(
                            id=node_id,
                            label=str(display_label),
                            group=group
                        )
                
                # --- PROCESS EDGES ---
                edge_id = str(r.element_id)
                edges_list.append(GraphEdge(
                    id=edge_id,
                    source=str(n.element_id),
                    target=str(m.element_id),
                    label=r.type
                ))

        return GraphDataResponse(
            nodes=list(nodes_dict.values()),
            edges=edges_list
        )

# Singleton
graph_visualizer = GraphVisualizerService()
