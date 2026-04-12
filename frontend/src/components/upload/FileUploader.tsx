"use client";

import React, { useState, useRef } from 'react';
import { apiUrl } from '@/lib/api';

interface FileUploaderProps {
  onUploadSuccess?: (filename: string) => void;
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMessage(null); // Clear old messages
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setStatusMessage("Uploading to pipeline...");

    // Prepare the file for the multipart/form-data request
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(apiUrl('/ingest'), {
        method: 'POST',
        body: formData,
      });

      let responseData: { filename?: string; detail?: string } | null = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (response.ok) {
        setStatusMessage("Success: Graph is building in the background.");
        const uploadedFilename = responseData?.filename || file.name;
        onUploadSuccess?.(uploadedFilename);
        setFile(null); // Reset the selection
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the input
      } else {
        setStatusMessage(`Error: ${responseData?.detail || 'Upload failed'}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStatusMessage("Error: Network connection failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div 
        className="relative group border border-slate-200/60 hover:border-indigo-300 bg-white/50 hover:bg-white rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[110px] shadow-sm hover:shadow-md ring-1 ring-black/[0.01]"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.mp4" 
          className="hidden"
        />
        {file ? (
          <div className="flex flex-col items-center gap-2 text-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-1 text-indigo-500 border border-indigo-100/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <p className="text-[13px] font-medium truncate max-w-[190px]">{file.name}</p>
            <p className="text-[10px] text-slate-400">Click to change</p>
          </div>
        ) : (
          <div className="text-slate-500 flex flex-col items-center gap-2 transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-slate-50 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center mb-1 text-slate-400 group-hover:text-indigo-500 border border-slate-200/60 group-hover:border-indigo-100/50 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Select file to ingest</p>
            <p className="text-[11px] text-slate-400">PDF or MP4 files allowed</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border overflow-hidden disabled:border-slate-200/60 text-white font-medium py-3 rounded-xl transition-all duration-300 text-[13px] flex items-center justify-center gap-2.5 shadow-sm disabled:shadow-none relative group h-11"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 rounded-full border-[2.5px] border-slate-300 border-t-white animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Upload & Process</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-0.5 opacity-80 group-hover:translate-x-1 group-disabled:translate-x-0 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </>
        )}
      </button>

      {statusMessage && (
        <div className={`text-[12px] font-medium p-3 rounded-xl flex items-start gap-2 border shadow-sm animate-in fade-in slide-in-from-top-1 duration-200 ${
          statusMessage.startsWith('Success') 
            ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60' 
            : statusMessage.startsWith('Error')
            ? 'bg-rose-50/80 text-rose-800 border-rose-200/60'
            : 'bg-indigo-50/80 text-indigo-800 border-indigo-200/60'
        }`}>
          <div className="mt-0.5 shrink-0">
            {statusMessage.startsWith('Success') ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-emerald-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : statusMessage.startsWith('Error') ? (
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-rose-600"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
               <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin"></div>
            )}
          </div>
          <span className="leading-snug">{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
