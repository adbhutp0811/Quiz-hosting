// Simple token-free auth using localStorage session
import { userDB } from './db.js';

const SESSION_KEY = 'qz_session';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return userDB.getById(userId);
  } catch {
    return null;
  }
}

export function loginUser(email, password) {
  const user = userDB.getByEmail(email);
  if (!user) throw new Error('Invalid email or password');
  if (user.password !== password) throw new Error('Invalid email or password');
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  return sanitize(user);
}

export function registerUser(username, email, password) {
  if (!username || !email || !password) throw new Error('All fields are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  const user = userDB.create({ username, email, password });
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  return sanitize(user);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function sanitize(user) {
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}
