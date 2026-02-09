from __future__ import annotations

import os

from faster_whisper import WhisperModel

from ..schemas import TranscriptSegment, TranscriptionResult


# This service class encapsulates the logic for transcribing audio files using the Faster-Whisper model.
class Transcriber:
    def __init__(
        self,
        model_size: str = "base",   # Options: tiny, base, small, medium, large
        device: str = "cpu",        # Options: cpu, cuda
        compute_type: str = "int8", # Options: int8, float16 (if using CUDA)
    ):
        self.model_size = model_size 
        self.device = device
        self.compute_type = compute_type

        print(f"Loading Whisper Model ({self.model_size})... this might take a minute...")
        # Loads the AI model to memory. 
        self.model = WhisperModel(
            self.model_size, 
            device=self.device,     # Runs on CPU
            compute_type=self.compute_type)
        print("Whisper Model Loaded!")

    # Transcribe the given audio file and return structured results.
    def transcribe(self, audio_path: str) -> TranscriptionResult:   # Takes the path to an audio file and returns a structured transcription result.
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        print(f"Transcribing {audio_path}...")  
        segments, info = self.model.transcribe(audio_path, beam_size=5) # Transcribe the audio file and get segments and language info.

        result_segments = []
        for segment in segments:
            print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
            result_segments.append(
                TranscriptSegment(
                    start=float(segment.start),
                    end=float(segment.end),
                    text=(segment.text or "").strip(),
                )
            )

        return TranscriptionResult(
            filename=os.path.basename(audio_path),
            segments=result_segments,
            language=info.language,
        )


transcriber = Transcriber()     # Singleton instance of the Transcriber class that can be imported and used throughout the application.

# Audio file --> Whisper AI --> [segment1, segment2, ...] --> JSON transcript

