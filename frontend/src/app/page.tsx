"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GraphViewer from "@/components/graph/GraphViewer";
import VideoPlayer from "@/components/media/VideoPlayer";
import PdfViewer from "@/components/media/PdfViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  // We will hold the state of the currently active file here.
  // For today, let's hardcode a filename to test if the viewers work.
  // Tomorrow, we make this dynamic based on clicks!
  const [activeFile, setActiveFile] = useState<string | null>("RAG Simplified.mp4");

  return (
    <DashboardLayout>
      <Tabs defaultValue="graph" className="w-full h-full flex flex-col">
        
        {/* THE TAB BUTTONS */}
        <div className="w-full flex justify-center mb-4">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="video">Video Player</TabsTrigger>
            <TabsTrigger value="pdf">Document Viewer</TabsTrigger>
          </TabsList>
        </div>

        {/* THE CONTENT PANELS */}
        <div className="flex-1 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative">
          
          <TabsContent value="graph" className="w-full h-full m-0 absolute inset-0">
            <GraphViewer />
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
