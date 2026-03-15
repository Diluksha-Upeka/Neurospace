import React from 'react';
import Image from 'next/image';
import FileUploader from '@/components/upload/FileUploader';

export default function DashboardLayout({ children, chatPanel }: { children: React.ReactNode, chatPanel?: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white text-slate-800 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: Uploads & Controls */}
      <div className="h-full p-4 pr-0 z-10 w-[300px] flex-shrink-0">
        <aside className="h-full w-full bg-white/60 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 flex flex-col relative overflow-hidden">
          {/* subtle glow inside sidebar */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-[3rem]"></div>
          
          <div className="mb-10 relative z-10 px-2 flex justify-center drop-shadow-sm">
            <Image src="/logo ne.png" alt="Neurospace Logo" width={400} height={100} className="w-40 h-auto object-contain" priority />
          </div>
          
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-3 mb-6 opacity-80">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ingestion Phase</p>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            {/* Inject the Uploader Here! */}
            <FileUploader />
          </div>
          
          {/* Branding at the bottom */}
          <div className="mt-auto pt-6 flex flex-col items-center justify-center gap-4 relative z-10">
            <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white backdrop-blur-md">
              <Image src="/logo only.png" alt="Neurospace Icon" width={64} height={64} className="w-10 h-10 object-contain drop-shadow-sm" priority />
            </div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-slate-400 text-center uppercase">NeuroSpace Engine v1.0</p>
          </div>
        </aside>
      </div>

      {/* MAIN CONTENT AREA: Graph & Media Viewer */}
      <main className="flex-1 flex flex-col relative z-0 p-4 pl-6 pr-6 min-w-0">
        <header className="h-16 flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Knowledge Graph Workspace</h1>
        </header>
        <div className="flex-1 relative">
           <div className="absolute inset-0 bg-white/50 backdrop-blur-md border border-white rounded-[2rem] shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col">
             {children}
           </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Chat */}
      <div className="h-full p-4 pl-0 z-10 w-[420px] flex-shrink-0">
        <aside className="h-full w-full bg-white/60 backdrop-blur-2xl border border-white shadow-xl shadow-slate-200/40 rounded-[2rem] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-[3rem] -translate-y-1/2 translate-x-1/4"></div>
          
          <header className="h-20 border-b border-slate-200/50 flex items-center px-8 relative z-10 bg-white/40">
            <div className="relative flex h-3 w-3 mr-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">NeuroSpace Assistant</h2>
          </header>
          
          <div className="flex-1 overflow-hidden relative z-10">
             {chatPanel || (
               <div className="h-full w-full p-4 flex items-center justify-center text-slate-400 font-medium bg-transparent">
                 Chat Interface
               </div>
             )}
          </div>
        </aside>
      </div>

    </div>
  );
}
