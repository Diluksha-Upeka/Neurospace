import GraphViewer from "@/components/graph/GraphViewer";

export default function FullscreenGraphPage() {
  return (
    <main className="h-screen w-screen bg-[#fafafa] overflow-hidden">
      <GraphViewer />
    </main>
  );
}
