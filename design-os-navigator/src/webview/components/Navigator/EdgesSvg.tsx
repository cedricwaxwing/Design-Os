import React from 'react';
import type { GraphEdge, DesignOsNode } from '../../../types-legacy';
import './EdgesSvg.css';

interface NodeWithPosition extends DesignOsNode {
  x: number;
  y: number;
  isChild?: boolean;
}

interface EdgesSvgProps {
  edges: GraphEdge[];
  nodes: NodeWithPosition[];
  width: number;
  height: number;
}

// Node dimensions for edge connection point calculation
const NODE_WIDTH = 160;
const PARENT_HEIGHT = 90;
const CHILD_HEIGHT = 52;

export function EdgesSvg({ edges, nodes, width, height }: EdgesSvgProps) {

  return (
    <svg className="edges-svg" width={width} height={height}>
      {edges.map((edge, index) => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);

        if (!fromNode || !toNode) return null;

        // Calculate connection points using actual node heights
        const fromHeight = fromNode.isChild ? CHILD_HEIGHT : PARENT_HEIGHT;
        const toHeight = toNode.isChild ? CHILD_HEIGHT : PARENT_HEIGHT;
        const fx = fromNode.x + NODE_WIDTH;
        const fy = fromNode.y + fromHeight / 2;
        const tx = toNode.x;
        const ty = toNode.y + toHeight / 2;

        // Bezier control points
        const dx = Math.abs(tx - fx);
        const cpx = Math.max(dx * 0.4, 40);

        const pathD = `M ${fx} ${fy} C ${fx + cpx} ${fy}, ${tx - cpx} ${ty}, ${tx} ${ty}`;

        // Style based on source node readiness
        const readiness = fromNode.readiness;
        let edgeColor = 'var(--border)';
        let edgeOpacity = 1;
        let strokeWidth = 1.5;
        let animated = false;

        if (edge.type === 'nogo') {
          edgeColor = 'var(--error)';
          edgeOpacity = 0.8;
          strokeWidth = 2;
        } else if (readiness === 0) {
          edgeColor = 'rgba(255,255,255,0.35)';
          strokeWidth = 0.75;
        } else if (readiness < 30) {
          edgeColor = 'var(--error)';
          edgeOpacity = 0.4 + (readiness / 100) * 0.4;
          strokeWidth = 0.75 + (readiness / 100) * 1.75;
          animated = true;
        } else if (readiness < 70) {
          edgeColor = 'var(--warning)';
          edgeOpacity = 0.5 + (readiness / 100) * 0.4;
          animated = true;
        } else {
          edgeColor = 'var(--success)';
          edgeOpacity = 0.6 + (readiness / 100) * 0.3;
          animated = true;
        }

        const edgeClasses = [
          'edge-line',
          edge.type === 'dependency' ? 'dependency' : '',
          edge.type === 'nogo' ? 'nogo' : '',
          animated ? 'animated' : '',
        ].filter(Boolean).join(' ');

        return (
          <g key={`${edge.from}-${edge.to}-${index}`}>
            <path
              className={edgeClasses}
              d={pathD}
              style={{
                stroke: edgeColor,
                strokeWidth,
                opacity: edgeOpacity,
              }}
            />
            {/* NO-GO label */}
            {edge.type === 'nogo' && edge.nogoGapType && (
              <text
                className="nogo-label"
                x={(fx + tx) / 2}
                y={(fy + ty) / 2 - 6}
                textAnchor="middle"
              >
                {edge.nogoGapType}
                {edge.nogoGapCount ? ` (${edge.nogoGapCount})` : ''}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
