import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { learningApi } from '../../services/api';
import { LearningRoadmap } from '../../types';
import {
  Compass, CheckCircle2, Circle, ArrowRight, ExternalLink,
  BookOpen, Sparkles, Loader2, Award, Clock, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_SKILLS = [
  { name: 'Sensor Calibration', current: 'beginner', target: 'advanced' },
  { name: 'TinyML', current: 'beginner', target: 'intermediate' },
  { name: 'MQTT & Low-Power Telemetry', current: 'intermediate', target: 'advanced' },
  { name: 'FastAPI Production Architecture', current: 'beginner', target: 'intermediate' },
];

export default function LearningRoadmapPage() {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(DEFAULT_SKILLS[0].name);

  useEffect(() => {
    learningApi.getRoadmaps().then(async res => {
      if (res.data.length === 0) {
        // Generate initial default roadmap
        const initial = await learningApi.generate({
          skillName: 'Sensor Calibration',
          currentLevel: 'beginner',
          targetLevel: 'advanced',
        });
        setRoadmaps([initial.data]);
        setActiveRoadmap(initial.data);
      } else {
        setRoadmaps(res.data);
        setActiveRoadmap(res.data[0]);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleGenerateNew = async (skill: { name: string; current: string; target: string }) => {
    setGenerating(true);
    try {
      const res = await learningApi.generate({
        skillName: skill.name,
        currentLevel: skill.current,
        targetLevel: skill.target,
      });
      setRoadmaps(prev => [res.data, ...prev]);
      setActiveRoadmap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepNumber: number) => {
    if (!activeRoadmap) return;
    try {
      const res = await learningApi.toggleStep(activeRoadmap.id, stepNumber);
      setActiveRoadmap(res.data);
      setRoadmaps(prev => prev.map(r => r.id === res.data.id ? res.data : r));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout
      title="Personalized Learning Roadmap"
      subtitle="Structured mastery pathways bridging your active project skill gaps"
    >
      {/* Visual Pipeline Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between overflow-x-auto gap-2 py-1 text-xs">
          {[
            { label: '1. Skill Gap Detected', icon: '🎯' },
            { label: '2. Curated Learning Resource', icon: '📚' },
            { label: '3. Hands-On Practice Task', icon: '⚡' },
            { label: '4. AI Quiz Assessment', icon: '📝' },
            { label: '5. Skill Improvement Verified', icon: '🏆' },
          ].map((stage, idx) => (
            <div key={stage.label} className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 font-bold text-blue-900 flex items-center gap-1.5">
                <span>{stage.icon}</span> {stage.label}
              </span>
              {idx < 4 && <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Skill Pathways Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <Compass size={14} className="text-blue-600" /> Active Learning Paths
            </h3>
          </div>

          <div className="space-y-2">
            {roadmaps.map(r => (
              <div
                key={r.id}
                onClick={() => setActiveRoadmap(r)}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                  activeRoadmap?.id === r.id
                    ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">{r.skillName}</span>
                  <span className="text-[10px] font-bold text-blue-600">{r.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full gradient-bg rounded-full" style={{ width: `${r.progress}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 capitalize">
                  {r.currentLevel} → {r.targetLevel}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Generate from Skill Gap:
            </span>
            {DEFAULT_SKILLS.filter(s => !roadmaps.some(r => r.skillName === s.name)).map(s => (
              <button
                key={s.name}
                onClick={() => handleGenerateNew(s)}
                disabled={generating}
                className="w-full text-left p-2 rounded-xl bg-gray-50 hover:bg-blue-50 text-[11px] font-medium text-gray-700 hover:text-blue-700 transition-colors flex items-center justify-between"
              >
                <span>+ {s.name}</span>
                <span className="text-[10px] text-gray-400">Generate</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 3 Columns: Active Learning Timeline */}
        {activeRoadmap && (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 uppercase">
                    Priority: {activeRoadmap.priority}
                  </span>
                  <span className="text-xs text-gray-400">
                    Target: {activeRoadmap.targetLevel}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{activeRoadmap.skillName} Mastery Pathway</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600">{activeRoadmap.progress}% Complete</span>
                  <div className="w-28 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${activeRoadmap.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stepped Timeline */}
            <div className="space-y-6 relative border-l-2 border-blue-100 ml-4 py-2">
              {activeRoadmap.steps.map((step) => {
                const isDone = !!step.completed;

                return (
                  <div key={step.stepNumber} className="relative pl-7">
                    {/* Step node icon */}
                    <button
                      onClick={() => handleToggleStep(step.stepNumber)}
                      className={`absolute -left-3 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        isDone
                          ? 'bg-emerald-600 text-white border-2 border-white'
                          : 'bg-white text-gray-400 border-2 border-blue-400 hover:border-blue-600'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : <Circle size={10} />}
                    </button>

                    <div className={`p-5 rounded-2xl border transition-all ${
                      isDone ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100 bg-gray-50/40 hover:border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Step {step.stepNumber} • {step.durationHours} Hours Allocated
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isDone ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-600 mb-4 leading-relaxed">{step.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* Learning Resource Card */}
                        <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              📖 Curated Learning Resource ({step.resourceType})
                            </span>
                            <span className="font-semibold text-gray-800 block mb-1">{step.resourceTitle}</span>
                          </div>
                          <a
                            href={step.resourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold pt-2"
                          >
                            Open Material <ExternalLink size={10} />
                          </a>
                        </div>

                        {/* Hands-On Practice Card */}
                        <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              ⚡ Hands-On Practice Activity
                            </span>
                            <span className="text-gray-700 leading-relaxed">{step.practiceActivity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quiz Checkpoint CTA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <HelpCircle size={14} className="text-blue-600" />
                          <span className="font-semibold text-blue-900">
                            Assessment Checkpoint: {step.quizCheckpointTopic}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/quizzes')}
                          className="px-3 py-1.5 gradient-bg text-white font-bold rounded-lg text-[11px] shadow hover:shadow-md flex items-center gap-1 self-start sm:self-auto"
                        >
                          Launch Checkpoint Quiz <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
