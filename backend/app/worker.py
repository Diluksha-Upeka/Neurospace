import os

from .services.video import video_processor
from .services.transcription import transcriber
from .services.pdf import pdf_processor
from .services.storage import get_storage

def process_file_background(file_path: str, filename: str, content_type: str):
    """
    This function runs in the background.
    """
    print(f"⚙️ Background Task Started for: {filename}")

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
        
        # 2. Determine Pipeline
        if "video" in content_type:
            print(" Running Video Pipeline...")
            
            # A. Extract Audio
            audio_path = file_path.replace(".mp4", ".mp3")
            video_processor.extract_audio(file_path, audio_path)
            
            # B. Transcribe
            result = transcriber.transcribe(audio_path)
            
            # TODO: Day 11 -> Save 'result' to Neo4j
            print(f" Video Processed! Found {len(result.segments)} segments.")
            
        elif "pdf" in content_type:
            # --- PDF PIPELINE ---
            print(" Running PDF Pipeline...")
            result = pdf_processor.process_pdf(file_path)
            
            # TODO: Day 11 -> Save 'result' to Neo4j
            print(f" PDF Processed! Found {len(result.chunks)} chunks.")
            
        else:
            print(f" Unsupported file type: {content_type}")

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