from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


# Define Pydantic models (Pydantic is used for data validation and serialization) for the transcription results.
class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResult(BaseModel):
    filename: str
    segments: List[TranscriptSegment] # List of transcript segments, each with start time, end time, and text.
    language: str


# Standard format for chunks
class DocumentChunk(BaseModel):
    text: str
    page_number: int
    chunk_index: int    
    metadata: Dict[str, Any] = Field(default_factory=dict) # Additional metadata can be added as needed, such as source filename, etc.


class PDFResult(BaseModel):
    filename: str
    total_pages: int
    chunks: List[DocumentChunk] # List of text chunks extracted from the PDF, along with their page number and chunk index for reference.
