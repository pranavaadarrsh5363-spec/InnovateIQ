import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { QuizAttempt } from '../types';

const router = Router();

// POST /api/quizzes/generate
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { documentTitle, difficulty = 'Medium', count = 5 } = req.body;
    const quiz = await aiService.generateQuiz(documentTitle || 'Research Document', difficulty, Number(count));
    db.quizzes.push(quiz);
    return res.json(quiz);
  } catch (err: any) {
    return res.status(500).json({ message: 'Quiz generation failed' });
  }
});

// GET /api/quizzes/:id
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const quiz = db.quizzes.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  return res.json(quiz);
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', authenticateToken, (req: Request, res: Response) => {
  const quiz = db.quizzes.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const { answers } = req.body; // array of { questionId, selectedAnswer }
  let correctCount = 0;
  const topicMap: Record<string, { correct: number; total: number }> = {};
  const processedAnswers = [];

  for (const q of quiz.questions) {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total += 1;

    const userAns = answers?.find((a: any) => a.questionId === q.id);
    const isCorrect = userAns ? userAns.selectedAnswer === q.correctAnswer : false;

    if (isCorrect) {
      correctCount += 1;
      topicMap[q.topic].correct += 1;
    }

    processedAnswers.push({
      questionId: q.id,
      selectedAnswer: userAns?.selectedAnswer,
      isCorrect,
    });
  }

  const topicPerformance = Object.entries(topicMap).map(([topic, stats]) => ({
    topic,
    correct: stats.correct,
    total: stats.total,
  }));

  const recommendedAreas = topicPerformance
    .filter(t => t.correct / t.total < 0.7)
    .map(t => t.topic);

  const attempt: QuizAttempt = {
    id: `attempt-${Date.now()}`,
    quizId: quiz.id,
    studentId: req.user?.id || 'student-1',
    score: correctCount,
    totalQuestions: quiz.questions.length,
    answers: processedAnswers,
    topicPerformance,
    recommendedAreas: recommendedAreas.length > 0 ? recommendedAreas : ['Advanced System Integration'],
    attemptedAt: new Date().toISOString(),
  };

  db.quizAttempts.push(attempt);
  return res.json(attempt);
});

// GET /api/quizzes/history
router.get('/history/attempts', authenticateToken, (req: Request, res: Response) => {
  const attempts = db.quizAttempts.filter(a => a.studentId === (req.user?.id || 'student-1'));
  return res.json(attempts);
});

export default router;
