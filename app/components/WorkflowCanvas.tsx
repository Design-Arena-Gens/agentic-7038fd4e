"use client";

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  Panel,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Plus, Save, Trash2, Download, Upload } from 'lucide-react';
import WorkflowNode from './WorkflowNode';
import NodePanel from './NodePanel';
import ExecutionLog from './ExecutionLog';

const nodeTypes = {
  workflow: WorkflowNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflow',
    position: { x: 250, y: 100 },
    data: {
      label: 'Start',
      nodeType: 'trigger',
      config: {},
    },
  },
];

export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [executionLog, setExecutionLog] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (nodeType: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'workflow',
      position: { x: Math.random() * 500, y: Math.random() * 300 + 100 },
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        nodeType,
        config: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setExecutionLog([]);

    const log: any[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edgeMap = new Map<string, Edge[]>();

    edges.forEach(edge => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source)?.push(edge);
    });

    const executeNode = async (nodeId: string, input: any = null): Promise<any> => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const startTime = Date.now();
      log.push({
        nodeId,
        nodeName: node.data.label,
        status: 'running',
        timestamp: new Date().toISOString(),
      });
      setExecutionLog([...log]);

      await new Promise(resolve => setTimeout(resolve, 500));

      let output: any = null;

      try {
        switch (node.data.nodeType) {
          case 'trigger':
            output = { triggered: true, timestamp: new Date().toISOString() };
            break;
          case 'http':
            const url = node.data.config?.url || 'https://jsonplaceholder.typicode.com/todos/1';
            try {
              const response = await fetch(url);
              output = await response.json();
            } catch (error) {
              throw new Error(`HTTP request failed: ${error}`);
            }
            break;
          case 'transform':
            const code = node.data.config?.code || 'return input;';
            try {
              const fn = new Function('input', code);
              output = fn(input);
            } catch (error) {
              throw new Error(`Transform failed: ${error}`);
            }
            break;
          case 'filter':
            const condition = node.data.config?.condition || 'true';
            try {
              const fn = new Function('input', `return ${condition};`);
              const passes = fn(input);
              output = passes ? input : null;
            } catch (error) {
              throw new Error(`Filter failed: ${error}`);
            }
            break;
          case 'webhook':
            output = { webhookSent: true, data: input };
            break;
          default:
            output = input;
        }

        const duration = Date.now() - startTime;
        log[log.length - 1] = {
          ...log[log.length - 1],
          status: 'success',
          duration: `${duration}ms`,
          output: JSON.stringify(output, null, 2),
        };
        setExecutionLog([...log]);

        const outgoingEdges = edgeMap.get(nodeId) || [];
        for (const edge of outgoingEdges) {
          await executeNode(edge.target, output);
        }
      } catch (error: any) {
        const duration = Date.now() - startTime;
        log[log.length - 1] = {
          ...log[log.length - 1],
          status: 'error',
          duration: `${duration}ms`,
          error: error.message,
        };
        setExecutionLog([...log]);
      }

      return output;
    };

    const startNode = nodes.find(n => n.data.nodeType === 'trigger');
    if (startNode) {
      await executeNode(startNode.id);
    }

    setIsExecuting(false);
  };

  const saveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          alert('Failed to load workflow');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold">n8n Agent</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            {isExecuting ? 'Running...' : 'Execute'}
          </button>
          <button
            onClick={saveWorkflow}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          <label className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer">
            <Upload size={18} />
            Import
            <input type="file" accept=".json" onChange={loadWorkflow} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Nodes</h2>
          <div className="space-y-2">
            <button
              onClick={() => addNode('http')}
              className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 p-3 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-gray-800">🌐 HTTP Request</div>
              <div className="text-xs text-gray-500 mt-1">Make HTTP API calls</div>
            </button>
            <button
              onClick={() => addNode('transform')}
              className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 p-3 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-gray-800">⚙️ Transform</div>
              <div className="text-xs text-gray-500 mt-1">Process and modify data</div>
            </button>
            <button
              onClick={() => addNode('filter')}
              className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 p-3 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-gray-800">🔍 Filter</div>
              <div className="text-xs text-gray-500 mt-1">Conditional branching</div>
            </button>
            <button
              onClick={() => addNode('webhook')}
              className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 p-3 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-gray-800">📡 Webhook</div>
              <div className="text-xs text-gray-500 mt-1">Send data to endpoints</div>
            </button>
          </div>

          {selectedNode && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Configuration</h2>
                <button
                  onClick={deleteNode}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <NodePanel
                node={selectedNode}
                onUpdate={(config) => updateNodeConfig(selectedNode.id, config)}
              />
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <ExecutionLog logs={executionLog} />
        </div>
      </div>
    </div>
  );
}
