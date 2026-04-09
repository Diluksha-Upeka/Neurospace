import React from 'react';
import { apiUrl } from '@/lib/api';

interface VideoPlayerProps {
  filename: string | null;
}

export default function VideoPlayer({ filename }: VideoPlayerProps) {
  if (!filename) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
        <p>No video selected. Click a video node in the graph or a citation in the chat.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
      <video 
        controls 
        className="w-full h-auto max-h-full"
        src={apiUrl(`/files/${encodeURIComponent(filename)}`)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
