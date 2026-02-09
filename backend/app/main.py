from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from .database import db
from .services.video import video_processor
from .services.transcription import transcriber
from .services.pdf import pdf_processor
from .schemas import PDFResult, TranscriptionResult
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


@app.post("/test-transcribe", response_model=TranscriptionResult)
def test_transcription(audio_path: str):
    """Temporary endpoint to test Faster-Whisper locally.

    Provide an absolute path to an .mp3 file on your PC.
    """

    try:
        return transcriber.transcribe(audio_path)
    except Exception as e:
        # Keep response_model contract intact by surfacing errors as HTTP errors.
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/test-pdf", response_model=PDFResult)
def test_pdf_processing(pdf_path: str):
    """Temporary endpoint to test PDF extraction + chunking locally.

    Provide an absolute path to a PDF file on your PC.
    """

    try:
        return pdf_processor.process_pdf(pdf_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))