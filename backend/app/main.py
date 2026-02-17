from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from .database import db
from .services.video import video_processor
from .services.transcription import transcriber
from .services.pdf import pdf_processor
from .services.graph_setup import setup_constraints
from .services.llm_factory import llm_factory
from .schemas import PDFResult, TranscriptionResult
import os
import shutil
from .worker import process_file_background

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    setup_constraints()

    # Test: Initialize LlamaIndex Storage
    if llm_factory is not None:
        try:
            storage = llm_factory.get_storage_context()
            print("✅ LlamaIndex successfully connected to Neo4j!")
        except Exception as e:
            print(f"❌ LlamaIndex Connection Failed: {e}")
    else:
        print("⚠️ LLM Factory not initialized — check your API keys")

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
    

@app.post("/ingest")
async def ingest_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    The Main Entrance.
    1. Receives file.
    2. Saves to temp disk.
    3. Triggers background processing.
    4. Returns 'Accepted' immediately.
    """
    # Validate file type
    if file.content_type not in ["application/pdf", "video/mp4"]:
        raise HTTPException(400, detail="Only .pdf and .mp4 supported for now.")

    # Save to a temporary folder
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Trigger Background Task
    # We pass the file path, not the file object (because the request closes)
    background_tasks.add_task(
        process_file_background, 
        temp_filename, 
        file.filename, 
        file.content_type
    )

    return {
        "status": "accepted", 
        "filename": file.filename, 
        "message": "Processing started in background."
    }