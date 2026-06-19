import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const totalUsers    = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const totalQuizzes  = db.prepare("SELECT COUNT(*) as c FROM quizzes").get().c;
  const totalAttempts = db.prepare("SELECT COUNT(*) as c FROM attempts").get().c;
  const avgScore      = db.prepare("SELECT AVG(percentage) as avg FROM attempts").get().avg || 0;
  const recentAttempts = db.prepare(`
    SELECT a.id, a.score, a.total, a.percentage, a.completed_at,
           u.username, q.title as quiz_title
    FROM attempts a
    JOIN users u ON a.user_id=u.id
    JOIN quizzes q ON a.quiz_id=q.id
    ORDER BY a.completed_at DESC LIMIT 10
  `).all();
  const topQuizzes = db.prepare(`
    SELECT q.id, q.title, q.category, COUNT(a.id) as attempt_count,
           AVG(a.percentage) as avg_score
    FROM quizzes q LEFT JOIN attempts a ON q.id=a.quiz_id
    GROUP BY q.id ORDER BY attempt_count DESC LIMIT 5
  `).all();

  res.json({ totalUsers, totalQuizzes, totalAttempts, avgScore: Math.round(avgScore), recentAttempts, topQuizzes });
});

// All quizzes (admin view)
router.get('/quizzes', (req, res) => {
  const quizzes = db.prepare(`
    SELECT q.*, u.username as creator,
      (SELECT COUNT(*) FROM questions WHERE quiz_id=q.id) as question_count,
      (SELECT COUNT(*) FROM attempts WHERE quiz_id=q.id) as attempt_count
    FROM quizzes q JOIN users u ON q.created_by=u.id
    ORDER BY q.created_at DESC
  `).all();
  res.json(quizzes);
});

// All users
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.role, u.rollno, u.created_at,
      (SELECT COUNT(*) FROM quizzes WHERE created_by=u.id) as quizzes_created,
      (SELECT COUNT(*) FROM attempts WHERE user_id=u.id) as quizzes_taken
    FROM users u ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

// Create user
router.post('/users', (req, res) => {
  const { username, email, password, role, rollno } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  const existing = db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email, username);
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, email, password, role, rollno) VALUES (?,?,?,?,?)'
  ).run(username, email, hash, role === 'admin' ? 'admin' : 'user', rollno || '');
  res.json({ id: result.lastInsertRowid, message: 'User created' });
});

// Update user role
router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['admin','user'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  res.json({ message: 'Role updated' });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// All attempts
router.get('/attempts', (req, res) => {
  const attempts = db.prepare(`
    SELECT a.id, a.score, a.total, a.percentage, a.time_taken, a.completed_at,
           u.username, u.email, u.rollno, q.title as quiz_title, q.category
    FROM attempts a
    JOIN users u ON a.user_id=u.id
    JOIN quizzes q ON a.quiz_id=q.id
    ORDER BY a.completed_at DESC
  `).all();
  res.json(attempts);
});

// Export attempts as CSV
router.get('/attempts/export', (req, res) => {
  const attempts = db.prepare(`
    SELECT u.username, u.email, u.rollno, q.title as quiz_title,
           a.score, a.total, a.percentage, a.time_taken, a.completed_at
    FROM attempts a
    JOIN users u ON a.user_id=u.id
    JOIN quizzes q ON a.quiz_id=q.id
    ORDER BY a.completed_at DESC
  `).all();

  const header = 'Username,Email,Roll No,Quiz,Score,Total,Percentage,Result,Time Taken,Date';
  const rows = attempts.map(a => {
    const result = a.percentage >= 60 ? 'Pass' : 'Fail';
    const time = a.time_taken > 0 ? `${Math.floor(a.time_taken/60)}m ${a.time_taken%60}s` : '—';
    const date = new Date(a.completed_at).toLocaleString();
    const escape = v => `"${String(v).replace(/"/g, '""')}"`;
    return [escape(a.username), escape(a.email), escape(a.rollno||''), escape(a.quiz_title),
            a.score, a.total, a.percentage, result, escape(time), escape(date)].join(',');
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="quiz_results.csv"');
  res.send([header, ...rows].join('\n'));
});

export default router;
