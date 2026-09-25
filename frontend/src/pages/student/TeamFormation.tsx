import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { teamApi } from '../../services/api';
import { TeamCandidate } from '../../types';
import {
  Users, Sparkles, Send, CheckCircle2, UserCheck,
  Search, Shield, Clock, BookOpen, ExternalLink, ArrowRight
} from 'lucide-react';

const POPULAR_SKILL_TAGS = ['IoT', 'Machine Learning', 'Computer Vision', 'React', 'FastAPI', 'Embedded C++', 'TinyML', 'UI/UX Design', 'Cloud DevOps'];

export default function TeamFormation() {
  const [candidates, setCandidates] = useState<TeamCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['IoT', 'Machine Learning', 'React', 'Embedded C++']);
  const [invitedIds, setInvitedIds] = useState<Record<string, boolean>>({});
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const fetchMatches = async (skills: string[]) => {
    setLoading(true);
    try {
      const res = await teamApi.match({ requirements: skills });
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedSkills);
  }, []);

  const handleToggleSkill = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    fetchMatches(updated);
  };

  const handleInvite = async (candidateId: string) => {
    setInvitingId(candidateId);
    try {
      await teamApi.invite(candidateId);
      setInvitedIds(prev => ({ ...prev, [candidateId]: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <Layout
      title="AI Team Formation"
      subtitle="Discover peer innovators with complementary skills aligned to your project requirements"
    >
      {/* Skill requirements filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Define Project Skill Needs</h2>
              <p className="text-xs text-gray-500">
                Matches are evaluated transparently on skill alignment and availability without arbitrary ranking
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {candidates.length} Candidate Peers Found
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {POPULAR_SKILL_TAGS.map(skill => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleToggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'gradient-bg text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {isSelected ? '✓ ' : '+ '} {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {candidates.map(candidate => {
          const isInvited = invitedIds[candidate.id] || candidate.invited;
          const isProcessing = invitingId === candidate.id;

          return (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{candidate.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{candidate.university}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {candidate.domain}
                      </span>
                    </div>
                  </div>

                  {/* Alignment badge */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-extrabold gradient-text">
                      {candidate.skillAlignmentPercentage}%
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium block">Skill Match</span>
                  </div>
                </div>

                {/* Match reason */}
                <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl mb-3 text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-800 block mb-0.5">Why this student matches:</span>
                  {candidate.matchReason}
                </div>

                {/* Skills breakdown */}
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Matching Expertise:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.matchingSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                    <Clock size={12} className="text-gray-400" />
                    <span>Availability: {candidate.availability}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-gray-100">
                {isInvited ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 size={13} /> Invitation Sent
                  </div>
                ) : (
                  <button
                    onClick={() => handleInvite(candidate.id)}
                    disabled={isProcessing}
                    className="w-full py-2 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={12} /> {isProcessing ? 'Sending Invitation...' : 'Invite to Project'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
