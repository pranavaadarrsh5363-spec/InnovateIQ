import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Sparkles, Cpu, Award, DollarSign, Briefcase,
  CheckCircle2, ArrowRight, Globe, Layers, BarChart3
} from 'lucide-react';
import Layout from '../../components/layout/Layout';

export default function IndustryDashboard() {
  const corporateSponsors = [
    {
      company: 'Tata Consultancy Services (TCS) Innovation Labs',
      vertical: 'Rural Tech & Sustainable Computing',
      csrFundAllocated: '₹45,00,000',
      activeChallenges: 3,
      teamsMentored: 12
    },
    {
      company: 'Infosys Science Foundation',
      vertical: 'AI for Public Healthcare & Diagnostics',
      csrFundAllocated: '₹60,00,000',
      activeChallenges: 2,
      teamsMentored: 8
    },
    {
      company: 'Adani Green Energy Ltd',
      vertical: 'Renewable Microgrid Optimization',
      csrFundAllocated: '₹35,00,000',
      activeChallenges: 2,
      teamsMentored: 6
    }
  ];

  return (
    <Layout title="Industry Adoption" subtitle="Corporate CSR funds, hardware grants & technology transfer">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <Building2 size={13} className="text-emerald-400" />
              Corporate CSR
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[COMMERCIALIZATION & ADOPTION]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Industry Technology Adoption & CSR Matchmaking
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Connect corporate enterprise technology stacks, hardware testbeds, and CSR grants with student engineering teams tackling pressing national infrastructure bottlenecks.
          </p>
        </div>
      </div>

      {/* Corporate Partnerships Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase size={18} className="text-blue-600" />
            Corporate Sponsoring Partners
          </h3>
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">[ENTERPRISE CSR PARTNERS]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {corporateSponsors.map((corp, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {corp.vertical}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {corp.company}
                </h4>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">CSR Grant Pool:</span>
                    <strong className="text-emerald-600 font-bold">{corp.csrFundAllocated}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sponsored Problems:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{corp.activeChallenges}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Teams Backed:</span>
                    <strong className="text-blue-600">{corp.teamsMentored} Teams</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  to="/problems"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Challenges <ArrowRight size={12} />
                </Link>
                <Link
                  to="/pilots"
                  className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-xs font-medium"
                >
                  Fund Pilot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </Layout>
  );
}
