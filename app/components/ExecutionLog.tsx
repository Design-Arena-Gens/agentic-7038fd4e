"use client";

import React from 'react';
import { CheckCircle, XCircle, Loader, Clock } from 'lucide-react';

interface LogEntry {
  nodeId: string;
  nodeName: string;
  status: 'running' | 'success' | 'error';
  timestamp: string;
  duration?: string;
  output?: string;
  error?: string;
}

interface ExecutionLogProps {
  logs: LogEntry[];
}

export default function ExecutionLog({ logs }: ExecutionLogProps) {
  if (logs.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-2">
          <Clock size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">Execution Log</h3>
        <p className="text-sm text-gray-500 mt-1">
          Run your workflow to see execution results
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">Execution Log</h3>
        <p className="text-xs text-gray-500 mt-1">{logs.length} nodes executed</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 ${
              log.status === 'success'
                ? 'bg-green-50 border-green-200'
                : log.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {log.status === 'running' && (
                  <Loader size={18} className="text-blue-500 animate-spin" />
                )}
                {log.status === 'success' && (
                  <CheckCircle size={18} className="text-green-500" />
                )}
                {log.status === 'error' && (
                  <XCircle size={18} className="text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-800">
                  {log.nodeName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                  {log.duration && ` • ${log.duration}`}
                </div>
                {log.output && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                      View Output
                    </summary>
                    <pre className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs overflow-x-auto">
                      {log.output}
                    </pre>
                  </details>
                )}
                {log.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                    {log.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
