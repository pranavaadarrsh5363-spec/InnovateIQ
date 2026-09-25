import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { feasibilityApi } from '../../services/api';
import { ProjectFeasibilityReport, CostItem } from '../../types';
import {
  DollarSign, ShieldCheck, Plus, Trash2, Edit2, CheckCircle2,
  AlertTriangle, ArrowRight, Loader2, Sparkles, TrendingUp
} from 'lucide-react';

export default function FeasibilityAndCost() {
  const [report, setReport] = useState<ProjectFeasibilityReport | null>(null);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feasibility' | 'cost'>('feasibility');

  // Add Item modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Sensors' as any,
    quantity: 1,
    estimatedCostINR: 500,
    costType: 'One-Time' as any,
    notes: '',
  });

  useEffect(() => {
    Promise.all([feasibilityApi.analyze(), feasibilityApi.estimateCosts()])
      .then(([fRes, cRes]) => {
        setReport(fRes.data);
        setCostItems(cRes.data.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdatePrice = (id: string, newPrice: number) => {
    setCostItems(prev => prev.map(item => item.id === id ? { ...item, estimatedCostINR: newPrice } : item));
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setCostItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleDeleteItem = (id: string) => {
    setCostItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const item: CostItem = {
      id: `c-custom-${Date.now()}`,
      category: newItem.category,
      name: newItem.name,
      quantity: Number(newItem.quantity),
      estimatedCostINR: Number(newItem.estimatedCostINR),
      costType: newItem.costType,
      notes: newItem.notes,
    };
    setCostItems(prev => [...prev, item]);
    setShowAddModal(false);
    setNewItem({ name: '', category: 'Sensors', quantity: 1, estimatedCostINR: 500, costType: 'One-Time', notes: '' });
  };

  // Calculations
  const prototypeCost = costItems
    .filter(i => i.costType === 'One-Time')
    .reduce((acc, i) => acc + (i.quantity * i.estimatedCostINR), 0);

  const monthlyCost = costItems
    .filter(i => i.costType === 'Monthly')
    .reduce((acc, i) => acc + (i.quantity * i.estimatedCostINR), 0);

  const annualDeploymentCost = prototypeCost + (monthlyCost * 12);

  return (
    <Layout
      title="Project Feasibility & Cost Estimator"
      subtitle="Multi-factor engineering feasibility radar and editable Bill-of-Materials budget in Indian Rupees (₹)"
    >
      {/* Top Tab Switcher */}
      <div className="flex border-b border-gray-200 mb-6 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('feasibility')}
          className={`pb-3 relative transition-all ${
            activeTab === 'feasibility' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          AI Feasibility Assessment Radar
          {activeTab === 'feasibility' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-bg rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('cost')}
          className={`pb-3 relative transition-all ${
            activeTab === 'cost' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Bill-of-Materials & Budget Estimator (₹ INR)
          {activeTab === 'cost' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-bg rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'feasibility' && report && (
        <div className="space-y-6 animate-in">
          {/* Overall Health Score Card */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block mb-1">
                Project Readiness Index
              </span>
              <h3 className="text-2xl font-bold">Overall Feasibility Score: {report.overallScore} / 100</h3>
              <p className="text-xs text-blue-100 mt-1 max-w-xl">
                Synthesis based on current project parameters, open-source hardware benchmarks, and required engineering skill curves.
              </p>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-center self-start sm:self-auto">
              <span className="text-xs text-blue-100 block">Confidence Level</span>
              <span className="text-base font-bold">{report.confidenceLevel} Confidence</span>
            </div>
          </div>

          {/* 6 Feasibility Dimensions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Technical Feasibility', data: report.technicalFeasibility, icon: '⚙️' },
              { title: 'Resource Availability', data: report.resourceAvailability, icon: '📦' },
              { title: 'Skill Readiness', data: report.skillReadiness, icon: '🧠' },
              { title: 'Cost Feasibility', data: report.costFeasibility, icon: '💰' },
              { title: 'Scalability', data: report.scalability, icon: '📈' },
              { title: 'Deployment Complexity', data: report.deploymentComplexity, icon: '🚀' },
            ].map(({ title, data, icon }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <span>{icon}</span> {title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      data.rating === 'High' ? 'bg-emerald-100 text-emerald-800' :
                      data.rating === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {data.rating} ({data.score}/100)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        data.rating === 'High' ? 'bg-emerald-500' :
                        data.rating === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{data.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Recommendations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Key AI Engineering Recommendations</h4>
            <div className="space-y-2">
              {report.keyRecommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center italic">
            ⚠️ {report.disclaimer}
          </p>
        </div>
      )}

      {activeTab === 'cost' && (
        <div className="space-y-6 animate-in">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Estimated Prototype Cost</span>
              <span className="text-2xl font-black gradient-text">₹{prototypeCost.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-gray-400 block mt-1">One-time hardware build</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Estimated Monthly Cost</span>
              <span className="text-2xl font-black text-violet-600">₹{monthlyCost.toLocaleString('en-IN')}/mo</span>
              <span className="text-[10px] text-gray-400 block mt-1">Cloud hosting & cellular SMS</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Estimated 1-Year Deployment</span>
              <span className="text-2xl font-black text-emerald-600">₹{annualDeploymentCost.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-gray-400 block mt-1">Prototype + 12 months operation</span>
            </div>
          </div>

          {/* Editable Cost Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Interactive Bill of Materials (BOM)
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md flex items-center gap-1.5"
              >
                <Plus size={13} /> Add Custom Component
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Component Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Cost Type</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Price (₹)</th>
                    <th className="py-3 px-4 text-right">Subtotal (₹)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {costItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{item.name}</span>
                        {item.notes && <span className="text-[10px] text-gray-400">{item.notes}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600 font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.costType === 'One-Time' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                        }`}>
                          {item.costType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-400 hover:text-gray-700 font-bold px-1"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-semibold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-400 hover:text-gray-700 font-bold px-1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          value={item.estimatedCostINR}
                          onChange={e => handleUpdatePrice(item.id, Number(e.target.value))}
                          className="w-20 text-right px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ₹{(item.quantity * item.estimatedCostINR).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center italic">
            * All figures are approximate demo estimates in Indian Rupees (₹) based on open hardware benchmarks.
          </p>
        </div>
      )}

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Add Bill-of-Materials Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultrasonic Clean Transducer Module"
                  value={newItem.name}
                  onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem(n => ({ ...n, category: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {['Hardware', 'Sensors', 'Microcontrollers', 'Cloud Services', 'APIs', 'Hosting', 'Software', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cost Type</label>
                  <select
                    value={newItem.costType}
                    onChange={e => setNewItem(n => ({ ...n, costType: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="One-Time">One-Time (CapEx)</option>
                    <option value="Monthly">Monthly (OpEx)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={e => setNewItem(n => ({ ...n, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.estimatedCostINR}
                    onChange={e => setNewItem(n => ({ ...n, estimatedCostINR: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 gradient-bg text-white rounded-xl text-xs font-bold shadow"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
