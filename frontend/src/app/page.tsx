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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col pt-2">
        
        {/* THE TAB BUTTONS */}
        <div className="w-full flex justify-center mb-6">
          <TabsList className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-1.5 rounded-2xl shadow-sm">
            <TabsTrigger value="graph" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all duration-300">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="video" disabled={!activeFile?.toLowerCase().endsWith('.mp4')} className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all duration-300">Video Player</TabsTrigger>
            <TabsTrigger value="pdf" disabled={!activeFile?.toLowerCase().endsWith('.pdf')} className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all duration-300">Document Viewer</TabsTrigger>
          </TabsList>
        </div>

        {/* THE CONTENT PANELS */}
        <div className="flex-1 relative w-full h-full mb-4">
          
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
