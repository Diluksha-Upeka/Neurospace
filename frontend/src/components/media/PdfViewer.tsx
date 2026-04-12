import React from 'react';
import { apiUrl } from '@/lib/api';

interface PdfViewerProps {
  filename: string | null;
}

export default function PdfViewer({ filename }: PdfViewerProps) {
  if (!filename) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <p className="text-[14px] text-slate-500 font-medium tracking-tight">No document selected</p>
        <p className="text-[12px] text-slate-400 mt-2">Click a PDF node or a chat citation to view</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-50/50">
      <iframe 
        src={apiUrl(`/files/${encodeURIComponent(filename)}`)}
        className="w-full h-full border-none"
        title="PDF Viewer"
      />
    </div>
  );
}
