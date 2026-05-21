"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import FileUploader from '@/components/upload/FileUploader';
import DocumentList from '@/components/upload/DocumentList';

type DashboardLayoutProps = {
  children: React.ReactNode;
  chatPanel?: React.ReactNode;
  onFileUploaded?: (filename: string) => void;
  onDocumentSelect?: (filename: string) => void;
};

export default function DashboardLayout({ children, chatPanel, onFileUploaded, onDocumentSelect }: DashboardLayoutProps) {
  const [isSleek, setIsSleek] = useState(false);

  useEffect(() => {
    if (isSleek) {
      document.body.classList.add('theme-sleek');
    } else {
      document.body.classList.remove('theme-sleek');
    }
  }, [isSleek]);

  return (
    <div className="flex h-screen w-full bg-slate-50 relative text-slate-900 overflow-hidden font-sans selection:bg-indigo-100">

      {/* Ambient Glow Background - Tweak 5 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="w-[60vw] h-[60vw] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* LEFT SIDEBAR: Uploads & Controls */}
      <aside className="w-[280px] bg-white/70 backdrop-blur-2xl border-r border-slate-900 flex flex-col flex-shrink-0 z-20">
        {/* Header / Main Logo Area */}
        <header className="w-full border-b border-slate-900 flex items-center justify-center shrink-0 bg-transparent overflow-hidden">
          <Image src="/logo ne.png" alt="Neurospace Logo" width={600} height={150} className="w-full h-auto object-contain z-10 mix-blend-multiply hover:opacity-80 transition-opacity" priority />
        </header>

        <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200/0 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/80 transition-all [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="mb-3 px-1 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingestion Pipeline</p>
          </div>
          {/* Inject the Uploader Here! */}
          <div className="mt-4">
            <FileUploader onUploadSuccess={onFileUploaded} />
          </div>

          {/* Document Library */}
          <div className="mt-8">
            <DocumentList onDocumentSelect={onDocumentSelect} />
          </div>
        </div>

        {/* Branding & Status at the bottom */}
        <div className="mt-auto h-16 border-t border-slate-900 flex items-center justify-between px-6 bg-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 bg-white/50 border border-slate-900">
              <Image src="/logo only.png" alt="Icon" width={24} height={24} className="w-3.5 h-3.5 object-contain grayscale opacity-70 mix-blend-multiply" priority />
            </div>
            <span className="text-[12px] font-medium text-slate-500 hidden xl:inline-block tracking-tight">NeuroSpace Engine</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSleek(!isSleek)}
              className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-all duration-200 ease-out active:scale-[0.95] mr-2 inline-flex items-center gap-1"
              title="Toggle Sleek Theme"
            >
              2026 Trend
            </button>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600/90 uppercase tracking-widest">Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Graph & Media Viewer */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <header className="h-[72px] border-b border-slate-900 flex items-center px-6 bg-white/70 backdrop-blur-2xl shrink-0 z-20">
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-tight">Knowledge Graph</h1>
                <span className="px-2 py-[2px] border border-slate-900 text-[10px] font-bold text-slate-700 uppercase tracking-widest">Workspace</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 relative overflow-hidden flex flex-col p-3">
          {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Chat */}
      <aside className="w-[380px] bg-white/70 backdrop-blur-2xl border-l border-slate-900 flex flex-col flex-shrink-0 z-20">
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-6 bg-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 border border-slate-900 text-slate-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">NeuroSpace Assistant</h2>
          </div>
          <button className="p-1.5 hover:bg-slate-100 transition-all duration-200 ease-out active:scale-[0.90] text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-900">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative z-10 bg-transparent">
          {chatPanel || (
            <div className="h-full w-full p-4 flex items-center justify-center text-[13px] text-slate-400 font-medium">
              Select or initialize a chat session
            </div>
          )}
        </div>
      </aside>

    </div>
  );
}

