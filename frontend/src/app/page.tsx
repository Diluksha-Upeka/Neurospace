"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GraphViewer from "@/components/graph/GraphViewer";
import VideoPlayer from "@/components/media/VideoPlayer";
import PdfViewer from "@/components/media/PdfViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("graph"); // Control the active tab

  // This function is passed to the GraphViewer
  const handleDocumentSelect = (filename: string) => {
    console.log("Selected from Graph:", filename);
    setActiveFile(filename);
    
    // Auto-switch tabs based on file extension
    if (filename.toLowerCase().endsWith('.mp4')) {
      setActiveTab('video');
    } else if (filename.toLowerCase().endsWith('.pdf')) {
      setActiveTab('pdf');
    }
  };

  return (
    <DashboardLayout>
      {/* We use value and onValueChange to control the tabs programmatically */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        
        <div className="w-full flex justify-center mb-4">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="video" disabled={!activeFile?.endsWith('.mp4')}>Video Player</TabsTrigger>
            <TabsTrigger value="pdf" disabled={!activeFile?.endsWith('.pdf')}>Document Viewer</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative">
          
          <TabsContent value="graph" className="w-full h-full m-0 absolute inset-0">
            <GraphViewer onDocumentSelect={handleDocumentSelect} />
          </TabsContent>
          
          <TabsContent value="video" className="w-full h-full m-0 absolute inset-0">
            <VideoPlayer filename={activeFile?.endsWith('.mp4') ? activeFile : null} />
          </TabsContent>
          
          <TabsContent value="pdf" className="w-full h-full m-0 absolute inset-0">
            <PdfViewer filename={activeFile?.endsWith('.pdf') ? activeFile : null} />
          </TabsContent>

        </div>
      </Tabs>
    </DashboardLayout>
  );
}
