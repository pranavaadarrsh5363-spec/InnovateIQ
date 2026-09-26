import { Link, useLocation } from 'react-router-dom';
import {
  Globe, Brain, FileSearch, Search, Cpu, Layers, DollarSign,
  FolderKanban, Rocket, BarChart3, Network, ShieldCheck, ChevronRight, Sparkles
} from 'lucide-react';

const JOURNEY_STEPS = [
  { path: '/problems', label: '1. Problem Hub', icon: Globe },
  { path: '/problems/prob-water-01/analyze', label: '2. Problem Intelligence', icon: Brain },
  { path: '/evidence', label: '3. Evidence & Sources', icon: FileSearch },
  { path: '/similarity-checker', label: '4. Existing Solutions & Gaps', icon: Search },
  { path: '/tech-recommendations', label: '5. Tech Trade-offs', icon: Cpu },
  { path: '/resources', label: '6. Resources', icon: Layers },
  { path: '/feasibility', label: '7. Feasibility & Cost', icon: DollarSign },
  { path: '/projects', label: '8. Project Workspace', icon: FolderKanban },
  { path: '/pilots', label: '9. Pilot Deployments', icon: Rocket },
  { path: '/impact', label: '10. Measurable Impact', icon: BarChart3 },
  { path: '/knowledge-graph', label: '11. Knowledge Graph', icon: Network },
  { path: '/audit', label: '12. Audit & Governance', icon: ShieldCheck },
];

export default function InnovationJourneyBar() {
  const location = useLocation();

  return (
    <div className="w-full max-w-full bg-white border-b border-gray-100 px-3 sm:px-6 py-2 sm:py-2.5 shadow-sm overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Sparkles size={12} className="text-blue-600" />
          Journey:
        </span>
        {JOURNEY_STEPS.map((step, idx) => {
          const isActive = location.pathname === step.path;
          const Icon = step.icon;

          return (
            <div key={step.path} className="flex items-center">
              <Link
                to={step.path}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'gradient-bg text-white shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon size={12} />
                <span>{step.label}</span>
              </Link>
              {idx < JOURNEY_STEPS.length - 1 && (
                <ChevronRight size={12} className="text-gray-300 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
