import React, { useRef, useState, useCallback } from 'react';
import { NodeCard } from './NodeCard';
import { EdgesSvg } from './EdgesSvg';
import type { GraphData, DesignOsNode } from '../../../types-legacy';
import './GraphPanel.css';

// Fixed node positions — generous spacing (min 40px breathing between nodes)
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'material': { x: 230, y: 20 },
  'strategy': { x: 230, y: 150 },
  'discovery': { x: 230, y: 290 },
  'ux': { x: 160, y: 440 },
  'design-system': { x: 20, y: 440 },
  'spec': { x: 80, y: 620 },
  'ui': { x: 420, y: 620 },
  'build': { x: 230, y: 820 },
  'review': { x: 230, y: 980 },
  'lab': { x: 520, y: 440 },
};

// Child offset configuration
const CHILD_OFFSET_X = 140; // Horizontal offset from parent
const CHILD_OFFSET_Y = 70;  // Vertical spacing between children (node height ~52px + 18px gap)

// Node dimension constants (used for canvas bounds)
const PARENT_NODE_WIDTH = 160;
const PARENT_NODE_HEIGHT = 90;
const CHILD_NODE_WIDTH = 120;
const CHILD_NODE_HEIGHT = 52;

interface GraphPanelProps {
  data: GraphData;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export function GraphPanel({ data, selectedNodeId, onSelectNode }: GraphPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  // Pan handlers (Space + drag or middle-click)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) { // Middle-click or Shift+click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      if (containerRef.current) {
        setScrollStart({
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop
        });
      }
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && containerRef.current) {
      containerRef.current.scrollLeft = scrollStart.x - (e.clientX - panStart.x);
      containerRef.current.scrollTop = scrollStart.y - (e.clientY - panStart.y);
    }
  }, [isPanning, panStart, scrollStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Enrich nodes with positions, including children
  const nodesWithPositions: Array<DesignOsNode & { x: number; y: number; isChild?: boolean; parentId?: string }> = [];

  for (const node of data.nodes) {
    const baseX = NODE_POSITIONS[node.id]?.x ?? 0;
    const baseY = NODE_POSITIONS[node.id]?.y ?? 0;

    // Add parent node
    nodesWithPositions.push({
      ...node,
      x: baseX,
      y: baseY,
    });

    // Add children with offset positions
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        nodesWithPositions.push({
          ...child,
          x: baseX + CHILD_OFFSET_X,
          y: baseY + (index * CHILD_OFFSET_Y),
          isChild: true,
          parentId: node.id,
        });
      });
    }
  }

  // Calculate canvas bounds (including children + node dimensions)
  const maxX = Math.max(
    ...nodesWithPositions.map(n => n.x + (n.isChild ? CHILD_NODE_WIDTH : PARENT_NODE_WIDTH))
  ) + 60;
  const maxY = Math.max(
    ...nodesWithPositions.map(n => n.y + (n.isChild ? CHILD_NODE_HEIGHT : PARENT_NODE_HEIGHT))
  ) + 60;

  return (
    <div
      ref={containerRef}
      className={`graph-panel ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="graph-container"
        style={{ width: maxX, height: maxY }}
      >
        {/* Edges SVG layer */}
        <EdgesSvg
          edges={data.edges}
          nodes={nodesWithPositions}
          width={maxX}
          height={maxY}
        />

        {/* Node cards */}
        {nodesWithPositions.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            selected={node.id === selectedNodeId}
            onSelect={() => onSelectNode(node.id)}
          />
        ))}

        {/* Global readiness indicator */}
        <div className="global-readiness">
          <span className="global-readiness-label">Projet</span>
          <span className="global-readiness-score">{Math.round(data.globalReadiness)}%</span>
        </div>
      </div>
    </div>
  );
}
