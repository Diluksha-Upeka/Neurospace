import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import db
from app.services.query_engine import query_service

def test_engine():
    # Connect to Neo4j
    db.connect()
    
    # 1. Ask a question that requires the context of your uploaded documents
    question = "Design a small pipeline using the concepts in the PDF: documents → embeddings → vector DB → retrieval → generation. Explain each step."
    
    print("\n" + "="*50)
    print(f"  USER: {question}")
    print("="*50 + "\n")
    
    # 2. Get the synthesized answer from Groq
    answer = query_service.ask(question)
    
    print("\n" + "="*50)
    print(f" NEUROSPACE (Groq): \n{answer}")
    print("="*50 + "\n")

    # Close connection
    db.close()

if __name__ == "__main__":
    test_engine()