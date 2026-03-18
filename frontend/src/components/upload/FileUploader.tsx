"use client";

import React, { useState, useRef } from 'react';

export default function FileUploader() {
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
      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatusMessage("Success: Graph is building in the background.");
        setFile(null); // Reset the selection
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the input
      } else {
        const errorData = await response.json();
        setStatusMessage(`Error: ${errorData.detail || 'Upload failed'}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStatusMessage("Error: Network connection failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div 
        className="relative border border-dashed border-[#D4D4D4] hover:border-slate-400 bg-white hover:bg-slate-50 rounded-lg p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[100px]"
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
          <div className="flex items-center gap-2 text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <p className="text-[12px] font-medium truncate max-w-[170px]">{file.name}</p>
          </div>
        ) : (
          <div className="text-slate-500 flex flex-col items-center gap-1.5">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <p className="text-[12px] font-medium text-slate-700">Select file to ingest</p>
            <p className="text-[10px] text-slate-400">PDF or MP4 files allowed</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-[#FAFAFA] disabled:text-slate-400 disabled:border disabled:border-[#EAEAEA] border border-transparent text-white font-medium py-2 rounded-md transition-colors text-[12px] flex items-center justify-center gap-2 shadow-sm disabled:shadow-none"
      >
        {isUploading ? (
          <>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          "Upload & Process"
        )}
      </button>

      {statusMessage && (
        <div className={`text-[11px] font-medium p-2.5 rounded-md flex items-start gap-2 border ${
          statusMessage.startsWith('Success') 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : statusMessage.startsWith('Error')
            ? 'bg-red-50 text-red-700 border-red-100'
            : 'bg-blue-50 text-blue-700 border-blue-100'
        }`}>
          <div className="mt-0.5 shrink-0">
            {statusMessage.startsWith('Success') ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : statusMessage.startsWith('Error') ? (
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
               <div className="w-3 h-3 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin"></div>
            )}
          </div>
          <span className="leading-tight pt-[1px]">{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
