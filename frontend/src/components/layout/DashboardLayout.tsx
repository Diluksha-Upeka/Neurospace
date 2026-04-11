import React from 'react';
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
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-indigo-100">
      
      {/* LEFT SIDEBAR: Uploads & Controls */}
      <aside className="w-[280px] bg-white/60 backdrop-blur-xl border-r border-slate-200/60 flex flex-col flex-shrink-0 z-10 transition-all shadow-[1px_0_40px_-20px_rgba(0,0,0,0.05)]">
        {/* Header / Main Logo Area */}
        <div className="h-16 border-b border-slate-200/60 flex items-center px-6 shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></div>
          <Image src="/logo ne.png" alt="Neurospace Logo" width={400} height={100} className="h-6 w-auto object-contain relative z-10" priority />
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="mb-3 px-1 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ingestion Pipeline</p>
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
        <div className="mt-auto h-16 border-t border-slate-200/60 flex items-center justify-between px-6 bg-white/40 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 shadow-sm border border-slate-200/50">
              <Image src="/logo only.png" alt="Icon" width={24} height={24} className="w-3.5 h-3.5 object-contain grayscale opacity-70 mix-blend-multiply" priority />
            </div>
            <span className="text-[12px] font-medium text-slate-500 hidden xl:inline-block tracking-tight">NeuroSpace Engine</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600/90 uppercase tracking-widest">Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Graph & Media Viewer */}
      <main className="flex-1 flex flex-col bg-[#F9FAFB] relative z-0 min-w-0">
        <header className="h-16 border-b border-slate-200/60 flex items-center px-8 bg-white/70 backdrop-blur-md shrink-0 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2 border border-slate-200/60 bg-gradient-to-b from-white to-slate-50 rounded-xl shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-600"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </div>
            <h1 className="text-[14px] font-semibold text-slate-700 tracking-tight">Knowledge Graph Workspace</h1>
          </div>
        </header>
        <div className="flex-1 relative overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8">
           {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Chat */}
      <aside className="w-[380px] bg-white/60 backdrop-blur-xl border-l border-slate-200/60 flex flex-col flex-shrink-0 z-10 shadow-[-1px_0_40px_-20px_rgba(0,0,0,0.05)]">
        <header className="h-16 border-b border-slate-200/60 flex items-center justify-between px-6 bg-white/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h2 className="text-[14px] font-semibold text-slate-700 tracking-tight">NeuroSpace Assistant</h2>
          </div>
          <button className="p-1.5 hover:bg-slate-100/80 rounded-lg transition-all text-slate-400 hover:text-slate-600">
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
