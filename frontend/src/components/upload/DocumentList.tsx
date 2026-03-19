"use client";

import React, { useEffect, useState } from 'react';

export default function DocumentList() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // We fetch the documents when the component loads
  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    // Optional: Refresh the list every 10 seconds to catch new uploads
    const interval = setInterval(fetchDocuments, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-[11px] text-slate-400 animate-pulse mt-6">Loading library...</div>;

  return (
    <div className="mt-6 flex-1 overflow-y-auto">
      <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Active Library ({documents.length})
      </h3>
      
      {documents.length === 0 ? (
        <p className="text-[11px] text-slate-400">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {documents.map((doc, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-[12px] text-slate-700 bg-white p-2.5 rounded-lg border border-[#EAEAEA] hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default group">
              <span className="text-sm shrink-0">
                {doc.endsWith('.mp4') ? '🎬' : '📄'}
              </span>
              <span className="truncate" title={doc}>{doc}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
