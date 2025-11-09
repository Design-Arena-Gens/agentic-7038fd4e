"use client";

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface NodePanelProps {
  node: Node;
  onUpdate: (config: any) => void;
}

export default function NodePanel({ node, onUpdate }: NodePanelProps) {
  const [config, setConfig] = useState(node.data.config || {});

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node]);

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const renderConfig = () => {
    switch (node.data.nodeType) {
      case 'trigger':
        return (
          <div className="text-sm text-gray-600">
            This node triggers the workflow execution.
          </div>
        );

      case 'http':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={config.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/data"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
          </div>
        );

      case 'transform':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JavaScript Code
            </label>
            <textarea
              value={config.code || 'return input;'}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="return { ...input, processed: true };"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use <code className="bg-gray-200 px-1 rounded">input</code> to access previous node data
            </p>
          </div>
        );

      case 'filter':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <input
              type="text"
              value={config.condition || 'true'}
              onChange={(e) => handleChange('condition', e.target.value)}
              placeholder="input.value > 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              JavaScript expression that returns true/false
            </p>
          </div>
        );

      case 'webhook':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <input
              type="text"
              value={config.webhookUrl || ''}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              placeholder="https://webhook.site/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return <div className="text-sm text-gray-600">No configuration available</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Node Name
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => {
            node.data.label = e.target.value;
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {renderConfig()}
    </div>
  );
}
