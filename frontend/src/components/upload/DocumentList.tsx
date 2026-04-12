"use client";

import React, { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface DocumentListProps {
  onDocumentSelect?: (filename: string) => void;
}

export default function DocumentList({ onDocumentSelect }: DocumentListProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(apiUrl('/documents'));
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const response = await fetch(apiUrl('/clear'), { method: 'DELETE' });
      if (response.ok) {
        setDocuments([]);
        setShowConfirm(false);
        // Force a full reload so the Graph Viewer also re-fetches from empty Neo4j
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to clear system:", error);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-[12px] text-slate-400/80 animate-pulse mt-8 flex items-center justify-center gap-2">
    <div className="w-3 h-3 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin"></div>
    Loading library...
  </div>;

  return (
    <div className="mt-8 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Knowledge Base ({documents.length})
        </h3>
        {!showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-[10px] font-bold text-rose-400/80 hover:text-rose-500 transition-colors uppercase tracking-widest bg-rose-50/50 hover:bg-rose-50 px-2 py-1 rounded-md"
            title="Clear all data (files + graph)"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="mb-4 p-4 rounded-2xl border border-rose-200/60 bg-rose-50/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[12px] text-rose-700 font-semibold mb-3 tracking-tight">
            Permanently delete all files & knowledge graph?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex-1 text-[12px] font-semibold px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-50 shadow-sm"
            >
              {clearing ? 'Clearing...' : 'Yes, Delete All'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 text-[12px] font-semibold px-3 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200/60 rounded-2xl bg-slate-50/50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-slate-300 mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p className="text-[12px] text-slate-400 font-medium">Empty repository</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc} className="group animate-in fade-in slide-in-from-left-2 duration-300">
              <button
                type="button"
                onClick={() => onDocumentSelect?.(doc)}
                className="w-full text-left flex items-center gap-3 text-[13px] font-medium text-slate-700 bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 hover:border-indigo-200 hover:bg-white hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:text-indigo-900 transition-all cursor-pointer ring-1 ring-black/[0.01]"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-500 transition-colors shrink-0">
                  {doc.endsWith('.mp4') ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  )}
                </span>
                <span className="truncate tracking-tight" title={doc}>{doc}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
