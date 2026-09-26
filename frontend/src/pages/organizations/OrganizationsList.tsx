import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Plus, Users, Target, Flag, Activity,
  MapPin, Mail, ExternalLink, ShieldCheck, X
} from 'lucide-react';
import { organizationsApi } from '../../services/api';
import { Organization } from '../../types';
import Layout from '../../components/layout/Layout';

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('University');
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const res = await organizationsApi.getAll();
      setOrganizations(res.data || []);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await organizationsApi.create({
        name,
        type,
        domain,
        location,
        contactEmail,
        description,
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      loadOrgs();
    } catch (err) {
      console.error('Failed to create organization', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Multi-Tenant Architecture
              </span>
              <span className="text-xs text-slate-500 font-mono">Workspace Directory</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Organizations & Workspaces</h1>
            <p className="text-sm text-slate-600">
              Government ministries, university incubators, research labs, and industry partners on InnovateIQ.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register Organization
          </button>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
            <p className="text-sm text-slate-500">Loading organizations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {organizations.map((org) => {
              const typeColors = {
                Government: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                University: 'bg-blue-100 text-blue-800 border-blue-200',
                Enterprise: 'bg-purple-100 text-purple-800 border-purple-200',
                'Research Lab': 'bg-amber-100 text-amber-800 border-amber-200',
                NGO: 'bg-teal-100 text-teal-800 border-teal-200',
              }[org.type] || 'bg-slate-100 text-slate-800';

              return (
                <div
                  key={org.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColors}`}>
                        {org.type}
                      </span>
                      {org.subscriptionTier && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {org.subscriptionTier}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{org.name}</h3>
                      {org.domain && (
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{org.domain}</p>
                      )}
                    </div>

                    {org.description && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{org.description}</p>
                    )}

                    <div className="space-y-1 pt-1 text-xs text-slate-500">
                      {org.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{org.location}</span>
                        </div>
                      )}
                      {org.contactEmail && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{org.contactEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1" title="Members">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {org.memberCount || 1}
                      </span>
                      <span className="flex items-center gap-1" title="Active Problems">
                        <Target className="w-3.5 h-3.5 text-slate-400" /> {org.activeProblemsCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Active Pilots">
                        <Flag className="w-3.5 h-3.5 text-slate-400" /> {org.activePilotsCount || 0}
                      </span>
                    </div>

                    <Link
                      to={`/problems?organizationId=${org.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Problems <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Register Organization */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Register Organization</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Water Development Agency"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                    >
                      <option value="Government">Government Ministry / Agency</option>
                      <option value="University">University Incubator</option>
                      <option value="Enterprise">Industry Enterprise</option>
                      <option value="Research Lab">Research Laboratory</option>
                      <option value="NGO">NGO / Social Sector</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. Clean Water & Environment"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="nodal@agency.gov.in"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the organization's charter..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Registering...' : 'Register Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
