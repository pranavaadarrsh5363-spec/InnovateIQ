import {
  Home, LayoutDashboard, Target, Brain, FileCheck2, FileText,
  Search, Database, Cpu, TrendingUp, Layers, Network,
  FolderKanban, Flag, Activity, BarChart3, Users, Star,
  Building2, GraduationCap, Briefcase, ShieldCheck,
  MessageSquare, User, CheckSquare, Lightbulb, LucideIcon
} from 'lucide-react';

export interface NavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[];
  matchPrefix?: string;
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export function getPrimaryNavItems(activeProblemId: string): NavItemConfig[] {
  return [
    { to: '/dashboard', label: 'Overview', icon: Home, matchPrefix: '/dashboard' },
    { to: '/problems', label: 'Problems', icon: Target, matchPrefix: '/problems' },
    { to: `/problems/${activeProblemId}/analyze`, label: 'Intelligence', icon: Brain, matchPrefix: `/problems/${activeProblemId}/analyze` },
    { to: `/solutions?problemId=${activeProblemId}`, label: 'Solutions', icon: Lightbulb, matchPrefix: '/solutions' },
    { to: `/evidence?problemId=${activeProblemId}`, label: 'Evidence', icon: FileCheck2, matchPrefix: '/evidence' },
    { to: '/projects', label: 'Projects', icon: FolderKanban, matchPrefix: '/projects' },
    { to: `/impact?problemId=${activeProblemId}`, label: 'Impact', icon: Activity, matchPrefix: '/impact' },
  ];
}

export function getMobileBottomNavItems(activeProblemId: string): NavItemConfig[] {
  return [
    { to: '/dashboard', label: 'Home', icon: Home, matchPrefix: '/dashboard' },
    { to: '/problems', label: 'Problems', icon: Target, matchPrefix: '/problems' },
    { to: `/solutions?problemId=${activeProblemId}`, label: 'Solutions', icon: Lightbulb, matchPrefix: '/solutions' },
    { to: '/projects', label: 'Projects', icon: FolderKanban, matchPrefix: '/projects' },
    { to: `/impact?problemId=${activeProblemId}`, label: 'Impact', icon: Activity, matchPrefix: '/impact' },
  ];
}

export function getMoreSections(activeProblemId: string, role: string = 'student'): NavSectionConfig[] {
  return [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { to: `/problems/${activeProblemId}/decision-brief`, icon: FileText, label: 'AI Decision Brief' },
        { to: `/solutions?problemId=${activeProblemId}`, icon: Lightbulb, label: 'Solution Studio' },
        { to: `/similarity-checker?problemId=${activeProblemId}`, icon: Search, label: 'Prior Art & Gaps' },
      ],
    },
    ...(role === 'student' ? [
      {
        title: 'RESOURCES & TECH',
        items: [
          { to: `/resources?problemId=${activeProblemId}`, icon: Database, label: 'Resource Center' },
          { to: `/tech-recommendations?problemId=${activeProblemId}`, icon: Cpu, label: 'Tech Decision Matrix' },
          { to: `/skill-gap?problemId=${activeProblemId}`, icon: TrendingUp, label: 'Skill Intelligence' },
          { to: '/learning', icon: Layers, label: 'Learning Roadmaps' },
          { to: '/knowledge-graph', icon: Network, label: 'Knowledge Graph' },
        ],
      },
    ] : []),
    {
      title: 'EXECUTION & OPERATIONS',
      items: [
        { to: `/pilots?problemId=${activeProblemId}`, icon: Flag, label: 'Pilot Programs', badge: 'Field Trials' },
        { to: `/actions?problemId=${activeProblemId}`, icon: CheckSquare, label: 'Operational Actions' },
        ...(role === 'student' ? [
          { to: `/team?problemId=${activeProblemId}`, icon: Users, label: 'Team Matching' },
          { to: `/mentors?problemId=${activeProblemId}`, icon: Star, label: 'Expert Mentors' },
        ] : []),
      ],
    },
    {
      title: 'ENTERPRISE & GOVERNANCE',
      items: [
        { to: '/organizations', icon: Building2, label: 'Organization Directory' },
        ...(role === 'admin' ? [
          { to: '/organization/dashboard', icon: Building2, label: 'Government & Org' },
        ] : []),
        ...(role === 'admin' || role === 'mentor' ? [
          { to: '/university/dashboard', icon: GraduationCap, label: 'University Incubator' },
        ] : []),
        ...(role === 'admin' ? [
          { to: '/industry/dashboard', icon: Briefcase, label: 'Industry Partner' },
        ] : []),
        ...(role === 'admin' || role === 'mentor' ? [
          { to: '/audit', icon: ShieldCheck, label: 'Audit Trail' },
        ] : []),
        { to: '/innoai', icon: MessageSquare, label: 'InnoIQ Assistant' },
      ],
    },
  ];
}
