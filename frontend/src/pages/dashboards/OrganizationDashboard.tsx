import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Globe, Rocket, Target, BarChart3, PlusCircle,
  Users, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck,
  RefreshCw, FileText, ChevronRight
} from 'lucide-react';
import { organizationsApi, problemsApi, pilotsApi } from '../../services/api';
import { OrganizationProfile, Problem, PilotProgram } from '../../types';
import Layout from '../../components/layout/Layout';
import OnboardingGuide from '../../components/common/OnboardingGuide';

export default function OrganizationDashboard() {
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pilots, setPilots] = useState<PilotProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await organizationsApi.getAll();
      const orgs = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setOrganizations(orgs);
      if (orgs.length > 0) {
        setSelectedOrg(orgs[0]);
        loadOrgDetails(orgs[0].id);
      }
    } catch (err) {
      console.error('Failed to load orgs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrgDetails = async (orgId: string) => {
    try {
      const [probRes, pilotRes] = await Promise.all([
        organizationsApi.getProblems(orgId),
        organizationsApi.getPilots(orgId)
      ]);
      setProblems(Array.isArray(probRes.data) ? probRes.data : (probRes.data.data || []));
      setPilots(Array.isArray(pilotRes.data) ? pilotRes.data : (pilotRes.data.data || []));
    } catch (err) {
      console.error('Failed to load org details:', err);
    }
  };

  const handleSelectOrg = (org: OrganizationProfile) => {
    setSelectedOrg(org);
    loadOrgDetails(org.id);
  };

  return (
    <Layout title="Agency Portal" subtitle="Government & enterprise problem sponsorship and field oversight">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <Building2 size={13} className="text-blue-400" />
              Agency Portal
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[SPONSORSHIP CONSOLE]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Problem Sponsorship & Field Oversight
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Monitor challenges published by national ministries, public sector enterprises, and philanthropic partners. Direct academic and student engineering cohorts toward ground-truth evidence.
          </p>
        </div>
      </div>

      {/* Organization Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => handleSelectOrg(org)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border flex-shrink-0 ${
              selectedOrg?.id === org.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Building2 size={14} />
            <span>{org.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({org.type})</span>
          </button>
        ))}
      </div>

      {selectedOrg && (
        <div className="space-y-6">
          {/* Onboarding Guide */}
          <OnboardingGuide
            organizationName={selectedOrg.name}
            hasProblems={problems.length > 0}
            hasPilots={pilots.length > 0}
            hasEvidence={true}
            hasSolutions={problems.length > 0}
            hasDevices={pilots.length > 0}
            hasTelemetry={pilots.length > 0}
            hasImpact={pilots.length > 0}
          />

          {/* Org Header Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedOrg.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedOrg.location}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedOrg.name}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  {selectedOrg.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
                <div className="flex-1 md:flex-initial p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center min-w-[90px] sm:min-w-[100px]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Problems</span>
                  <p className="text-base sm:text-lg font-bold text-blue-600 mt-0.5">{problems.length}</p>
                </div>
                <div className="flex-1 md:flex-initial p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center min-w-[90px] sm:min-w-[100px]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Field Pilots</span>
                  <p className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5">{pilots.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsored Problems */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe size={18} className="text-blue-600" />
                Sponsored Challenges ({problems.length})
              </h3>
              <Link
                to="/problems"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Browse All 18 Domains <ChevronRight size={13} />
              </Link>
            </div>

            {problems.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
                <FileText size={36} className="mx-auto text-slate-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Challenges Currently Sponsored</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Publish a verified regional or national engineering challenge to mobilize student innovator cohorts.
                </p>
                <Link
                  to="/problems"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                  <PlusCircle size={14} /> Sponsor New Challenge
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problems.map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prob.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                        {prob.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {prob.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {prob.description}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500">Scope: {prob.location}</span>
                      <Link
                        to={`/problems/${prob.id}/analyze`}
                        className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View Intelligence <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Field Pilots */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Rocket size={18} className="text-emerald-600" />
              Active Field Pilots Under Supervision ({pilots.length})
            </h3>
            {pilots.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pilots actively running for this organization.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pilots.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{p.description}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500">Location: {p.location}</span>
                      <Link
                        to="/pilots"
                        className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Inspect Telemetry <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
