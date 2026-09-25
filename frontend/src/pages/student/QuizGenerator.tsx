import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { quizzesApi } from '../../services/api';
import { Quiz, QuizAttempt } from '../../types';
import {
  HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight,
  Loader2, Award, BookOpen, RotateCcw, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_DOCS = [
  'Low-Cost IoT-Enabled Water Quality Telemetry with Edge Anomaly Detection',
  'Deep Transfer Learning for Real-Time Foliar Crop Pathogen Identification',
  'Bureau of Indian Standards BIS IS 10500:2012 Drinking Water Specification',
  'TinyML Microcontroller Deployment & Int8 Quantization Handbook',
];

export default function QuizGenerator() {
  const navigate = useNavigate();
  const [docTitle, setDocTitle] = useState(SAMPLE_DOCS[0]);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuiz(null);
    setAttemptResult(null);
    setUserAnswers({});

    try {
      const res = await quizzesApi.generate({ documentTitle: docTitle, difficulty, count });
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number | boolean) => {
    if (attemptResult) return; // Prevent changing after submit
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);

    const answersPayload = Object.entries(userAnswers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    try {
      const res = await quizzesApi.submit(quiz.id, answersPayload);
      setAttemptResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <Layout
      title="Document AI Quiz Generator"
      subtitle="Generate interactive assessments from research papers and notes to benchmark technical comprehension"
    >
      {/* Quiz Configurator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
            <HelpCircle size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Document-to-Quiz AI Engine</h2>
            <p className="text-xs text-gray-500">
              Select or upload a technical paper/manual, choose difficulty, and test your knowledge
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Source Document / Research Paper Title
              </label>
              <select
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                {SAMPLE_DOCS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Questions</label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 gradient-bg text-white text-xs font-bold rounded-xl shadow hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? 'Synthesizing Quiz...' : 'Generate AI Quiz'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Quiz Card */}
      {quiz && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {quiz.difficulty} Difficulty
                </span>
                <span className="text-xs text-gray-400">{quiz.domain}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{quiz.title}</h3>
            </div>

            {!attemptResult && (
              <div className="text-right text-xs">
                <span className="font-semibold text-blue-600">{answeredCount} of {quiz.questions.length} answered</span>
                <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all"
                    style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isSubmitted = !!attemptResult;
              const isCorrectAnswer = isSubmitted && selected === q.correctAnswer;
              const isWrongAnswer = isSubmitted && selected !== undefined && selected !== q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSubmitted
                      ? isCorrectAnswer
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-red-200 bg-red-50/20'
                      : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      Question {idx + 1} • {q.type === 'true_false' ? 'True / False' : q.type === 'scenario' ? 'Scenario Case' : 'Multiple Choice'}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">{q.topic}</span>
                  </div>

                  <p className="text-xs font-semibold text-gray-900 mb-3 leading-relaxed">{q.question}</p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === optIdx;
                      const isOptionCorrect = q.correctAnswer === optIdx;

                      let optClass = 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          optClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optClass = 'border-red-400 bg-red-50 text-red-900 line-through';
                        } else {
                          optClass = 'border-gray-100 bg-white/60 text-gray-400';
                        }
                      } else if (isOptionSelected) {
                        optClass = 'border-blue-500 bg-blue-50/80 text-blue-900 font-semibold shadow-sm';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${optClass}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSubmitted && isOptionCorrect && (
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                          )}
                          {isSubmitted && isOptionSelected && !isOptionCorrect && (
                            <XCircle size={14} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {isSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs">
                      <span className="font-bold text-blue-900 block mb-0.5">Explanation:</span>
                      <span className="text-blue-800 leading-relaxed">{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action or Scorecard */}
          {!attemptResult ? (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || answeredCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 gradient-bg text-white text-xs font-bold rounded-xl shadow hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Submit Quiz for Assessment
              </button>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl shadow-xl space-y-4 animate-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                    <Award size={16} className="text-amber-300" /> Assessment Report
                  </div>
                  <h4 className="text-2xl font-bold">
                    Score: {attemptResult.score} / {attemptResult.totalQuestions} ({Math.round((attemptResult.score / attemptResult.totalQuestions) * 100)}%)
                  </h4>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {attemptResult.score / attemptResult.totalQuestions >= 0.8
                      ? 'Outstanding comprehension of the technical literature!'
                      : 'Good initial attempt! Review the recommended learning topics below.'}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/learning')}
                  className="px-4 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-xs shadow hover:bg-blue-50 transition-all flex items-center gap-1.5"
                >
                  Open Learning Path <ArrowRight size={13} />
                </button>
              </div>

              {/* Topic Performance Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {attemptResult.topicPerformance.map(tp => (
                  <div key={tp.topic} className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-xs border border-white/10">
                    <span className="block text-blue-100 text-[11px] mb-1 truncate">{tp.topic}</span>
                    <span className="font-bold text-sm">
                      {tp.correct} / {tp.total} ({Math.round((tp.correct / tp.total) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              {attemptResult.recommendedAreas.length > 0 && (
                <div className="pt-2 text-xs border-t border-white/10">
                  <span className="font-semibold text-blue-200">Recommended Learning Focus: </span>
                  <span className="text-white">{attemptResult.recommendedAreas.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
