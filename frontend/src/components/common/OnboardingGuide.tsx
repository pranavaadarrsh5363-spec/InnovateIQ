import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, ArrowRight, Sparkles, Building2,
  FileQuestion, Database, Brain, Layers, Rocket, Cpu,
  TrendingUp, ChevronRight, X
} from 'lucide-react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  route: string;
  ctaText: string;
  icon: React.ElementType;
  completed: boolean;
}

interface OnboardingGuideProps {
  organizationName?: string;
  hasProblems?: boolean;
  hasEvidence?: boolean;
  hasSolutions?: boolean;
  hasPilots?: boolean;
  hasDevices?: boolean;
  hasTelemetry?: boolean;
  hasImpact?: boolean;
}

export default function OnboardingGuide({
  organizationName = 'InnovateIQ Workspace',
  hasProblems = false,
  hasEvidence = true,
  hasSolutions = false,
  hasPilots = false,
  hasDevices = false,
  hasTelemetry = false,
  hasImpact = false,
}: OnboardingGuideProps) {
  const [collapsed, setCollapsed] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'step-1',
      title: '1. Problem Intelligence',
      description: 'Publish or select a high-impact regional challenge across 18 national domains.',
      route: '/problems',
      ctaText: 'Explore Problems',
      icon: FileQuestion,
      completed: hasProblems,
    },
    {
      id: 'step-2',
      title: '2. Ground-Truth Evidence',
      description: 'Accredit evidence citations from IEEE, PubMed, Patents & OpenAlex repositories.',
      route: '/evidence',
      ctaText: 'Evidence Center',
      icon: Database,
      completed: hasEvidence,
    },
    {
      id: 'step-3',
      title: '3. AI Feasibility Brief',
      description: 'Run 6-dimension algorithmic feasibility analysis and risk breakdown.',
      route: '/problems/prob-water-01/analyze',
      ctaText: 'Analyze Feasibility',
      icon: Brain,
      completed: hasProblems,
    },
    {
      id: 'step-4',
      title: '4. Candidate Solutions',
      description: 'Register engineering solutions and run multi-candidate trade-off comparisons.',
      route: '/solutions',
      ctaText: 'Solutions Matrix',
      icon: Layers,
      completed: hasSolutions,
    },
    {
      id: 'step-5',
      title: '5. Field Pilot Deployment',
      description: 'Establish on-ground testbed with community cohort and target success metrics.',
      route: '/pilots',
      ctaText: 'Deploy Pilot',
      icon: Rocket,
      completed: hasPilots,
    },
    {
      id: 'step-6',
      title: '6. Hardware Node Registry',
      description: 'Provision physical IoT sensor nodes (ESP32/LoRaWAN/4G) and define bounds.',
      route: '/pilots',
      ctaText: 'Register Nodes',
      icon: Cpu,
      completed: hasDevices,
    },
    {
      id: 'step-7',
      title: '7. Telemetry & Anomaly Alerts',
      description: 'Ingest real sensor readings and automated BIS IS 10500 compliance checks.',
      route: '/pilots',
      ctaText: 'Live Telemetry',
      icon: TrendingUp,
      completed: hasTelemetry,
    },
    {
      id: 'step-8',
      title: '8. Verifiable Field Impact',
      description: 'Calculate baseline vs pilot KPI improvements backed by cryptographic audit trail.',
      route: '/impact',
      ctaText: 'Measure Impact',
      icon: CheckCircle2,
      completed: hasImpact,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (collapsed) {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-3.5 border border-blue-800/60 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles size={16} className="text-blue-300" />
          <span className="text-xs font-bold">Innovation Readiness Onboarding:</span>
          <span className="text-xs text-blue-200">{completedCount} of {steps.length} milestones complete ({progressPercent}%)</span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
        >
          Expand Guide
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
              <Sparkles size={12} className="text-blue-600 dark:text-blue-400" />
              Onboarding Roadmap
            </span>
            <span className="text-xs text-slate-400 font-mono">[{organizationName}]</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
            End-to-End Innovation Verification Workflow
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Follow this 8-stage engineering process to take a raw problem from verified intelligence to field deployment and measurable impact.
          </p>
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-400 hover:text-slate-600 p-1"
          title="Minimize Guide"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">Readiness Progress</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono">{progressPercent}% ({completedCount}/{steps.length} Milestones)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition flex flex-col justify-between space-y-2.5 ${
                step.completed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className={step.completed ? 'text-emerald-600' : 'text-blue-600'} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {step.title}
                    </span>
                  </div>
                  {step.completed ? (
                    <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle size={15} className="text-slate-300 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {step.description}
                </p>
              </div>

              <Link
                to={step.route}
                className={`inline-flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                  step.completed
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                <span>{step.ctaText}</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
