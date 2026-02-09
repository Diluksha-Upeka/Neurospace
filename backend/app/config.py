import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password123")

    # Optional path to ffmpeg executable (e.g. C:\\ffmpeg\\bin\\ffmpeg.exe)
    FFMPEG_PATH = os.getenv("FFMPEG_PATH")


settings = Settings()
