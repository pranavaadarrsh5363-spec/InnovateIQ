export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  avatar?: string;
  createdAt: string;
  profile?: StudentProfile;
  domain?: string;
  university?: string;
  bio?: string;
  year?: number;
  skills?: string[];
}

export interface StudentProfile {
  university: string;
  year: number;
  domain: string;
  skills: string[];
  bio?: string;
  interests?: string[];
  availability?: string;
  githubUsername?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
}

export interface MentorProfile {
  title: string;
  organization: string;
  domains: string[];
  expertise: string[];
  experienceYears: number;
  bio: string;
  availability: 'Available' | 'Busy' | 'Limited';
  rating: number;
  totalMentees: number;
}

export interface Project {
  id: string;
  problemId?: string;
  studentId: string;
  title: string;
  problemStatement: string;
  description: string;
  domain: string;
  status: 'idea' | 'research' | 'planning' | 'prototype' | 'testing' | 'deployment';
  progress: number;
  technologies: string[];
  objectives: string[];
  targetUsers: string;
  hardwareRequirements?: string[];
  softwareRequirements?: string[];
  datasetRequirements?: string[];
  requiredSkills?: string[];
  teamRoles?: string[];
  expectedImpact?: string;
  challenges?: string[];
  risks?: string[];
  futureEnhancements?: string[];
  tasks: Task[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  description: string;
  source: string;
  relevanceScore: number;
  technology: string;
  tags: string[];
  whyUseful: string;
  link: string;
  domain: string;
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  supportingResources: string[];
  domain: string;
  createdAt: string;
  sources?: SourceEvidence[];
}

export interface SourceEvidence {
  sourceType: 'Research Paper' | 'Dataset' | 'Technical Documentation' | 'Open Source Project' | 'Industry Report';
  sourceName: string;
  publicationDate: string;
  link: string;
  whySupports: string;
}

export interface SavedResource {
  id: string;
  studentId: string;
  resourceId: string;
  savedAt: string;
  notes?: string;
  resource?: Resource;
}

export interface MentorFeedback {
  id: string;
  projectId: string;
  mentorId: string;
  studentId: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface StudentSkill {
  studentId: string;
  skillId: string;
  skillName: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface ProjectBlueprint {
  id: string;
  studentId: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  objectives: string[];
  targetUsers: string;
  requiredTechnologies: string[];
  requiredHardware: string[];
  requiredSoftware: string[];
  requiredDatasets: string[];
  requiredSkills: string[];
  suggestedTeamRoles: string[];
  developmentRoadmap: { phase: string; title: string; duration: string; description: string; deliverables: string[] }[];
  implementationApproach: string;
  expectedImpact: string;
  challenges: string[];
  risks: string[];
  futureEnhancements: string[];
  domain: string;
  createdAt: string;
  isConvertedToProject?: boolean;
}

export interface SimilarSolution {
  id: string;
  name: string;
  similarityPercentage: number;
  description: string;
  technologies: string[];
  source: string;
  whatIsSimilar: string;
  whatIsDifferent: string;
  limitations: string;
}

export interface InnovationGap {
  id: string;
  opportunity: string;
  existingSolutionName: string;
  limitation: string;
  reason: string;
  potentialImpact: 'High' | 'Medium' | 'Transformative';
  requiredTechnology: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  publishedYear: number;
  venue: string;
  domain: string;
  abstract: string;
  problem: string;
  methodology: string;
  technologies: string[];
  datasets: string[];
  results: string;
  limitations: string[];
  futureWork: string;
  keyFindings: string[];
  importantReferences: string[];
  simpleExplanation: string;
  pdfUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'scenario';
  options: string[];
  correctAnswer: number | boolean;
  explanation: string;
  topic: string;
}

export interface Quiz {
  id: string;
  title: string;
  sourceDocument: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  domain: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; selectedAnswer: any; isCorrect: boolean }[];
  topicPerformance: { topic: string; correct: number; total: number }[];
  recommendedAreas: string[];
  attemptedAt: string;
}

export interface LearningRoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
  resourceTitle: string;
  resourceLink: string;
  resourceType: 'Video' | 'Course' | 'Documentation' | 'Interactive Tutorial';
  practiceActivity: string;
  quizCheckpointTopic: string;
  durationHours: number;
  completed?: boolean;
}

export interface LearningRoadmap {
  id: string;
  studentId: string;
  skillName: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'intermediate' | 'advanced';
  gapSeverity: 'low' | 'medium' | 'high';
  priority: 'High' | 'Medium' | 'Low';
  steps: LearningRoadmapStep[];
  progress: number;
  createdAt: string;
}

export interface TeamCandidate {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  domain: string;
  matchingSkills: string[];
  missingSkills?: string[];
  skillAlignmentPercentage: number;
  matchReason: string;
  availability: string;
  invited?: boolean;
}

export interface MentorCandidate {
  id: string;
  name: string;
  avatar?: string;
  organization: string;
  title: string;
  expertise: string[];
  relevantDomains: string[];
  experienceYears: number;
  availability: 'Available' | 'Busy' | 'Limited';
  rating: number;
  alignmentReason: string;
  requested?: boolean;
}

export interface InnovationChallenge {
  id: string;
  title: string;
  organization: string;
  organizationType: 'Government' | 'Industry' | 'University' | 'NGO' | 'Research Organization' | 'Hackathon';
  domain: string;
  description: string;
  problemStatement: string;
  requiredSkills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  deadline: string;
  participantsCount: number;
  prizeOrIncentive?: string;
  status: 'Open' | 'Upcoming' | 'Evaluating';
  resources: { name: string; link: string }[];
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'Student' | 'Project' | 'Technology' | 'Research' | 'Dataset' | 'Resource' | 'Skill' | 'Mentor';
  description?: string;
  details?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface ProjectFeasibilityReport {
  overallScore: number;
  technicalFeasibility: { rating: 'High' | 'Medium' | 'Low'; score: number; explanation: string };
  resourceAvailability: { rating: 'High' | 'Medium' | 'Low'; score: number; explanation: string };
  skillReadiness: { rating: 'High' | 'Medium' | 'Low'; score: number; explanation: string };
  costFeasibility: { rating: 'High' | 'Medium' | 'Low'; score: number; explanation: string };
  scalability: { rating: 'High' | 'Medium' | 'Low'; score: number; explanation: string };
  deploymentComplexity: { rating: 'High' | 'Medium' | 'Low'; score: number; explanation: string };
  keyRecommendations: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
  disclaimer: string;
}

export interface CostItem {
  id: string;
  category: 'Hardware' | 'Sensors' | 'Microcontrollers' | 'Cloud Services' | 'APIs' | 'Hosting' | 'Software' | 'Other';
  name: string;
  quantity: number;
  estimatedCostINR: number;
  costType: 'One-Time' | 'Monthly' | 'Annual';
  notes?: string;
}

export interface ProjectCostEstimate {
  items: CostItem[];
  estimatedPrototypeCostINR: number;
  estimatedMonthlyCostINR: number;
  estimatedDeploymentCostINR: number;
  currency: 'INR (₹)';
  isApproximateDisclaimer: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'resource_found' | 'skill_gap' | 'milestone_approach' | 'mentor_feedback' | 'team_invite' | 'challenge_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface StudentPortfolio {
  student: User;
  summary: string;
  isPublic: boolean;
  projects: Project[];
  skills: { name: string; level: string; endorsementsCount: number }[];
  completedChallenges: string[];
  certifications: { title: string; issuer: string; date: string }[];
  achievements: string[];
  githubRepositories: GitHubRepoSummary[];
  interests: string[];
}

export interface GitHubRepoSummary {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  techStack: string[];
  recentCommitsCount: number;
  openIssuesCount: number;
  readmeSummary: string;
  aiCodeReview?: {
    strengths: string[];
    improvements: string[];
    missingComponents: string[];
    architectureSuggestions: string[];
  };
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  resourcesDiscovered: number;
  aiInsightsGenerated: number;
  savedResources: number;
  mentorFeedback: number;
  skillGapsCount?: number;
  activityTimeline: { date: string; resources: number; insights: number; ideas: number }[];
  domainDistribution: { domain: string; count: number }[];
  recentInsights: AIInsight[];
  notifications?: NotificationItem[];
}

export interface IdeaAnalysisResult {
  problemUnderstanding: string;
  keyChallenges: string[];
  recommendedTechnologies: any[];
  requiredSkills: string[];
  requiredHardware: string[];
  requiredSoftware: string[];
  requiredDatasets: any[];
  researchAreas: string[];
  similarSolutions: any[];
  relevantAPIs: any[];
  openSourceTools: string[];
  learningResources: any[];
  implementationApproach: string;
  innovationOpportunities: string[];
  potentialRisks: string[];
  nextSteps: string[];
}

export interface TechRecommendation {
  name: string;
  reason: string;
  category: string;
  advantages?: string[];
  alternatives?: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance?: number;
}

export interface SkillGapItem {
  skill: string;
  current: 'beginner' | 'intermediate' | 'advanced';
  required: 'beginner' | 'intermediate' | 'advanced';
  gap: 'low' | 'medium' | 'high';
  priority?: 'High' | 'Medium' | 'Low';
  reason: string;
  learningResource: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ==========================================
// InnovateIQ Enterprise Platform Models
// ==========================================

export interface Problem {
  id: string;
  title: string;
  description: string;
  organization: string;
  organizationType: 'Government' | 'Research Institution' | 'University' | 'Industry' | 'NGO' | 'Community';
  location: string;
  domain: string;
  targetPopulation: string;
  currentSituation: string;
  expectedOutcome: string;
  constraints: string[];
  availableResources: string[];
  requiredSkills: string[];
  priority: 'Critical' | 'High' | 'Medium' | 'Standard';
  status: 'Open for Innovation' | 'Active Pilots' | 'Under Review' | 'Solved';
  submissionDeadline: string;
  postedDate: string;
  sourceQuality?: 'High' | 'Medium' | 'Low';
  verifiedSource?: boolean;
}

export interface RootCauseNode {
  id: string;
  text: string;
  type: 'root_cause' | 'contributing_factor' | 'symptom' | 'constraint';
  description?: string;
  children?: RootCauseNode[];
}

export interface StakeholderMapItem {
  id: string;
  role: string;
  category: 'Citizens' | 'Government' | 'Students' | 'Researchers' | 'Industry' | 'NGOs' | 'Healthcare Workers' | 'Local Authorities' | 'Educational Institutions';
  need: string;
  painPoint: string;
  expectedBenefit: string;
  interaction: string;
}

export interface ProblemAnalysis {
  id: string;
  problemId: string;
  problemSummary: string;
  rootCauses: RootCauseNode[];
  stakeholders: StakeholderMapItem[];
  targetPopulationBreakdown: string;
  currentSolutionsOverview: string;
  technologyGaps: string[];
  resourceGaps: string[];
  skillRequirements: string[];
  infrastructureConstraints: string[];
  potentialRisks: { risk: string; severity: 'High' | 'Medium' | 'Low'; mitigation: string }[];
  potentialInterventions: { title: string; description: string; complexity: 'Low' | 'Medium' | 'High'; timeframe: string }[];
  successMetrics: { metric: string; target: string; timeframe: string }[];
  generatedAt: string;
}

export interface SourceQualityScore {
  authority: 'High' | 'Medium' | 'Low' | number;
  recency: 'High' | 'Medium' | 'Low' | number;
  relevance: 'High' | 'Medium' | 'Low' | number;
  completeness: 'High' | 'Medium' | 'Low' | number;
  rating?: 'High' | 'Medium' | 'Low';
  compositeScore?: number;
  rationale?: string;
}

export interface EvidenceItem {
  id: string;
  problemId?: string;
  title: string;
  insight?: string;
  evidenceSummary?: string;
  summary?: string;
  sourceName?: string;
  publisher?: string;
  sourceType?: string;
  publicationDate?: string;
  publishedDate?: string;
  sourceUrl: string;
  confidenceLevel?: 'High' | 'Medium' | 'Low';
  sourceQuality?: SourceQualityScore;
  qualityScore?: SourceQualityScore;
  verified?: boolean;
  isMockData?: boolean;
}

export interface SourceConnector {
  id: string;
  name: string;
  type: 'Government' | 'Academic' | 'Datasets' | 'Code' | 'APIs';
  endpoint: string;
  status: 'Connected' | 'Demo Simulation' | 'Available';
  lastSynced: string;
  recordsCount: number;
  recordCount?: number;
  isMock?: boolean;
  dataClassification: 'Real Data' | 'Mock Data' | 'AI Generated';
}

export interface ExistingSolution {
  id: string;
  problemId: string;
  name: string;
  category: string;
  description: string;
  technology: string[];
  targetUsers: string;
  advantages: string[];
  limitations: string[];
  evidenceReference?: string;
  sourceUrl?: string;
}

export interface InnovationGapHypothesis {
  id: string;
  problemId: string;
  category: string;
  existingSolutionRef?: string;
  identifiedLimitation?: string;
  unmetNeed?: string;
  opportunityHypothesis?: string;
  difficultyRating?: 'Low' | 'Medium' | 'High';
  potentialImpactScore?: number;
  label?: string;
}

export interface TechnologyTradeoff {
  technology: string;
  category?: string;
  costRating?: 'Low' | 'Medium' | 'High';
  complexityRating?: 'Low' | 'Medium' | 'High';
  scalabilityRating?: 'Low' | 'Medium' | 'High';
  offlineCapability?: 'Native' | 'Limited' | 'None' | string;
  ecosystemMaturity?: 'Established' | 'Growing' | 'Experimental';
  tradeOffAnalysis?: string;
  recommendedUseCases?: string;
}

export interface FeasibilityDimension {
  rating: 'High' | 'Medium' | 'Low';
  score: number;
  explanation: string;
}

export interface DecisionBrief {
  id: string;
  problemId: string;
  generatedAt: string;
  problem: {
    id: string;
    title: string;
    domain: string;
    organization: string;
    organizationType: string;
    location: string;
    targetPopulation: string;
    priority: string;
    status: string;
    currentSituation: string;
    expectedOutcome: string;
    constraints: string[];
  };
  rootCausesSummary: {
    coreRootCause: string;
    contributingFactors: string[];
    symptoms: string[];
    constraints: string[];
  };
  evidenceSummary: {
    totalSources: number;
    verifiedSourcesCount: number;
    topCitations: {
      title: string;
      sourceName: string;
      sourceType: string;
      publicationDate: string;
      sourceUrl: string;
      qualityRating: 'High' | 'Medium' | 'Low';
      keyInsight: string;
    }[];
  };
  existingSolutionsSummary: {
    name: string;
    category: string;
    advantages: string[];
    limitations: string[];
  }[];
  innovationGaps: {
    category: string;
    unmetNeed: string;
    opportunityHypothesis: string;
    impactScore: number;
  }[];
  recommendedIntervention: {
    title: string;
    description: string;
    complexity: 'Low' | 'Medium' | 'High';
    timeframe: string;
    targetBeneficiaries: string;
    expectedKPI: string;
  };
  technologyOptions: TechnologyTradeoff[];
  skillRequirements: string[];
  feasibility: {
    technical: FeasibilityDimension;
    financial: FeasibilityDimension;
    infrastructure: FeasibilityDimension;
    operational: FeasibilityDimension;
    scalability: FeasibilityDimension;
    dataAvailability: FeasibilityDimension;
    overallScore: number;
  };
  risksAndMitigations: {
    risk: string;
    severity: 'High' | 'Medium' | 'Low';
    mitigation: string;
  }[];
  suggestedNextActions: {
    step: number;
    action: string;
    timeline: string;
    ownerRole: string;
  }[];
}

export interface PilotIssue {
  id?: string;
  reportedAt?: string;
  loggedAt?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'Low' | 'Medium' | 'High' | string;
  description: string;
  resolved?: boolean;
  status?: string;
  resolutionNotes?: string;
}

export interface PilotFeedback {
  id?: string;
  authorRole?: string;
  role?: string;
  authorName?: string;
  feedback?: string;
  content?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | string;
  rating?: number;
  submittedAt?: string;
}

export interface PilotProgram {
  id: string;
  projectId?: string;
  problemId?: string;
  title?: string;
  name?: string;
  organization?: string;
  partnerOrganization?: string;
  location: string;
  participantsCount?: number;
  cohortSize?: string | number;
  startDate: string;
  endDate: string;
  status: string;
  objectives?: string[];
  successCriteria?: string[];
  description?: string;
  kpis?: { name: string; target: string; current: string }[];
  reportedIssues?: PilotIssue[];
  issues?: PilotIssue[];
  feedbackList?: PilotFeedback[];
  feedback?: PilotFeedback[];
  resultsSummary?: string;
  isDemoData?: boolean;
}

export interface ImpactKPI {
  id: string;
  projectId?: string;
  problemId?: string;
  metricName?: string;
  title?: string;
  category?: string;
  direction?: 'increase' | 'decrease';
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercent: number;
  sourceOfTruth?: string;
  measurementFrequency?: string;
  lastUpdated?: string;
  verifiedDate?: string;
  isDemoData?: boolean;
}

export interface FeedbackLoopItem {
  id?: string;
  projectId?: string;
  problemId?: string;
  cycleNumber: number;
  phase?: string;
  date?: string;
  recordedAt?: string;
  observation?: string;
  finding?: string;
  suggestedAction?: string;
  decision?: string;
  updatedTarget?: string;
  status?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'Problem Created' | 'Resource Added' | 'AI Analysis Generated' | 'Project Created' | 'Mentor Assigned' | 'Pilot Started' | 'Impact Updated';
  timestamp: string;
  entityType: 'Problem' | 'Project' | 'Resource' | 'Pilot' | 'Mentor' | 'Analysis' | 'Evidence';
  entityId: string;
  details: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  type: 'Government Ministry' | 'University Incubation Cell' | 'Research Lab' | 'Industry Enterprise' | 'NGO';
  location: string;
  activeProblemsCount: number;
  sponsoredPilotsCount: number;
  totalMenteesSupported: number;
  contactEmail: string;
  description: string;
  logoUrl?: string;
}
