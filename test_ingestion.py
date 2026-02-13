# test_ingestion.py
import requests
import os
import time

# Configuration
API_URL = "http://127.0.0.1:8000/ingest"
FILES_TO_TEST = [
    "backend/test_files/RAG Simplified.mp4",
    "backend/test_files/Simple RAG.pdf"

]

def test_upload(file_path):
    if not os.path.exists(file_path):
        print(f" File not found: {file_path}")
        return

    filename = os.path.basename(file_path)

    if filename.lower().endswith(".pdf"):
        mime_type = "application/pdf"
    elif filename.lower().endswith(".mp4"):
        mime_type = "video/mp4"
    else:
        mime_type = "application/octet-stream"

    print(f" Uploading {filename} with MIME type: {mime_type}")

    # Prepare the file for upload
    with open(file_path, "rb") as f:
        files = {"file": (filename, f, mime_type)}
        
        try:
            start_time = time.time()
            response = requests.post(API_URL, files=files)
            end_time = time.time()
            
            if response.status_code == 200:
                print(f" Success! Response time: {end_time - start_time:.2f}s")
                print(f"   Server says: {response.json()}")
            else:
                print(f" Failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f" Error: {str(e)}")

if __name__ == "__main__":
    print("--- STARTING STRESS TEST ---")
    for file_path in FILES_TO_TEST:
        test_upload(file_path)
        print("-" * 30)