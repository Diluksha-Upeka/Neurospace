"use client";

import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeMouseHandler // <--- Import this
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Define the props we expect from the parent
interface GraphViewerProps {
  onDocumentSelect: (filename: string) => void;
}

export default function GraphViewer({ onDocumentSelect }: GraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://localhost:8000/graph?limit=150');
        const data = await response.json();

        const flowNodes = data.nodes.map((node: any, index: number) => {
          const x = (index % 10) * 200; 
          const y = Math.floor(index / 10) * 150;

          let bgColor = '#ffffff';
          let borderColor = '#cbd5e1';
          let textColor = '#334155';
          if (node.group === 'Document') { bgColor = '#3b82f6'; textColor = '#ffffff'; borderColor = '#2563eb'; }
          if (node.group === 'Chunk') { bgColor = '#10b981'; textColor = '#ffffff'; borderColor = '#059669'; }

          return {
            id: node.id,
            position: { x: x + Math.random() * 50, y: y + Math.random() * 50 },
            data: { label: node.label, group: node.group }, // <--- Save group in data
            style: {
              background: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 500,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
              width: 150,
              textAlign: 'center',
              cursor: node.group === 'Document' ? 'pointer' : 'default' // Add pointer cursor
            }
          };
        });

        const flowEdges = data.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 10 }
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

  // THE CLICK HANDLER
  const handleNodeClick: NodeMouseHandler = (event, node) => {
    // If they click a Document node, we trigger the parent function
    if (node.data.group === 'Document') {
      const filename = node.data.label as string;
      onDocumentSelect(filename);
    }
  };

  if (loading) return <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium animate-pulse">Connecting to Neo4j Brain...</div>;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick} // <--- Attach it here
        fitView
        colorMode="light"
      >
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} nodeColor="#e2e8f0" maskColor="rgba(248, 250, 252, 0.7)" />
        <Background color="#cbd5e1" gap={20} size={1.5} />
      </ReactFlow>
    </div>
  );
}
