from app.database import db
from app.schemas import GraphNode, GraphEdge, GraphDataResponse

class GraphVisualizerService:
    def get_react_flow_data(self, limit: int = 100) -> GraphDataResponse:
        """
        Fetches a subset of the graph and formats it for React Flow.
        We use a limit so we don't crash the browser with 10,000 nodes.
        """
        print(f"📊 Fetching graph data for visualization (Limit: {limit})...")
        
        nodes_dict = {}
        edges_list = {}  # use dict to deduplicate edges too

        with db.get_session() as session:

            # --- PASS 1: Document -> Chunk paths ---
            doc_query = """
            MATCH (d:Document)-[r:HAS_CHUNK]->(c:Chunk)
            RETURN d, r, c
            LIMIT $limit
            """
            result = session.run(doc_query, limit=limit)
            for record in result:
                d = record["d"]
                c = record["c"]
                r = record["r"]

                d_id = str(d.element_id)
                c_id = str(c.element_id)

                if d_id not in nodes_dict:
                    nodes_dict[d_id] = GraphNode(
                        id=d_id,
                        label=str(d.get("name") or d.get("id") or "Document"),
                        group="Document"
                    )
                if c_id not in nodes_dict:
                    chunk_text = c.get("text", "")
                    nodes_dict[c_id] = GraphNode(
                        id=c_id,
                        label=chunk_text[:20] + "..." if chunk_text else "Chunk",
                        group="Chunk"
                    )

                edge_id = str(r.element_id)
                if edge_id not in edges_list:
                    edges_list[edge_id] = GraphEdge(
                        id=edge_id,
                        source=d_id,
                        target=c_id,
                        label=r.type
                    )

            # --- PASS 2: Chunk -> Entity paths ---
            entity_query = """
            MATCH (c:Chunk)-[r]->(e)
            WHERE NOT e:Document AND NOT e:Chunk
            RETURN c, r, e
            LIMIT $limit
            """
            result2 = session.run(entity_query, limit=limit)
            for record in result2:
                c = record["c"]
                e = record["e"]
                r = record["r"]

                c_id = str(c.element_id)
                e_id = str(e.element_id)

                if c_id not in nodes_dict:
                    chunk_text = c.get("text", "")
                    nodes_dict[c_id] = GraphNode(
                        id=c_id,
                        label=chunk_text[:20] + "..." if chunk_text else "Chunk",
                        group="Chunk"
                    )
                if e_id not in nodes_dict:
                    labels = list(e.labels)
                    group = next((l for l in labels if l not in ("__Node__", "__Entity__")), "Entity")
                    display_label = e.get("name") or e.get("id") or "Entity"
                    nodes_dict[e_id] = GraphNode(
                        id=e_id,
                        label=str(display_label),
                        group=group
                    )

                edge_id = str(r.element_id)
                if edge_id not in edges_list:
                    edges_list[edge_id] = GraphEdge(
                        id=edge_id,
                        source=c_id,
                        target=e_id,
                        label=r.type
                    )

            # --- PASS 3: Entity -> Entity paths ---
            ee_query = """
            MATCH (e1)-[r]->(e2)
            WHERE NOT e1:Chunk AND NOT e1:Document AND NOT e2:Chunk AND NOT e2:Document
            RETURN e1, r, e2
            LIMIT $limit
            """
            result3 = session.run(ee_query, limit=limit)
            for record in result3:
                e1 = record["e1"]
                e2 = record["e2"]
                r = record["r"]

                e1_id = str(e1.element_id)
                e2_id = str(e2.element_id)

                for node, nid in [(e1, e1_id), (e2, e2_id)]:
                    if nid not in nodes_dict:
                        labels = list(node.labels)
                        group = next((l for l in labels if l not in ("__Node__", "__Entity__")), "Entity")
                        display_label = node.get("name") or node.get("id") or "Entity"
                        nodes_dict[nid] = GraphNode(
                            id=nid,
                            label=str(display_label),
                            group=group
                        )

                edge_id = str(r.element_id)
                if edge_id not in edges_list:
                    edges_list[edge_id] = GraphEdge(
                        id=edge_id,
                        source=e1_id,
                        target=e2_id,
                        label=r.type
                    )

        return GraphDataResponse(
            nodes=list(nodes_dict.values()),
            edges=list(edges_list.values())
        )

# Singleton
graph_visualizer = GraphVisualizerService()
