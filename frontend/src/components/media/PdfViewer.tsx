import React from 'react';
import { apiUrl } from '@/lib/api';

interface PdfViewerProps {
  filename: string | null;
}

export default function PdfViewer({ filename }: PdfViewerProps) {
  if (!filename) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
        <p>No document selected. Click a PDF node in the graph or a citation in the chat.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-inner">
      <iframe 
        src={apiUrl(`/files/${encodeURIComponent(filename)}`)}
        className="w-full h-full border-none"
        title="PDF Viewer"
      />
    </div>
  );
}
