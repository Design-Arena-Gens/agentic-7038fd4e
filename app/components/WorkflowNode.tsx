"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const nodeIcons: Record<string, string> = {
  trigger: '▶️',
  http: '🌐',
  transform: '⚙️',
  filter: '🔍',
  webhook: '📡',
};

const nodeColors: Record<string, string> = {
  trigger: 'bg-green-100 border-green-300',
  http: 'bg-blue-100 border-blue-300',
  transform: 'bg-purple-100 border-purple-300',
  filter: 'bg-yellow-100 border-yellow-300',
  webhook: 'bg-pink-100 border-pink-300',
};

export default function WorkflowNode({ data, isConnectable }: NodeProps) {
  const nodeType = data.nodeType || 'trigger';
  const icon = nodeIcons[nodeType] || '📦';
  const colorClass = nodeColors[nodeType] || 'bg-gray-100 border-gray-300';

  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[160px] ${colorClass}`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-semibold text-sm text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{nodeType}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
    </div>
  );
}
