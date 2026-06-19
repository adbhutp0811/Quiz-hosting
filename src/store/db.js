// ─── localStorage-based database ───────────────────────────────────────────

const KEYS = {
  users:    'qz_users',
  quizzes:  'qz_quizzes',
  questions:'qz_questions',
  attempts: 'qz_attempts',
  seq:      'qz_seq',
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function nextId(table) {
  const seqs = read(KEYS.seq) || {};
  const id = (seqs[table] || 0) + 1;
  seqs[table] = id;
  write(KEYS.seq, seqs);
  return id;
}

// ─── Seed data ──────────────────────────────────────────────────────────────
function seed() {
  if (read(KEYS.users)) return; // already seeded

  const users = [
    { id: 1, username: 'admin', email: 'admin@quizly.com', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
    { id: 2, username: 'john_doe', email: 'john@example.com', password: 'user123', role: 'user', created_at: new Date().toISOString() },
    { id: 3, username: 'jane_doe', email: 'jane@example.com', password: 'user123', role: 'user', created_at: new Date().toISOString() },
  ];

  const quizzes = [
    { id: 1, title: 'JavaScript Fundamentals', description: 'Test your knowledge of core JavaScript concepts including variables, functions, and ES6+ features.', category: 'Programming', difficulty: 'Medium', time_limit: 15, created_by: 1, is_published: true, created_at: new Date().toISOString() },
    { id: 2, title: 'World Geography', description: 'Explore capitals, countries, and geographical facts from around the world.', category: 'Geography', difficulty: 'Easy', time_limit: 10, created_by: 1, is_published: true, created_at: new Date().toISOString() },
    { id: 3, title: 'Science & Technology', description: 'A challenging quiz covering physics, chemistry, biology, and modern technology.', category: 'Science', difficulty: 'Hard', time_limit: 20, created_by: 1, is_published: true, created_at: new Date().toISOString() },
  ];

  const questions = [
    // Quiz 1 – JS
    { id:1,  quiz_id:1, order_num:0, question:"What does typeof null return in JavaScript?",           option_a:"object",         option_b:"null",          option_c:"undefined",    option_d:"string",           correct:"A", explanation:"typeof null returns 'object' due to a legacy bug in JavaScript." },
    { id:2,  quiz_id:1, order_num:1, question:"Which method adds elements to the end of an array?",  option_a:"push()",         option_b:"append()",      option_c:"add()",        option_d:"insert()",         correct:"A", explanation:"The push() method adds one or more elements to the end of an array." },
    { id:3,  quiz_id:1, order_num:2, question:"What is the output of: 0.1 + 0.2 === 0.3?",           option_a:"false",          option_b:"true",          option_c:"undefined",    option_d:"NaN",              correct:"A", explanation:"Due to floating-point precision, 0.1 + 0.2 is not exactly 0.3." },
    { id:4,  quiz_id:1, order_num:3, question:"Which keyword declares a block-scoped variable?",     option_a:"let",            option_b:"var",           option_c:"int",          option_d:"define",           correct:"A", explanation:"The let keyword declares a block-scoped local variable." },
    { id:5,  quiz_id:1, order_num:4, question:"What does the => symbol represent?",                  option_a:"Arrow function", option_b:"Greater or eq", option_c:"Comparison",   option_d:"Assignment",       correct:"A", explanation:"The => symbol defines arrow functions introduced in ES6." },
    // Quiz 2 – Geography
    { id:6,  quiz_id:2, order_num:0, question:"What is the capital of Australia?",                    option_a:"Canberra",       option_b:"Sydney",        option_c:"Melbourne",    option_d:"Brisbane",         correct:"A", explanation:"Canberra is the capital city of Australia, not Sydney." },
    { id:7,  quiz_id:2, order_num:1, question:"Which is the longest river in the world?",             option_a:"Nile",           option_b:"Amazon",        option_c:"Yangtze",      option_d:"Mississippi",      correct:"A", explanation:"The Nile River in Africa is generally considered the longest." },
    { id:8,  quiz_id:2, order_num:2, question:"How many continents are there on Earth?",              option_a:"7",              option_b:"5",             option_c:"6",            option_d:"8",                correct:"A", explanation:"Earth has 7 continents." },
    { id:9,  quiz_id:2, order_num:3, question:"Which country has the largest land area?",             option_a:"Russia",         option_b:"Canada",        option_c:"China",        option_d:"USA",              correct:"A", explanation:"Russia is the largest country in the world by land area." },
    // Quiz 3 – Science
    { id:10, quiz_id:3, order_num:0, question:"What is the chemical symbol for Gold?",                option_a:"Au",             option_b:"Ag",            option_c:"Fe",           option_d:"Cu",               correct:"A", explanation:"Au comes from the Latin word Aurum meaning gold." },
    { id:11, quiz_id:3, order_num:1, question:"How many bones are in the adult human body?",         option_a:"206",            option_b:"208",           option_c:"204",          option_d:"210",              correct:"A", explanation:"An adult human body has 206 bones." },
    { id:12, quiz_id:3, order_num:2, question:"What is the approximate speed of light?",              option_a:"299,792 km/s",   option_b:"300,000 km/s",  option_c:"186,000 km/s", option_d:"150,000 km/s",     correct:"A", explanation:"The speed of light in vacuum is approximately 299,792 km/s." },
  ];

  write(KEYS.users,     users);
  write(KEYS.quizzes,   quizzes);
  write(KEYS.questions, questions);
  write(KEYS.attempts,  []);
  write(KEYS.seq,       { users: 3, quizzes: 3, questions: 12, attempts: 0 });
}

seed();

// ─── User API ────────────────────────────────────────────────────────────────
export const userDB = {
  getAll() { return read(KEYS.users) || []; },
  getById(id) { return this.getAll().find(u => u.id === Number(id)) || null; },
  getByEmail(email) { return this.getAll().find(u => u.email === email) || null; },
  create({ username, email, password }) {
    const users = this.getAll();
    if (users.find(u => u.email === email)) throw new Error('Email already taken');
    if (users.find(u => u.username === username)) throw new Error('Username already taken');
    const user = { id: nextId('users'), username, email, password, role: 'user', created_at: new Date().toISOString() };
    write(KEYS.users, [...users, user]);
    return user;
  },
  update(id, changes) {
    const users = this.getAll().map(u => u.id === Number(id) ? { ...u, ...changes } : u);
    write(KEYS.users, users);
    return this.getById(id);
  },
  delete(id) {
    write(KEYS.users, this.getAll().filter(u => u.id !== Number(id)));
  },
};

// ─── Quiz API ─────────────────────────────────────────────────────────────────
export const quizDB = {
  getAll() { return read(KEYS.quizzes) || []; },
  getById(id) { return this.getAll().find(q => q.id === Number(id)) || null; },
  getPublished(filters = {}) {
    let list = this.getAll().filter(q => q.is_published);
    if (filters.category && filters.category !== 'All') list = list.filter(q => q.category === filters.category);
    if (filters.difficulty && filters.difficulty !== 'All') list = list.filter(q => q.difficulty === filters.difficulty);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(q => q.title.toLowerCase().includes(s) || (q.description || '').toLowerCase().includes(s));
    }
    return list.map(q => ({
      ...q,
      question_count: questionDB.getByQuiz(q.id).length,
      attempt_count:  attemptDB.getByQuiz(q.id).length,
      creator: (userDB.getById(q.created_by) || {}).username || 'Admin',
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getAllWithMeta() {
    return this.getAll().map(q => ({
      ...q,
      question_count: questionDB.getByQuiz(q.id).length,
      attempt_count:  attemptDB.getByQuiz(q.id).length,
      creator: (userDB.getById(q.created_by) || {}).username || 'Admin',
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  create({ title, description, category, difficulty, time_limit, created_by, is_published }) {
    const quiz = {
      id: nextId('quizzes'), title, description: description || '',
      category: category || 'General', difficulty: difficulty || 'Medium',
      time_limit: time_limit || 0, created_by, is_published: !!is_published,
      created_at: new Date().toISOString(),
    };
    write(KEYS.quizzes, [...this.getAll(), quiz]);
    return quiz;
  },
  update(id, changes) {
    const list = this.getAll().map(q => q.id === Number(id) ? { ...q, ...changes, updated_at: new Date().toISOString() } : q);
    write(KEYS.quizzes, list);
    return this.getById(id);
  },
  delete(id) {
    write(KEYS.quizzes, this.getAll().filter(q => q.id !== Number(id)));
    questionDB.deleteByQuiz(id);
    attemptDB.deleteByQuiz(id);
  },
  togglePublish(id) {
    const quiz = this.getById(id);
    if (!quiz) return null;
    return this.update(id, { is_published: !quiz.is_published });
  },
};

// ─── Question API ─────────────────────────────────────────────────────────────
export const questionDB = {
  getAll() { return read(KEYS.questions) || []; },
  getByQuiz(quizId) {
    return this.getAll().filter(q => q.quiz_id === Number(quizId)).sort((a, b) => a.order_num - b.order_num);
  },
  setForQuiz(quizId, questions) {
    const others = this.getAll().filter(q => q.quiz_id !== Number(quizId));
    const newOnes = questions.map((q, i) => ({
      id: nextId('questions'),
      quiz_id: Number(quizId),
      order_num: i,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct: q.correct,
      explanation: q.explanation || '',
    }));
    write(KEYS.questions, [...others, ...newOnes]);
  },
  deleteByQuiz(quizId) {
    write(KEYS.questions, this.getAll().filter(q => q.quiz_id !== Number(quizId)));
  },
};

// ─── Attempt API ──────────────────────────────────────────────────────────────
export const attemptDB = {
  getAll() { return read(KEYS.attempts) || []; },
  getById(id) { return this.getAll().find(a => a.id === Number(id)) || null; },
  getByUser(userId) {
    return this.getAll()
      .filter(a => a.user_id === Number(userId))
      .map(a => ({
        ...a,
        quiz_title: (quizDB.getById(a.quiz_id) || {}).title || 'Unknown Quiz',
      }))
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  },
  getByQuiz(quizId) {
    return this.getAll().filter(a => a.quiz_id === Number(quizId));
  },
  getAllWithMeta() {
    return this.getAll().map(a => ({
      ...a,
      username:   (userDB.getById(a.user_id) || {}).username || 'Unknown',
      quiz_title: (quizDB.getById(a.quiz_id) || {}).title    || 'Unknown',
    })).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  },
  create({ quiz_id, user_id, score, total, answers }) {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const attempt = {
      id: nextId('attempts'), quiz_id: Number(quiz_id), user_id: Number(user_id),
      score, total, percentage, answers: answers || [],
      completed_at: new Date().toISOString(),
    };
    write(KEYS.attempts, [...this.getAll(), attempt]);
    return attempt;
  },
  deleteByQuiz(quizId) {
    write(KEYS.attempts, this.getAll().filter(a => a.quiz_id !== Number(quizId)));
  },
  deleteByUser(userId) {
    write(KEYS.attempts, this.getAll().filter(a => a.user_id !== Number(userId)));
  },
};

// ─── Stats API ────────────────────────────────────────────────────────────────
export const statsDB = {
  get() {
    const allAttempts = attemptDB.getAll();
    const allQuizzes  = quizDB.getAll();
    const allUsers    = userDB.getAll();
    const avgScore = allAttempts.length
      ? Math.round(allAttempts.reduce((s, a) => s + a.percentage, 0) / allAttempts.length)
      : 0;
    const topQuizzes = allQuizzes
      .map(q => {
        const qAttempts = attemptDB.getByQuiz(q.id);
        return {
          ...q,
          attempt_count: qAttempts.length,
          avg_score: qAttempts.length ? qAttempts.reduce((s, a) => s + a.percentage, 0) / qAttempts.length : 0,
        };
      })
      .sort((a, b) => b.attempt_count - a.attempt_count)
      .slice(0, 5);
    const recentAttempts = attemptDB.getAllWithMeta().slice(0, 10);
    return {
      totalUsers:    allUsers.length,
      totalQuizzes:  allQuizzes.length,
      published:     allQuizzes.filter(q => q.is_published).length,
      totalAttempts: allAttempts.length,
      avgScore,
      topQuizzes,
      recentAttempts,
    };
  },
};
