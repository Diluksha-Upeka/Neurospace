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
  Document: { bg: "#2563eb", border: "#1d4ed8", color: "#ffffff" },
  Chunk: { bg: "#059669", border: "#047857", color: "#ffffff" },
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
            borderRadius: "12px",
            padding: "10px",
            fontSize: "12px",
            fontWeight: 600,
            width: 165,
            textAlign: "center",
            boxShadow: "0 3px 8px rgba(15, 23, 42, 0.08)",
          },
        };
      });

      const flowEdges: Edge[] = payload.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        labelStyle: { fill: "#64748b", fontSize: 10, fontWeight: 600 },
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
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <p className="animate-pulse text-sm font-medium">Synthesizing Neo4j Brain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-700">Graph Load Failed</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <p className="text-sm font-medium">No graph nodes yet. Upload a PDF or MP4 to build your graph.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} nodeColor="#e2e8f0" maskColor="rgba(248, 250, 252, 0.7)" />
        <Background color="#cbd5e1" gap={20} size={1.5} />
      </ReactFlow>
    </div>
  );
}
