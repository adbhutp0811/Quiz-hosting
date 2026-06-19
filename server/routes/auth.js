import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const normalizedRole = role === 'admin' ? 'admin' : 'user';
  const existing = db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email, username);
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (username, email, password, role) VALUES (?,?,?,?)"
  ).run(username, email, hash, normalizedRole);

  const user = { id: result.lastInsertRowid, username, email, role: normalizedRole };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!row || !bcrypt.compareSync(password, row.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const user = { id: row.id, username: row.username, email: row.email, role: row.role };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

router.get('/me', authenticate, (req, res) => {
  const row = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id=?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json(row);
});

export default router;
