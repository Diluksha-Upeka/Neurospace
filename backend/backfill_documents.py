"""
Backfill script: Creates Document nodes in Neo4j for all media files in MinIO
and links them to their Chunk nodes.

Run from: F:\PROJECTS\neurospace\backend
Command:  python backfill_documents.py
"""

import os
os.environ.setdefault("AWS_SDK_LOAD_CONFIG", "0")
os.environ.setdefault("AWS_CONFIG_FILE", os.devnull)
os.environ.setdefault("AWS_SHARED_CREDENTIALS_FILE", os.devnull)
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

import boto3
from botocore.client import Config
from dotenv import load_dotenv
load_dotenv(".env")

from app.database import db
db.connect()

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ.get("S3_ENDPOINT_URL", "http://localhost:9000"),
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID", "minioadmin"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY", "minioadmin"),
    config=Config(signature_version="s3v4"),
)

resp = s3.list_objects_v2(Bucket="raw-uploads")
files = [
    obj["Key"]
    for obj in resp.get("Contents", [])
    if obj["Key"].endswith((".pdf", ".mp4"))
]
print("Media files found in MinIO:", files)

with db.get_session() as session:
    # Step 1: Create/update Document node for every file
    for fname in files:
        session.run(
            "MERGE (d:Document {id: $fname}) ON CREATE SET d.name = $fname ON MATCH SET d.name = $fname",
            fname=fname,
        )
        print(f"  ✅ Merged Document node: {fname}")

    # Step 2: Link chunks that carry a filename property
    for fname in files:
        result = session.run(
            "MATCH (c:Chunk) WHERE c.filename = $fname "
            "MATCH (d:Document {id: $fname}) "
            "MERGE (d)-[:HAS_CHUNK]->(c) "
            "RETURN count(c) as linked",
            fname=fname,
        )
        for rec in result:
            print(f"  Linked {rec['linked']} chunks to {fname}")

    # Step 3: Find orphaned chunks (no Document link) and show info
    r = session.run(
        """
        MATCH (c:Chunk)
        WHERE NOT EXISTS { MATCH (:Document)-[:HAS_CHUNK]->(c) }
        RETURN c.ref_doc_id as ref_id LIMIT 5
        """
    )
    orphans = [rec["ref_id"] for rec in r]
    if orphans:
        print(f"\n⚠️  {len(orphans)} orphaned chunks found (no Document link).")
        print("They may belong to a file where filename metadata was not stored during ingestion.")
    else:
        print("\n✅ All chunks are linked to a Document node!")

print("Done!")
