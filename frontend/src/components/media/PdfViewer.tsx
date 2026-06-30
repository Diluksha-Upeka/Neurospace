import React from 'react';
import { apiUrl } from '@/lib/api';

interface PdfViewerProps {
  filename: string | null;
  page?: number;
}

export default function PdfViewer({ filename, page }: PdfViewerProps) {
  if (!filename) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
        <div className="w-16 h-16 bg-card border border-border flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-muted-foreground/50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <p className="text-[14px] text-muted-foreground font-medium tracking-tight">No document selected</p>
        <p className="text-[12px] text-muted-foreground/80 mt-2">Click a PDF node or a chat citation to view</p>
      </div>
    );
  }

  const url = apiUrl(`/files/${encodeURIComponent(filename)}`) + (page ? `#page=${page}` : '');

  return (
    <div className="w-full h-full overflow-hidden bg-muted/50">
      <iframe 
        src={url}
        className="w-full h-full border-none"
        title="PDF Viewer"
      />
    </div>
  );
}
