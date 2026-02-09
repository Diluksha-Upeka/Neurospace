import subprocess
import os
import shutil

from ..config import settings

class VideoProcessor:
    def extract_audio(self, video_path: str, output_path: str) -> str:
        """
        Uses FFmpeg to strip audio from a video file.
        Returns the path to the audio file.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        ffmpeg_exe = settings.FFMPEG_PATH or shutil.which("ffmpeg")
        if not ffmpeg_exe:
            raise FileNotFoundError(
                "ffmpeg executable not found. Install ffmpeg and add it to PATH, "
                "or set FFMPEG_PATH to the full path of ffmpeg.exe."
            )

        print(f" Extracting audio from {video_path}...")

        # FFmpeg command breakdown:
        # -i : Input file
        # -q:a 0 : Highest audio quality (Variable Bit Rate)
        # -map a : Select only the audio stream (ignore video)
        # -y : Overwrite output file if it exists
        command = [
            ffmpeg_exe,
            "-i", video_path, 
            "-q:a", "0", 
            "-map", "a", 
            "-y", 
            output_path
        ]

        try:
            # Run the command and capture output
            result = subprocess.run(
                command, 
                check=True, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE
            )
            print(f" Audio saved to {output_path}")
            return output_path
            
        except subprocess.CalledProcessError as e:
            print(f" FFmpeg failed: {e.stderr.decode()}")
            raise e

# Singleton instance
video_processor = VideoProcessor()