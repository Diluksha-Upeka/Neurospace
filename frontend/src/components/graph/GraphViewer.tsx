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

const groupStyles: Record<string, { bg: string; border: string; color: string }> = {
  Document: { bg: "rgba(238, 242, 255, 0.95)", border: "rgba(199, 210, 254, 0.8)", color: "#3730A3" },
  Chunk: { bg: "rgba(240, 253, 244, 0.95)", border: "rgba(167, 243, 208, 0.8)", color: "#065F46" },
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
          border: "#cbd5e1",
          color: "#334155",
        };

        return {
          id: node.id,
          position: { x, y },
          data: { label: node.label, group: node.group },
          style: {
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            borderRadius: "16px",
            padding: "12px 16px",
            fontSize: "11px",
            fontWeight: 600,
            width: 170,
            textAlign: "center",
            boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.01)",
            backdropFilter: "blur(8px)",
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
        labelStyle: { fill: "#64748b", fontSize: 9, fontWeight: 500, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' },
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
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50">
        <div className="flex gap-2 items-center justify-center bg-white border border-slate-200/60 px-5 py-3 rounded-full shadow-sm text-slate-500 font-medium text-[13px] tracking-tight">
          <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          Synthesizing Neo4j Brain...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-slate-50/50">
        <div className="max-w-sm w-full rounded-2xl border border-rose-200/60 bg-rose-50/50 backdrop-blur-md p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-rose-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-[14px] font-semibold text-rose-800 tracking-tight">Graph Sync Interrupted</p>
          <p className="text-[12px] text-rose-600 mt-2 font-medium">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-6 px-5 py-2.5 text-[13px] font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-indigo-300"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </div>
        <p className="text-[15px] font-semibold tracking-tight text-slate-600 mb-1">Knowledge Graph is Empty</p>
        <p className="text-[13px] font-medium">Upload a PDF or MP4 document to generate nodes.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50/50 backdrop-blur-3xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,rgba(248,250,252,0)_60%)] pointer-events-none"></div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="[&_.react-flow\_\_controls]:bg-white/80 [&_.react-flow\_\_controls]:backdrop-blur-md [&_.react-flow\_\_controls]:border-slate-200/60 [&_.react-flow\_\_controls]:shadow-sm [&_.react-flow\_\_controls_button]:border-b-slate-200/60 [&_.react-flow\_\_controls_button:hover]:bg-indigo-50 [&_.react-flow\_\_minimap]:bg-white/80 [&_.react-flow\_\_minimap]:backdrop-blur-md [&_.react-flow\_\_minimap]:border-slate-200/60 [&_.react-flow\_\_minimap]:shadow-sm"
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap nodeStrokeWidth={3} nodeColor="rgba(99,102,241,0.4)" maskColor="rgba(248, 250, 252, 0.85)" position="bottom-left" />
        <Background color="#cbd5e1" gap={20} size={1} variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
