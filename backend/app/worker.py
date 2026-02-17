import os

from .services.video import video_processor
from .services.transcription import transcriber
from .services.pdf import pdf_processor
from .services.storage import get_storage
from .services.graph_service import graph_service

def process_file_background(file_path: str, filename: str, content_type: str):
    """
    This function runs in the background.
    FastAPI runs sync background tasks in a thread pool,
    giving LlamaIndex its own thread for async I/O.
    """
    print(f" Background Task Started for: {filename}")

    uploaded_to_minio = False
    audio_path: str | None = None
    
    try:
        # 1. Upload raw file to MinIO (Backup)
        # If MinIO isn't running locally, don't block the rest of the pipeline.
        try:
            storage = get_storage()
            storage.upload_file(file_path, filename)
            uploaded_to_minio = True
        except Exception as e:
            print(f" MinIO upload failed (will retry after processing): {str(e)}")
        
        extracted_text_chunks = []

        # 2. Determine Pipeline
        if "video" in content_type:
            print(" Running Video Pipeline...")
            
            # A. Extract Audio
            audio_path = file_path.replace(".mp4", ".mp3")
            video_processor.extract_audio(file_path, audio_path)
            
            # B. Transcribe
            result = transcriber.transcribe(audio_path)
            
            # Extract just the text from the segments
            extracted_text_chunks = [seg.text for seg in result.segments]
            print(f" Video Processed! Found {len(result.segments)} segments.")
            
        elif "pdf" in content_type:
            # --- PDF PIPELINE ---
            print(" Running PDF Pipeline...")
            result = pdf_processor.process_pdf(file_path)
            
            # Extract just the text from the chunks
            extracted_text_chunks = [chunk.text for chunk in result.chunks]
            print(f" PDF Processed! Found {len(result.chunks)} chunks.")
            
        else:
            print(f" Unsupported file type: {content_type}")

        # 3. BUILD GRAPH (Entity Extraction)
        if extracted_text_chunks:
            print(f" Sending {len(extracted_text_chunks)} chunks to Graph Engine...")
            graph_service.process_document(extracted_text_chunks, filename)

    except Exception as e:
        print(f" Background Task Failed: {str(e)}")
    
    finally:
        # If MinIO upload failed at the start, retry once before deleting temp files.
        if not uploaded_to_minio:
            try:
                if os.path.exists(file_path):
                    storage = get_storage()
                    storage.upload_file(file_path, filename)
                    uploaded_to_minio = True
            except Exception as e:
                print(f" MinIO upload skipped: {str(e)}")

        # Cleanup: Remove local temp files to save space
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
        if os.path.exists(file_path):
            os.remove(file_path)
        print(" Cleanup complete.")