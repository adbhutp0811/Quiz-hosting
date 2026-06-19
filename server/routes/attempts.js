import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Submit attempt
router.post('/', authenticate, (req, res) => {
  const quizId = Number(req.body.quiz_id);
  const { answers, time_taken } = req.body;
  const userId = Number(req.user.id);

  if (!Number.isInteger(quizId) || !Number.isInteger(userId)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const quiz = db.prepare('SELECT id FROM quizzes WHERE id=? AND is_published=1').get(quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const existing = db.prepare(
    'SELECT id FROM attempts WHERE quiz_id=? AND user_id=? LIMIT 1'
  ).get(quizId, userId);
  if (existing) {
    return res.status(409).json({ error: 'You have already attempted this quiz.' });
  }

  const questions = db.prepare(
    'SELECT * FROM questions WHERE quiz_id=? ORDER BY order_num'
  ).all(quizId);

  let score = 0;
  const reviewed = questions.map((q, i) => {
    const userAnswer = answers[i] || null;
    const correct = userAnswer === q.correct;
    if (correct) score++;
    return {
      question: q.question,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      correct: q.correct,
      userAnswer,
      isCorrect: correct,
      explanation: q.explanation
    };
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const result = db.prepare(`
    INSERT INTO attempts (quiz_id, user_id, score, total, percentage, time_taken, answers)
    VALUES (?,?,?,?,?,?,?)
  `).run(quizId, userId, score, total, percentage, time_taken||0, JSON.stringify(reviewed));

  res.json({ id: result.lastInsertRowid, score, total, percentage, answers: reviewed });
});

// Get attempt result
router.get('/:id', authenticate, (req, res) => {
  const attempt = db.prepare(`
    SELECT a.*, q.title as quiz_title, q.category, q.difficulty
    FROM attempts a JOIN quizzes q ON a.quiz_id=q.id
    WHERE a.id=? AND a.user_id=?
  `).get(req.params.id, req.user.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  attempt.answers = JSON.parse(attempt.answers);
  res.json(attempt);
});

// Get my attempts
router.get('/my', authenticate, (req, res) => {
  const attempts = db.prepare(`
    SELECT a.id, a.quiz_id, a.score, a.total, a.percentage, a.completed_at,
           q.title as quiz_title, q.category, q.difficulty
    FROM attempts a JOIN quizzes q ON a.quiz_id=q.id
    WHERE a.user_id=?
    ORDER BY a.completed_at DESC
  `).all(req.user.id);
  res.json(attempts);
});

router.get('/my/all', authenticate, (req, res) => {
  const attempts = db.prepare(`
    SELECT a.id, a.quiz_id, a.score, a.total, a.percentage, a.completed_at,
           q.title as quiz_title, q.category, q.difficulty
    FROM attempts a JOIN quizzes q ON a.quiz_id=q.id
    WHERE a.user_id=?
    ORDER BY a.completed_at DESC
  `).all(req.user.id);
  res.json(attempts);
});

export default router;
