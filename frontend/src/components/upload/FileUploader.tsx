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
    setStatusMessage("Uploading to NeuroSpace...");

    // Prepare the file for the multipart/form-data request
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatusMessage("✅ File queued! Graph is building in the background.");
        setFile(null); // Reset the selection
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the input
      } else {
        const errorData = await response.json();
        setStatusMessage(`❌ Error: ${errorData.detail || 'Upload failed'}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStatusMessage("❌ Network error. Is the backend running?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div 
        className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 rounded-xl p-4 text-center cursor-pointer transition-all shadow-sm"
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
          <p className="text-sm font-medium text-blue-600 truncate px-2">{file.name}</p>
        ) : (
          <div className="text-slate-500">
            <p className="text-sm font-medium">Click to select file</p>
            <p className="text-xs mt-1 text-slate-400">PDF or MP4</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium py-2 rounded-lg transition-colors text-sm shadow-sm"
      >
        {isUploading ? "Uploading..." : "Upload & Process"}
      </button>

      {statusMessage && (
        <p className={`text-xs text-center mt-2 font-medium ${statusMessage.includes('✅') ? 'text-emerald-600' : 'text-amber-600'}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
