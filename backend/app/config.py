import os
from pathlib import Path

from dotenv import load_dotenv

_backend_env = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_backend_env, override=False)
load_dotenv(override=False)


class Settings:
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password123")

    # Optional path to ffmpeg executable (e.g. C:\\ffmpeg\\bin\\ffmpeg.exe)
    FFMPEG_PATH = os.getenv("FFMPEG_PATH")

    # MinIO (S3) Settings
    # endpoint_url points to our local Docker container
    AWS_ACCESS_KEY_ID = os.getenv("MINIO_ROOT_USER", "minioadmin")
    AWS_SECRET_ACCESS_KEY = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", os.getenv("MINIO_BUCKET_NAME", "raw-uploads"))
    S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL", os.getenv("MINIO_ENDPOINT_URL", "http://localhost:9000"))


settings = Settings()
