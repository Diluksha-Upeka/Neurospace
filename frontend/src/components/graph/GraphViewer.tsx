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
    bg: "#ffffff", 
    border: "rgba(203, 213, 225, 1)", 
    color: "#0f172a", 
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
  },
  Chunk: { 
    bg: "#ffffff", 
    border: "rgba(226, 232, 240, 1)", 
    color: "#334155", 
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)"
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
          bg: "#ffffff",
          border: "rgba(226, 232, 240, 1)",
          color: "#0f172a",
          shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)"
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
            fontWeight: 500,
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
        style: { stroke: "#cbd5e1", strokeWidth: 1.5, opacity: 0.6 },
        labelStyle: { fill: "#64748b", fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1, rx: 4, ry: 4 },
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
      <div className="w-full h-full rounded-3xl flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm">
        <div className="flex gap-3 items-center justify-center bg-white border border-slate-200 px-6 py-3 rounded-full shadow-sm text-slate-600 font-medium text-[13px] tracking-tight">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          Initializing Workspace...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-3xl flex items-center justify-center p-8 bg-white border border-slate-200 shadow-sm">
        <div className="max-w-sm w-full rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-rose-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-[14px] font-semibold text-rose-900 tracking-tight">Graph Sync Interrupted</p>
          <p className="text-[12px] text-rose-600 mt-2 font-medium">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-6 px-5 py-2.5 text-[13px] font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </div>
        <p className="text-[15px] font-semibold tracking-tight text-slate-700 mb-1">Knowledge Graph is Empty</p>
        <p className="text-[13px] font-medium text-slate-500">Upload a PDF or MP4 document to generate nodes.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden border border-slate-200 relative z-0 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(241,245,249,0.5)_0%,rgba(255,255,255,1)_70%)] pointer-events-none"></div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="[&_.react-flow\_\_controls]:bg-white/80 [&_.react-flow\_\_controls]:backdrop-blur-md [&_.react-flow\_\_controls]:border-slate-200 [&_.react-flow\_\_controls]:shadow-sm [&_.react-flow\_\_controls_button]:border-b-slate-100 [&_.react-flow\_\_controls_button]:fill-slate-600 [&_.react-flow\_\_controls_button:hover]:bg-slate-50 [&_.react-flow\_\_minimap]:bg-white/80 [&_.react-flow\_\_minimap]:backdrop-blur-md [&_.react-flow\_\_minimap]:border-slate-200"
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap 
          nodeStrokeWidth={2} 
          nodeColor={(n) => {
            if (n.data?.group === 'Document') return '#94a3b8';
            if (n.data?.group === 'Chunk') return '#cbd5e1';
            return '#e2e8f0';
          }} 
          maskColor="rgba(255, 255, 255, 0.8)" 
          position="bottom-left" 
        />
        <Background color="#cbd5e1" gap={24} size={1.5} variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
