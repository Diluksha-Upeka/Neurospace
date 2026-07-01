"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
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

// Beautiful Custom Node Component
const CustomNode = ({ data }: NodeProps) => {
  const isDoc = data.group === 'Document' || (typeof data.label === 'string' && (data.label.toLowerCase().endsWith('.pdf') || data.label.toLowerCase().endsWith('.mp4')));
  
  return (
    <div className={`px-4 py-3 border transition-all hover:-translate-y-0.5 ${isDoc ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-foreground'}`}>
       <div className="flex items-start gap-3">
         <div className={`w-8 h-8 mt-0.5 flex items-center justify-center border shrink-0 ${isDoc ? 'bg-primary/80 border-primary/60 text-primary-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
           {isDoc ? (
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
           ) : (
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
           )}
         </div>
         <div>
           <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{data.group as string}</div>
           <div className={`text-[18px] w-[200px] mt-1 leading-relaxed ${isDoc ? 'font-semibold text-primary-foreground truncate' : 'font-medium text-foreground line-clamp-5'}`} title={data.label as string}>
             {data.label as string}
           </div>
         </div>
       </div>
       
       {/* Top Handles */}
       <Handle type="target" id="t-top" position={Position.Top} className="w-1.5 h-1.5 !bg-transparent !border-0" />
       <Handle type="source" id="s-top" position={Position.Top} className="w-1.5 h-1.5 !bg-transparent !border-0" />
       
       {/* Bottom Handles */}
       <Handle type="target" id="t-bottom" position={Position.Bottom} className="w-1.5 h-1.5 !bg-transparent !border-0" />
       <Handle type="source" id="s-bottom" position={Position.Bottom} className="w-1.5 h-1.5 !bg-transparent !border-0" />

       {/* Left Handles */}
       <Handle type="target" id="t-left" position={Position.Left} className="w-1.5 h-1.5 !bg-transparent !border-0" />
       <Handle type="source" id="s-left" position={Position.Left} className="w-1.5 h-1.5 !bg-transparent !border-0" />

       {/* Right Handles */}
       <Handle type="target" id="t-right" position={Position.Right} className="w-1.5 h-1.5 !bg-transparent !border-0" />
       <Handle type="source" id="s-right" position={Position.Right} className="w-1.5 h-1.5 !bg-transparent !border-0" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
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

export type GraphViewerProps = {
  onNodeClick?: (filename: string) => void;
  onGraphStatsClick?: () => void;
};

export default function GraphViewer({ onNodeClick, onGraphStatsClick }: GraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithTimeout(apiUrl("/graph?limit=800"), 30000);

      if (!response.ok) {
        throw new Error(`Graph API returned ${response.status}`);
      }

      const payload = (await response.json()) as ApiGraphPayload;

      // Determine node connectivity (degrees) to find the center
      const degreeMap = new Map<string, number>();
      payload.edges.forEach(e => {
         degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
         degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
      });

      let mostConnectedId = payload.nodes[0]?.id;
      let maxDegree = -1;
      payload.nodes.forEach(n => {
         const deg = degreeMap.get(n.id) || 0;
         if (deg > maxDegree) {
            maxDegree = deg;
            mostConnectedId = n.id;
         }
      });

      // Separate root node from others
      const rootNode = payload.nodes.find(n => n.id === mostConnectedId);
      const otherNodes = payload.nodes.filter(n => n.id !== mostConnectedId);

      // Sort other nodes by degree so highly connected ones are closer to the center
      otherNodes.sort((a,b) => (degreeMap.get(b.id) || 0) - (degreeMap.get(a.id) || 0));

      const flowNodes: Node[] = [];

      // Place root node at absolute center
      if (rootNode) {
        flowNodes.push({
          id: rootNode.id,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: rootNode.label, group: rootNode.group },
        });
      }

      // Distribute remaining nodes in dense concentric circles
      let currentRadius = 300;
      let currentInCircle = 0;
      // Calculate capacity based on circumference so nodes fit snugly (approx 250px spacing)
      let capacityForRadius = Math.max(8, Math.floor((2 * Math.PI * currentRadius) / 250));

      otherNodes.forEach((node) => {
          if (currentInCircle >= capacityForRadius) {
              currentRadius += 180; // Tighter rings
              capacityForRadius = Math.floor((2 * Math.PI * currentRadius) / 250);
              currentInCircle = 0;
          }
          // Offset the starting angle slightly for each ring to create a spiral effect
          const angleOffset = (currentRadius / 180) * 0.3;
          const angle = angleOffset + (currentInCircle / capacityForRadius) * Math.PI * 2;
          
          flowNodes.push({
              id: node.id,
              type: 'custom',
              position: {
                 x: Math.cos(angle) * currentRadius,
                 y: Math.sin(angle) * currentRadius
              },
              data: { label: node.label, group: node.group }
          });
          currentInCircle++;
      });

      const flowEdges: Edge[] = payload.edges.map((edge) => {
         const sourceNode = flowNodes.find(n => n.id === edge.source);
         const targetNode = flowNodes.find(n => n.id === edge.target);
         
         let sourceHandle = "s-bottom";
         let targetHandle = "t-top";

         if (sourceNode && targetNode) {
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                sourceHandle = dx > 0 ? "s-right" : "s-left";
                targetHandle = dx > 0 ? "t-left" : "t-right";
            } else {
                sourceHandle = dy > 0 ? "s-bottom" : "s-top";
                targetHandle = dy > 0 ? "t-top" : "t-bottom";
            }
         }

         return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle,
            targetHandle,
            animated: true,
            type: 'straight',
            style: { strokeWidth: 1.5, opacity: 0.7 },
            className: "stroke-muted-foreground",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: '#94a3b8',
            },
            // Edge labels explicitly removed to prevent chaotic "MENTIONS" overlap spaghetti
         };
      });

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
      <div className="w-full h-full flex flex-col items-center justify-center bg-card border border-border relative overflow-hidden">
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center">
             <div className="w-5 h-5 border-[3px] border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <span className="text-[14px] font-semibold text-muted-foreground tracking-tight">Initializing Knowledge Graph...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-card border border-border relative overflow-hidden">
        <div className="max-w-sm w-full border border-destructive/30 bg-card p-8 text-center z-10">
          <div className="w-14 h-14 bg-destructive/10 flex items-center justify-center mx-auto mb-5 border border-destructive/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-destructive"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-[16px] font-bold text-foreground tracking-tight">Sync Interrupted</p>
          <p className="text-[13px] text-muted-foreground mt-2 font-medium leading-relaxed">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-6 w-full py-3 text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all focus:ring-2 focus:ring-ring focus:outline-none"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-card border border-border relative overflow-hidden">
        <div className="w-20 h-20 bg-muted border border-border flex items-center justify-center mb-6 z-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </div>
        <p className="text-[16px] font-bold tracking-tight text-foreground mb-2 z-10">Knowledge Graph is Empty</p>
        <p className="text-[14px] font-medium text-muted-foreground z-10 max-w-sm text-center mb-6">Upload a PDF or MP4 document via the ingestion pipeline to automatically generate semantic nodes.</p>
        <button
          onClick={loadGraph}
          className="z-10 px-4 py-2 text-[12px] font-bold uppercase tracking-wider bg-card border border-border hover:bg-primary hover:text-primary-foreground text-foreground transition-all flex items-center gap-2 group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21v-5h5"></path></svg>
          Refresh Graph
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background overflow-hidden border border-border relative z-0">
      
      {/* Network Stats HUD */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-card border border-border py-2 px-3 flex items-center gap-3">
           <div className="flex items-center gap-1.5 border-r border-border pr-3">
             <div className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
             </div>
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Live</span>
           </div>
           <div className="flex items-center gap-2">
             <button
               type="button"
               onClick={onGraphStatsClick}
               disabled={!onGraphStatsClick}
               className="flex items-baseline gap-1 px-2 py-1 border border-transparent hover:border-border transition-colors disabled:hover:border-transparent disabled:cursor-default"
               aria-label="Open full-screen graph from node count"
             >
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Nodes</span>
                <span className="text-[12px] font-bold text-foreground">{nodes.length}</span>
             </button>
             <button
               type="button"
               onClick={onGraphStatsClick}
               disabled={!onGraphStatsClick}
               className="flex items-baseline gap-1 px-2 py-1 border border-transparent hover:border-border transition-colors disabled:hover:border-transparent disabled:cursor-default"
               aria-label="Open full-screen graph from edge count"
             >
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Edges</span>
                <span className="text-[12px] font-bold text-foreground">{edges.length}</span>
             </button>
             <button
               type="button"
               onClick={loadGraph}
                className="flex items-center justify-center p-1 border border-transparent hover:border-border transition-all ml-1 group"
               aria-label="Refresh graph data"
             >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21v-5h5"></path></svg>
             </button>
           </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => {
          if (onNodeClick && typeof node.data.label === 'string') {
            const lowerLabel = node.data.label.toLowerCase();
            if (node.data.group === 'Document' || lowerLabel.endsWith('.pdf') || lowerLabel.endsWith('.mp4')) {
               onNodeClick(node.data.label);
            }
          }
        }}
        fitView
        className="[&_.react-flow\_\_controls]:bg-card/90 [&_.react-flow\_\_controls]:backdrop-blur-xl [&_.react-flow\_\_controls]:border-border [&_.react-flow\_\_controls]:shadow-sm [&_.react-flow\_\_controls_button]:border-b-border [&_.react-flow\_\_controls_button]:fill-foreground [&_.react-flow\_\_controls_button:hover]:bg-muted [&_.react-flow\_\_minimap]:bg-card/90 [&_.react-flow\_\_minimap]:backdrop-blur-xl [&_.react-flow\_\_minimap]:border-border [&_.react-flow\_\_minimap]:shadow-sm"
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap 
          style={{ height: 120, width: 160 }}
          nodeStrokeWidth={2} 
          nodeColor={(n) => {
            const isDocumentNode = n.data?.group === 'Document' || (typeof n.data?.label === 'string' && (n.data?.label.toLowerCase().endsWith('.pdf') || n.data?.label.toLowerCase().endsWith('.mp4')));
            if (isDocumentNode) return '#4f46e5'; // Deep Indigo
            if (n.data?.group === 'Chunk' || n.data?.group === 'CHUNK') return '#34d399'; // Emerald
            return '#cbd5e1';
          }} 
          maskColor="rgba(255, 255, 255, 0.6)" 
          position="bottom-left" 
        />
        <Background color="#cbd5e1" gap={24} size={1.5} variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
