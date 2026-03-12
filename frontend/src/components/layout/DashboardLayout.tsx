import React from 'react';
import FileUploader from '@/components/upload/FileUploader';

export default function DashboardLayout({ children, chatPanel }: { children: React.ReactNode, chatPanel?: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: Uploads & Controls */}
      <aside className="w-64 border-r border-slate-200 bg-white/80 backdrop-blur-xl p-4 flex flex-col shadow-sm z-10">
        <div className="font-bold text-xl mb-8 tracking-wider text-slate-900">NEURO<span className="text-blue-600">SPACE</span></div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Ingestion</p>
          {/* Inject the Uploader Here! */}
          <FileUploader />
        </div>
        
        {/* Branding at the bottom */}
        <div className="mt-auto pt-4 border-t border-slate-200">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 text-center uppercase">NeuroSpace Engine v1.0</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Graph & Media Viewer */}
      <main className="flex-1 flex flex-col relative bg-slate-50/50">
        <header className="h-14 border-b border-slate-200 flex items-center px-6 bg-white/80 backdrop-blur-md z-10 shadow-sm">
          <h1 className="text-sm font-semibold text-slate-700">Knowledge Graph View</h1>
        </header>
        <div className="flex-1 p-4 relative">
           {/* The dynamic content (Graph/Video) injected here */}
           {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Chat */}
      <aside className="w-[400px] border-l border-slate-200 bg-white/80 backdrop-blur-xl flex flex-col shadow-sm z-10">
        <header className="h-14 border-b border-slate-200 flex items-center px-4 bg-white/50">
          <h2 className="text-sm font-semibold text-slate-700">NeuroSpace Assistant</h2>
        </header>
        <div className="flex-1 overflow-hidden">
           {chatPanel || (
             <div className="h-full w-full p-4 flex items-center justify-center text-slate-400 font-medium bg-slate-50/50">
               Chat Interface
             </div>
           )}
        </div>
      </aside>

    </div>
  );
}
