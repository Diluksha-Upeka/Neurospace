import React from 'react';

interface PdfViewerProps {
  filename: string | null;
}

export default function PdfViewer({ filename }: PdfViewerProps) {
  if (!filename) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500">
        <p>No document selected. Click a PDF node in the graph or a citation in the chat.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-white">
      <iframe 
        src={`http://localhost:8000/files/${filename}`} 
        className="w-full h-full border-none"
        title="PDF Viewer"
      />
    </div>
  );
}
