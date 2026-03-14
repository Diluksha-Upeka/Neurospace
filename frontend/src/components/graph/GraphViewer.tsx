"use client"; // This must be a client component because it uses interactivity and hooks

import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function GraphViewer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from our FastAPI backend
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://localhost:8000/graph?limit=100');
        const data = await response.json();

        // Transform Backend Nodes -> React Flow Nodes
        const flowNodes = data.nodes.map((node: any, index: number) => {
          // React Flow requires X,Y coordinates. We don't have them in Neo4j.
          // For today, we use a simple grid/random math to spread them out.
          // (Tomorrow we can add a layout engine like Dagre if we want it perfect)
          const x = (index % 10) * 200; 
          const y = Math.floor(index / 10) * 150;

          // Color code based on node type
          let bgColor = '#334155'; // Default Entity
          if (node.group === 'Document') bgColor = '#2563eb'; // Blue
          if (node.group === 'Chunk') bgColor = '#059669'; // Green

          return {
            id: node.id,
            position: { x: x + Math.random() * 50, y: y + Math.random() * 50 },
            data: { label: node.label },
            style: {
              background: bgColor,
              color: 'white',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '12px',
              width: 150,
              textAlign: 'center'
            }
          };
        });

        // Transform Backend Edges -> React Flow Edges
        const flowEdges = data.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          animated: true, // Makes the connections look like flowing data!
          style: { stroke: '#94a3b8' },
          labelStyle: { fill: '#cbd5e1', fontWeight: 700, fontSize: 10 }
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse">
        Connecting to Neo4j Brain...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView // Automatically zooms out to fit all nodes on screen
        colorMode="dark"
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} nodeColor="#475569" maskColor="rgba(15, 23, 42, 0.8)" />
        <Background color="#334155" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
