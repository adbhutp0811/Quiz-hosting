import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: list published quizzes
router.get('/', (req, res) => {
  const { search, category, difficulty } = req.query;
  let sql = `
    SELECT q.*, u.username as creator,
      (SELECT COUNT(*) FROM questions WHERE quiz_id=q.id) as question_count,
      (SELECT COUNT(*) FROM attempts WHERE quiz_id=q.id) as attempt_count
    FROM quizzes q JOIN users u ON q.created_by=u.id
    WHERE q.is_published=1
  `;
  const params = [];
  if (search) { sql += ' AND (q.title LIKE ? OR q.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category && category !== 'All') { sql += ' AND q.category=?'; params.push(category); }
  if (difficulty && difficulty !== 'All') { sql += ' AND q.difficulty=?'; params.push(difficulty); }
  sql += ' ORDER BY q.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Public: get single quiz with questions (for taking)
router.get('/:id', (req, res) => {
  const quiz = db.prepare(`
    SELECT q.*, u.username as creator,
      (SELECT COUNT(*) FROM attempts WHERE quiz_id=q.id) as attempt_count
    FROM quizzes q JOIN users u ON q.created_by=u.id
    WHERE q.id=? AND q.is_published=1
  `).get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = db.prepare(
    'SELECT * FROM questions WHERE quiz_id=? ORDER BY order_num'
  ).all(req.params.id);
  res.json({ ...quiz, questions });
});

// Admin: get quiz with all details (including unpublished)
router.get('/:id/admin', authenticate, requireAdmin, (req, res) => {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id=?').get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = db.prepare(
    'SELECT * FROM questions WHERE quiz_id=? ORDER BY order_num'
  ).all(req.params.id);
  res.json({ ...quiz, questions });
});

// Admin: create quiz
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { title, description, category, difficulty, time_limit, is_published, questions } = req.body;
  if (!title || !questions || questions.length === 0)
    return res.status(400).json({ error: 'Title and at least one question are required' });

  const quizResult = db.prepare(`
    INSERT INTO quizzes (title, description, category, difficulty, time_limit, created_by, is_published)
    VALUES (?,?,?,?,?,?,?)
  `).run(title, description||'', category||'General', difficulty||'Medium',
         time_limit||0, req.user.id, is_published?1:0);

  const quizId = quizResult.lastInsertRowid;
  const insertQ = db.prepare(`
    INSERT INTO questions (quiz_id,question,option_a,option_b,option_c,option_d,correct,explanation,order_num)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);

  questions.forEach((q, i) => {
    insertQ.run(quizId, q.question, q.option_a, q.option_b, q.option_c, q.option_d,
                q.correct, q.explanation||'', i);
  });

  res.json({ id: quizId, message: 'Quiz created successfully' });
});

// Admin: update quiz
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const { title, description, category, difficulty, time_limit, is_published, questions } = req.body;
  const quiz = db.prepare('SELECT id FROM quizzes WHERE id=?').get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  db.prepare(`
    UPDATE quizzes SET title=?,description=?,category=?,difficulty=?,time_limit=?,
    is_published=?,updated_at=datetime('now') WHERE id=?
  `).run(title, description||'', category||'General', difficulty||'Medium',
         time_limit||0, is_published?1:0, req.params.id);

  db.prepare('DELETE FROM questions WHERE quiz_id=?').run(req.params.id);
  const insertQ = db.prepare(`
    INSERT INTO questions (quiz_id,question,option_a,option_b,option_c,option_d,correct,explanation,order_num)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  (questions||[]).forEach((q, i) => {
    insertQ.run(req.params.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d,
                q.correct, q.explanation||'', i);
  });

  res.json({ message: 'Quiz updated successfully' });
});

// Admin: delete quiz
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const quiz = db.prepare('SELECT id FROM quizzes WHERE id=?').get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  db.prepare('DELETE FROM quizzes WHERE id=?').run(req.params.id);
  res.json({ message: 'Quiz deleted successfully' });
});

// Admin: toggle publish
router.patch('/:id/publish', authenticate, requireAdmin, (req, res) => {
  const quiz = db.prepare('SELECT id, is_published FROM quizzes WHERE id=?').get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const newState = quiz.is_published ? 0 : 1;
  db.prepare("UPDATE quizzes SET is_published=?,updated_at=datetime('now') WHERE id=?")
    .run(newState, req.params.id);
  res.json({ is_published: newState });
});

export default router;
