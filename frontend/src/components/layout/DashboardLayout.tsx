import React from 'react';
import Image from 'next/image';
import FileUploader from '@/components/upload/FileUploader';
import DocumentList from '@/components/upload/DocumentList';

export default function DashboardLayout({ children, chatPanel }: { children: React.ReactNode, chatPanel?: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] text-slate-900 overflow-hidden font-sans selection:bg-blue-100">
      
      {/* LEFT SIDEBAR: Uploads & Controls */}
      <aside className="w-[280px] bg-[#FAFAFA] border-r border-[#EAEAEA] flex flex-col flex-shrink-0 z-10 transition-all">
        {/* Header / Main Logo Area */}
        <div className="h-14 border-b border-[#EAEAEA] flex items-center px-5 shrink-0">
          <Image src="/logo ne.png" alt="Neurospace Logo" width={400} height={100} className="h-6 w-auto object-contain" priority />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-2 px-1 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Ingestion Pipeline</p>
          </div>
          {/* Inject the Uploader Here! */}
          <div className="mt-3">
            <FileUploader />
          </div>

          {/* Document Library */}
          <DocumentList />
        </div>
        
        {/* Branding & Status at the bottom */}
        <div className="mt-auto h-14 border-t border-[#EAEAEA] flex items-center justify-between px-5 bg-[#FAFAFA] shrink-0">
          <div className="flex items-center gap-2.5">
            <Image src="/logo only.png" alt="Icon" width={24} height={24} className="w-4 h-4 object-contain grayscale opacity-60" priority />
            <span className="text-[11px] font-medium text-slate-500 hidden xl:inline-block">NeuroSpace Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
            <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Graph & Media Viewer */}
      <main className="flex-1 flex flex-col bg-white relative z-0 min-w-0 shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)]">
        <header className="h-14 border-b border-[#EAEAEA] flex items-center px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-100 rounded-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-600"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </div>
            <h1 className="text-[13px] font-medium text-slate-800 tracking-tight">Knowledge Graph Workspace</h1>
          </div>
        </header>
        <div className="flex-1 relative overflow-hidden flex flex-col">
           {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Chat */}
      <aside className="w-[360px] bg-[#FAFAFA] border-l border-[#EAEAEA] flex flex-col flex-shrink-0 z-10">
        <header className="h-14 border-b border-[#EAEAEA] flex items-center justify-between px-5 bg-[#FAFAFA] shrink-0">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <h2 className="text-[13px] font-semibold text-slate-800 tracking-tight">NeuroSpace Assistant</h2>
          </div>
          <button className="p-1.5 hover:bg-[#EAEAEA] rounded-md transition-colors text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </header>
        
        <div className="flex-1 overflow-hidden relative z-10 bg-white">
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
