import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.vector_search import vector_search
from app.database import db

# Connect to DB manually since we aren't using the API lifespan
db.connect()

def test():
    # QUESTION: Ask something vague that requires understanding context.
    # Example: "Tell me about his coding experience" (The text might say 'Software Development', not 'coding')
    query = "Is RAG same as Vector Search? I want to know the difference between them."
    
    print(f" Query: {query}")
    results = vector_search.search_similar_chunks(query)
    
    print(f"\n Found {len(results)} relevant chunks:\n")
    for i, res in enumerate(results):
        print(f"--- Result {i+1} (Score: {res['score']:.4f}) ---")
        # Print first 200 chars to keep it clean
        print(res['text'][:200] + "...\n")

if __name__ == "__main__":
    test()
    db.close()