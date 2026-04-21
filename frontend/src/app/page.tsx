"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GraphViewer from "@/components/graph/GraphViewer";
import VideoPlayer from "@/components/media/VideoPlayer";
import PdfViewer from "@/components/media/PdfViewer";
import ChatInterface from "@/components/chat/ChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("graph");

  const handleDocumentSelect = (filename: string) => {
    setActiveFile(filename);
    const lower = filename.toLowerCase();

    if (lower.endsWith(".mp4")) {
      setActiveTab("video");
      return;
    }

    if (lower.endsWith(".pdf")) {
      setActiveTab("pdf");
    }
  };

  return (
    <DashboardLayout
      chatPanel={<ChatInterface onCitationClick={handleDocumentSelect} />}
      onFileUploaded={handleDocumentSelect}
      onDocumentSelect={handleDocumentSelect}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        
        {/* THE TAB BUTTONS */}
        <div className="w-full flex items-center justify-center mb-3 z-10 relative">
          <TabsList className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm flex items-center gap-1.5 w-fit relative z-10">
            <TabsTrigger value="graph" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:shadow-none font-medium text-[13px] text-slate-500 hover:text-slate-700 transition-all duration-300 flex items-center">
              <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
              Semantic Graph
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!activeFile?.toLowerCase().endsWith('.mp4')} className="rounded-xl px-5 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:shadow-none font-medium text-[13px] text-slate-500 hover:text-slate-700 transition-all duration-300 flex items-center">
              <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              Video Player
            </TabsTrigger>
            <TabsTrigger value="pdf" disabled={!activeFile?.toLowerCase().endsWith('.pdf')} className="rounded-xl px-5 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:shadow-none font-medium text-[13px] text-slate-500 hover:text-slate-700 transition-all duration-300 flex items-center">
               <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               Document Viewer
            </TabsTrigger>
          </TabsList>
          
          {activeFile && (
             <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center text-slate-500 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-[14px] shadow-sm z-0">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2.5 animate-pulse"></span>
               <span className="text-[12px]">Focus: <strong className="font-semibold text-slate-700 ml-0.5">{activeFile}</strong></span>
             </div>
          )}
        </div>

        {/* THE CONTENT PANELS */}
        <div className="flex-1 relative w-full h-full">
          
          <TabsContent value="graph" className="w-full h-full m-0 absolute inset-0">
            <GraphViewer />
          </TabsContent>
          
          <TabsContent value="video" className="w-full h-full m-0 absolute inset-0">
            <VideoPlayer filename={activeFile?.toLowerCase().endsWith('.mp4') ? activeFile : null} />
          </TabsContent>
          
          <TabsContent value="pdf" className="w-full h-full m-0 absolute inset-0">
            <PdfViewer filename={activeFile?.toLowerCase().endsWith('.pdf') ? activeFile : null} />
          </TabsContent>

        </div>
      </Tabs>
    </DashboardLayout>
  );
}
