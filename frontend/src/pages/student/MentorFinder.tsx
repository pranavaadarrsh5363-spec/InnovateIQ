import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { mentorsApi } from '../../services/api';
import { MentorCandidate } from '../../types';
import {
  Star, GraduationCap, Send, CheckCircle2, Clock,
  Award, Shield, ExternalLink, MessageSquare, ArrowRight
} from 'lucide-react';

export default function MentorFinder() {
  const [mentors, setMentors] = useState<MentorCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState<Record<string, boolean>>({});
  const [activeModalMentor, setActiveModalMentor] = useState<MentorCandidate | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    mentorsApi.match({ requirements: ['IoT', 'TinyML', 'Sensor Calibration', 'Clean Water'] })
      .then(res => setMentors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendRequest = async () => {
    if (!activeModalMentor) return;
    setSubmitting(true);
    try {
      await mentorsApi.request(activeModalMentor.id, 'proj-1', requestNote);
      setRequestedIds(prev => ({ ...prev, [activeModalMentor.id]: true }));
      setActiveModalMentor(null);
      setRequestNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="AI Mentor Matching"
      subtitle="Connect with seasoned scientists, industry architects, and hackathon grand jurors"
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Project-Aligned Mentorship Recommendations</h2>
            <p className="text-xs text-gray-500">
              Matched against your active project "AI-Based Water Quality Monitoring"
            </p>
          </div>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">
          Demo Advisory Panel • Non-fabricated mock profiles
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map(mentor => {
          const isRequested = requestedIds[mentor.id] || mentor.requested;

          return (
            <div
              key={mentor.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow object-cover flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{mentor.name}</h3>
                    <p className="text-[11px] text-blue-600 font-medium">{mentor.title}</p>
                    <p className="text-[11px] text-gray-400">{mentor.organization}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-2 px-3 bg-gray-50 rounded-xl mb-3">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star size={13} fill="currentColor" /> {mentor.rating}
                  </div>
                  <span className="text-gray-500">{mentor.experienceYears}+ years exp</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    mentor.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {mentor.availability}
                  </span>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl mb-3 text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-0.5">Why matched with your project:</span>
                  {mentor.alignmentReason}
                </div>

                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Core Expertise Areas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map(exp => (
                      <span key={exp} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                {isRequested ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 size={13} /> Request Submitted
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveModalMentor(mentor);
                      setRequestNote(`Hello ${mentor.name}, we are developing an AI-based water potability monitoring node for SIH 2024 and would greatly value your guidance on hardware calibration and TinyML model deployment.`);
                    }}
                    className="w-full py-2 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} /> Request Mentorship
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Modal */}
      {activeModalMentor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Request Mentorship</h3>
                <p className="text-xs text-gray-500">To {activeModalMentor.name} ({activeModalMentor.organization})</p>
              </div>
              <button onClick={() => setActiveModalMentor(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Project Collaboration Note
              </label>
              <textarea
                rows={4}
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setActiveModalMentor(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={submitting || !requestNote.trim()}
                className="px-5 py-2 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
