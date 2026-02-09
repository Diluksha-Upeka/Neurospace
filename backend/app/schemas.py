from __future__ import annotations

from typing import List

from pydantic import BaseModel


# Define Pydantic models (Pydantic is used for data validation and serialization) for the transcription results.
class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResult(BaseModel):
    filename: str
    segments: List[TranscriptSegment] # List of transcript segments, each with start time, end time, and text.
    language: str
