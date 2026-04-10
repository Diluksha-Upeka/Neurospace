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

  if (loading) return <div className="text-[11px] text-slate-400 animate-pulse mt-6">Loading library...</div>;

  return (
    <div className="mt-6 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Active Library ({documents.length})
        </h3>
        {!showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider"
            title="Clear all data (files + graph)"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="mb-3 p-3 rounded-lg border border-red-200 bg-red-50">
          <p className="text-[11px] text-red-700 font-medium mb-2">
            Delete all files & graph data?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex-1 text-[11px] font-semibold px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {clearing ? 'Clearing...' : 'Yes, Clear'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-[11px] text-slate-400">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {documents.map((doc) => (
            <li key={doc}>
              <button
                type="button"
                onClick={() => onDocumentSelect?.(doc)}
                className="w-full text-left flex items-center gap-2.5 text-[12px] text-slate-700 bg-white p-2.5 rounded-lg border border-[#EAEAEA] hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <span className="text-sm shrink-0">
                  {doc.endsWith('.mp4') ? '🎬' : '📄'}
                </span>
                <span className="truncate" title={doc}>{doc}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
