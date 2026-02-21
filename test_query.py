import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import db
from app.services.query_engine import query_service
import json

def test_engine():
    db.connect()
    question = "Design a small pipeline using the concepts in the PDF."
    
    print("\n" + "="*50)
    print(f"🗣️  USER: {question}")
    
    # Now this returns a dictionary
    result = query_service.query(question)
    
    print("\n" + "="*50)
    print(f"🤖 NEUROSPACE (Groq): \n{result['answer']}")
    print("-" * 50)
    print("📚 SOURCES CITED:")
    
    # Pretty print the sources
    print(json.dumps(result['sources'], indent=2))
    print("="*50 + "\n")

    db.close()

if __name__ == "__main__":
    test_engine()