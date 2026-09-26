import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, Award, BookOpen, Rocket, CheckCircle2,
  TrendingUp, BarChart3, ChevronRight, ArrowRight, Brain, Globe
} from 'lucide-react';
import Layout from '../../components/layout/Layout';

export default function UniversityDashboard() {
  const universityStats = {
    institutionName: 'Indian Institute of Technology (IIT) Delhi',
    activeCohort: 'AY 2025-26 Innovation Batch',
    studentInnovators: 142,
    facultyMentors: 28,
    activeProblemInterventions: 19,
    pilotsDeployed: 5,
    verifiedImpactKpis: 8
  };

  const activeProjects = [
    {
      title: 'Edge AI Spectrophotometry for Rural Water Fluoride Detection',
      team: 'Team JalShakti AI (4 Students)',
      domain: 'Water & Sanitation',
      mentor: 'Dr. Ramesh Sharma (Dept of Biochemical Engg)',
      stage: 'Field Pilot (Alwar, Rajasthan)',
      progress: 78
    },
    {
      title: 'Acoustic Drone Inspection for Rural Transmission Line Arcing',
      team: 'AeroGrid Innovators (3 Students)',
      domain: 'Energy',
      mentor: 'Prof. Ananya Sen (Dept of Electrical Engg)',
      stage: 'Prototype Testing',
      progress: 60
    },
    {
      title: 'Multimodal Triage Bot for Primary Health Centers',
      team: 'HealthPulse Labs (5 Students)',
      domain: 'Healthcare',
      mentor: 'Dr. V. K. Murthy (Biomedical Engg)',
      stage: 'Clinical Validation',
      progress: 85
    }
  ];

  return (
    <Layout title="University Council" subtitle="Academic research, faculty mentors & student cohort oversight">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
              <GraduationCap size={13} className="text-indigo-400" />
              University Innovation Council
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[ACADEMIC RESEARCH & INCUBATION]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Research & Student Cohort Oversight
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Institutional control deck for vice chancellors, department heads, and incubation managers. Track student deep-tech projects tackling verified national problems with industry and faculty mentorship.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-white text-sm sm:text-base">{universityStats.studentInnovators}</span>
              <span className="text-slate-400">Student Innovators</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-blue-400 text-sm sm:text-base">{universityStats.facultyMentors}</span>
              <span className="text-slate-400">Faculty Mentors</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-emerald-400 text-sm sm:text-base">{universityStats.pilotsDeployed}</span>
              <span className="text-slate-400">Field Pilots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Affiliated University:</span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{universityStats.institutionName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{universityStats.activeCohort} • Smart India Hackathon Aligned</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <Link
            to="/problems"
            className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Globe size={13} /> Assign Problems
          </Link>
          <Link
            to="/pilots"
            className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold whitespace-nowrap text-center"
          >
            Review Pilots
          </Link>
        </div>
      </div>

      {/* Active Academic Projects */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Rocket size={18} className="text-blue-600" />
          Active Student Deep-Tech Teams & Problem Interventions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeProjects.map((p, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {p.domain}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {p.title}
                </h4>
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <div><strong>Cohort:</strong> {p.team}</div>
                  <div><strong>Lead Faculty:</strong> {p.mentor}</div>
                  <div><strong>Status:</strong> <span className="text-emerald-600 font-semibold">{p.stage}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">TRL Progression</span>
                  <span className="font-bold text-blue-600">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </Layout>
  );
}
