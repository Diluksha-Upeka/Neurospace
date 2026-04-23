"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import { BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { apiUrl } from "@/lib/api";

type ApiGraphNode = {
  id: string;
  label: string;
  group: string;
};

type ApiGraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

type ApiGraphPayload = {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
};

const groupStyles: Record<string, { bg: string; border: string; color: string; shadow: string }> = {
  Document: { 
    bg: "#111827", 
    border: "rgba(99, 102, 241, 0.8)", 
    color: "#e2e8f0", 
    shadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
  },
  Chunk: { 
    bg: "#111827", 
    border: "rgba(16, 185, 129, 0.8)", 
    color: "#e2e8f0", 
    shadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
  },
};

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function GraphViewer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithTimeout(apiUrl("/graph?limit=150"), 15000);

      if (!response.ok) {
        throw new Error(`Graph API returned ${response.status}`);
      }

      const payload = (await response.json()) as ApiGraphPayload;

      const flowNodes: Node[] = payload.nodes.map((node, index) => {
        const x = (index % 8) * 220;
        const y = Math.floor(index / 8) * 150;
        const style = groupStyles[node.group] ?? {
          bg: "#1e293b",
          border: "rgba(148, 163, 184, 0.6)",
          color: "#e2e8f0",
          shadow: "0 4px 10px rgba(0, 0, 0, 0.3)"
        };

        return {
          id: node.id,
          position: { x, y },
          data: { label: node.label, group: node.group },
          style: {
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            borderRadius: "24px",
            padding: "14px 20px",
            fontSize: "12px",
            fontWeight: 600,
            width: 180,
            textAlign: "center",
            boxShadow: style.shadow,
            transition: "all 0.1s",
          },
        };
      });

      const flowEdges: Edge[] = payload.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: true,
        style: { stroke: "#818cf8", strokeWidth: 2, opacity: 0.8 },
        labelStyle: { fill: "#c7d2fe", fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: '#0a0f1c', rx: 6, ry: 6 },
        labelBgPadding: [8, 4] as [number, number],
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      setError(
        timedOut
          ? "Graph request timed out. The backend may still be starting."
          : "Could not load graph data from backend."
      );
      setNodes([]);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  if (loading) {
    return (
      <div className="w-full h-full rounded-3xl flex flex-col items-center justify-center bg-[#0a0f1c] border border-slate-800">
        <div className="flex gap-3 items-center justify-center bg-slate-900 border border-slate-700 px-6 py-3 rounded-full shadow-lg text-slate-300 font-medium text-[13px] tracking-tight">
          <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          Initializing Workspace...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-3xl flex items-center justify-center p-8 bg-[#0a0f1c] border border-slate-800">
        <div className="max-w-sm w-full rounded-2xl border border-rose-900 bg-rose-950/20 p-6 text-center">
          <div className="w-12 h-12 bg-rose-900/40 rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-rose-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-[14px] font-semibold text-rose-200 tracking-tight">Graph Sync Interrupted</p>
          <p className="text-[12px] text-rose-400 mt-2 font-medium">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-6 px-5 py-2.5 text-[13px] font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-[#0a0f1c] border border-slate-800">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-indigo-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </div>
        <p className="text-[15px] font-semibold tracking-tight text-slate-300 mb-1">Knowledge Graph is Empty</p>
        <p className="text-[13px] font-medium text-slate-500">Upload a PDF or MP4 document to generate nodes.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0f1c] rounded-3xl overflow-hidden border border-slate-800 relative z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,rgba(10,15,28,1)_70%)] pointer-events-none"></div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="[&_.react-flow\_\_controls]:bg-slate-900/80 [&_.react-flow\_\_controls]:backdrop-blur-md [&_.react-flow\_\_controls]:border-slate-700 [&_.react-flow\_\_controls]:shadow-xl [&_.react-flow\_\_controls_button]:border-b-slate-700/50 [&_.react-flow\_\_controls_button]:fill-slate-300 [&_.react-flow\_\_controls_button:hover]:bg-indigo-500/20 [&_.react-flow\_\_minimap]:bg-slate-900/80 [&_.react-flow\_\_minimap]:backdrop-blur-md [&_.react-flow\_\_minimap]:border-slate-700 [color-scheme:dark]"
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap 
          nodeStrokeWidth={3} 
          nodeColor={(n) => {
            if (n.data?.group === 'Document') return '#6366f1';
            if (n.data?.group === 'Chunk') return '#10b981';
            return '#94a3b8';
          }} 
          maskColor="rgba(10, 15, 28, 0.85)" 
          position="bottom-left" 
        />
        <Background color="#1e293b" gap={24} size={2} variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
