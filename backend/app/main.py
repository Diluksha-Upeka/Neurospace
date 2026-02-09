from contextlib import asynccontextmanager
from fastapi import FastAPI
from .database import db
from .services.video import video_processor
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()


app = FastAPI(title="NeuroSpace API", lifespan=lifespan)


@app.get("/")
def health_check():
    return {"status": "active", "system": "NeuroSpace Graph Engine"}

@app.post("/test-extract")
def test_video_extraction(video_path: str):
    """
    Temporary endpoint to test FFmpeg manually.
    Provide an absolute path to a video file on your PC.
    """
    # Create a temp output filename
    base_name = os.path.splitext(os.path.basename(video_path))[0]
    output_audio = f"{base_name}.mp3"
    
    try:
        audio_file = video_processor.extract_audio(video_path, output_audio) # Call the video processing service
        return {"status": "success", "audio_file": audio_file}
    except Exception as e:
        return {"status": "error", "message": str(e)}