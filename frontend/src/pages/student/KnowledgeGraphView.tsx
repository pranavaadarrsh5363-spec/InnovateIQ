import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { knowledgeGraphApi } from '../../services/api';
import { KnowledgeGraphNode, KnowledgeGraphEdge } from '../../types';
import { Network, Sparkles, Filter, ExternalLink, Info, Layers } from 'lucide-react';

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Student: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', dot: '#6366f1' },
  Project: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', dot: '#3b82f6' },
  Technology: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', dot: '#10b981' },
  Research: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', dot: '#8b5cf6' },
  Dataset: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', dot: '#f59e0b' },
  Resource: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', dot: '#06b6d4' },
  Skill: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', dot: '#f43f5e' },
  Mentor: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', dot: '#f97316' },
};

export default function KnowledgeGraphView() {
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    knowledgeGraphApi.getGraph().then(res => {
      setNodes(res.data.nodes);
      setEdges(res.data.edges);
      if (res.data.nodes.length > 0) setSelectedNode(res.data.find((n: any) => n.type === 'Project') || res.data[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredNodes = typeFilter === 'All'
    ? nodes
    : nodes.filter(n => n.type === typeFilter);

  const connectedEdges = selectedNode
    ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  return (
    <Layout
      title="Innovation Knowledge Graph"
      subtitle="Interactive multi-entity network mapping relationships between projects, skills, research, and datasets"
    >
      {/* Legend & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-gray-500 uppercase text-[10px] mr-1">Entities:</span>
          {Object.entries(NODE_COLORS).map(([type, colors]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'All' : type)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                typeFilter === type || typeFilter === 'All'
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.dot }} />
              {type}
            </button>
          ))}
        </div>

        {typeFilter !== 'All' && (
          <button
            onClick={() => setTypeFilter('All')}
            className="text-[11px] text-blue-600 font-semibold hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Graph Canvas Container */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl shadow-xl p-6 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex items-center justify-between text-white text-xs mb-4">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Network size={14} className="text-blue-400" /> Interactive Network Topology
            </span>
            <span className="text-[11px] text-slate-400">Click any node to explore connections</span>
          </div>

          {/* Interactive Node Matrix Visualization */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-auto">
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isConnected = connectedEdges.some(e => e.source === node.id || e.target === node.id);
              const color = NODE_COLORS[node.type] || NODE_COLORS.Project;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all backdrop-blur-sm select-none ${
                    isSelected
                      ? 'bg-blue-600/90 text-white border-blue-400 shadow-lg scale-105 z-20'
                      : isConnected
                        ? 'bg-slate-800/90 text-slate-100 border-slate-600 hover:border-slate-400'
                        : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider mb-1 opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                    <span>{node.type}</span>
                  </div>
                  <div className="font-bold text-[11px] line-clamp-2 leading-tight">
                    {node.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{nodes.length} Nodes • {edges.length} Semantic Relationships</span>
            <span className="text-emerald-400 font-semibold">Graph Topology: Synced</span>
          </div>
        </div>

        {/* Node Detail & Relationship Sidebar */}
        {selectedNode && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  NODE_COLORS[selectedNode.type]?.bg || 'bg-gray-100'
                } ${NODE_COLORS[selectedNode.type]?.text || 'text-gray-800'}`}>
                  {selectedNode.type}
                </span>
                <span className="text-[11px] text-gray-400">{selectedNode.id}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{selectedNode.label}</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {selectedNode.description || 'Core entity in the student innovation ecosystem.'}
              </p>
            </div>

            {/* Connected Relationships list */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Connected Nodes ({connectedEdges.length})
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {connectedEdges.map(edge => {
                  const isSource = edge.source === selectedNode.id;
                  const otherNodeId = isSource ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherNodeId);

                  return (
                    <div
                      key={edge.id}
                      onClick={() => otherNode && setSelectedNode(otherNode)}
                      className="p-3 bg-gray-50/70 hover:bg-blue-50/60 border border-gray-100 rounded-xl cursor-pointer transition-all text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                        <span className="font-semibold text-blue-600 uppercase">{edge.relationship}</span>
                        <span>{otherNode?.type}</span>
                      </div>
                      <div className="font-bold text-gray-800 text-[11px]">
                        {otherNode?.label || otherNodeId}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl text-xs text-blue-900 leading-relaxed">
              💡 <span className="font-bold">Ecosystem Insight:</span> This node forms a multi-hop dependency link in the active student project workflow.
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
