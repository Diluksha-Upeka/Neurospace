# Neo4j Queries for Graph Inspection

## The "Garbage Check" Query
Sometimes LLMs get confused and extract "Page 5" or "Copyright" as entities. Let's inspect the entities to see if we need to clean them later.

```cypher
MATCH (e:Entity)
RETURN e.name, count(*) as connections
ORDER BY connections DESC
LIMIT 20
```

## The "Vector Check" Query
We need to confirm that HuggingFaceEmbedding actually did its job.
We are checking if the Chunk nodes have a property called embedding.

```cypher
MATCH (c:Chunk)
WHERE c.embedding IS NOT NULL
RETURN c.text, size(c.embedding) as vector_size
LIMIT 5
```

## The "Clean Slate" (Optional)
If your graph is messy or you want to re-ingest a file cleanly:
DO NOT run this unless you want to delete everything.

```cypher
MATCH (n) DETACH DELETE n
```
(This is DROP DATABASE for Neo4j. It wipes the slate clean).

## Corrected "Garbage Check" Query
Using the actual entity label from the graph (__Entity__).

```cypher
MATCH (e:__Entity__) RETURN e.name, count { (e)<-[:MENTIONS]-() } as connections ORDER BY connections DESC LIMIT 10
```

## Chunk Vector Check (Alternative)
Check vector sizes for chunks (without filtering for non-null embeddings).

```cypher
MATCH (c:Chunk) RETURN c.text, size(c.embedding) as vector_size LIMIT 5
```

## Chunk Properties Check
Inspect chunk metadata like file_name and page_label.

```cypher
MATCH (c:Chunk) RETURN c.text, c.file_name, c.page_label LIMIT 5
```

## Relationships Overview
Show a sample of relationships in the graph.

```cypher
MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 20
```

## Relationship Types Count
Count all relationship types in the graph.

```cypher
MATCH ()-[r]->() RETURN type(r) as Relationship, count(*) as Count
```

## Node Labels Count
Count nodes by their labels.

```cypher
MATCH (n) RETURN labels(n) as Label, count(*) as Count
```

## __Node__ Nodes Sample
Show sample nodes with the __Node__ label.

```cypher
MATCH (n:`__Node__`) RETURN n LIMIT 25
```

