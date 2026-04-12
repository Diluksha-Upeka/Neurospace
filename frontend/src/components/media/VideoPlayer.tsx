import React from 'react';
import { apiUrl } from '@/lib/api';

interface VideoPlayerProps {
  filename: string | null;
}

export default function VideoPlayer({ filename }: VideoPlayerProps) {
  if (!filename) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-300 ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
        <p className="text-[14px] text-slate-500 font-medium tracking-tight">No video selected</p>
        <p className="text-[12px] text-slate-400 mt-2">Click an MP4 node or a chat citation to play</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <video 
        controls 
        className="w-full h-auto max-h-full aspect-video z-10"
        src={apiUrl(`/files/${encodeURIComponent(filename)}`)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
