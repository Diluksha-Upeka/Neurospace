import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 overflow-hidden">
      
      {/* LEFT SIDEBAR: Uploads & Controls */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4 flex flex-col">
        <div className="font-bold text-xl mb-8 tracking-wider">NEURO<span className="text-blue-500">SPACE</span></div>
        <div className="flex-1">
          <p className="text-sm text-slate-400 uppercase tracking-widest mb-4">Ingestion</p>
          {/* Upload Button will go here */}
          <div className="h-24 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
            Upload File
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Graph & Media Viewer */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-14 border-b border-slate-800 flex items-center px-6">
          <h1 className="text-sm font-medium text-slate-300">Knowledge Graph View</h1>
        </header>
        <div className="flex-1 p-4 relative">
           {/* The dynamic content (Graph/Video) injected here */}
           {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Chat */}
      <aside className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center px-4">
          <h2 className="text-sm font-medium">Assistant</h2>
        </header>
        <div className="flex-1 p-4 flex items-center justify-center text-slate-500">
           {/* Chat UI will go here */}
           Chat Interface
        </div>
      </aside>

    </div>
  );
}
