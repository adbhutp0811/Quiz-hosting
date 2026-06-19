import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'quiz.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'user',
    rollno      TEXT    DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    description  TEXT    DEFAULT '',
    category     TEXT    NOT NULL DEFAULT 'General',
    difficulty   TEXT    NOT NULL DEFAULT 'Medium',
    time_limit   INTEGER NOT NULL DEFAULT 0,
    created_by   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS questions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id     INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question    TEXT    NOT NULL,
    option_a    TEXT    NOT NULL,
    option_b    TEXT    NOT NULL,
    option_c    TEXT    NOT NULL,
    option_d    TEXT    NOT NULL,
    correct     TEXT    NOT NULL,
    explanation TEXT    DEFAULT '',
    order_num   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id      INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score        INTEGER NOT NULL,
    total        INTEGER NOT NULL,
    percentage   REAL    NOT NULL,
    time_taken   INTEGER NOT NULL DEFAULT 0,
    answers      TEXT    NOT NULL DEFAULT '[]',
    completed_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  DELETE FROM attempts
  WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM attempts
    GROUP BY quiz_id, user_id
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_quiz_user
  ON attempts (quiz_id, user_id);
`);

// Migrate: add rollno column if it doesn't exist
const hasRollno = db.prepare("PRAGMA table_info(users)").all().some(c => c.name === 'rollno');
if (!hasRollno) {
  db.exec("ALTER TABLE users ADD COLUMN rollno TEXT DEFAULT ''");
}

const adminExists = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
const demoUserExists = db.prepare("SELECT id FROM users WHERE email='john@example.com' LIMIT 1").get();

if (!adminExists || !demoUserExists) {
  const adminPw = bcrypt.hashSync('Admin@123', 10);
  const userPw  = bcrypt.hashSync('user123', 10);
  const insertUser = db.prepare(
    "INSERT OR IGNORE INTO users (username, email, password, role, rollno) VALUES (?, ?, ?, ?, ?)"
  );

  const adminId = insertUser.run('admin', 'admin@quizly.com', adminPw, 'admin', '').lastInsertRowid ||
    db.prepare("SELECT id FROM users WHERE email='admin@quizly.com'").get().id;

  insertUser.run('john_doe', 'john@example.com', userPw, 'user', '');
  insertUser.run('jane_doe', 'jane@example.com', userPw, 'user', '');

  const insertQuiz = db.prepare(
    "INSERT INTO quizzes (title, description, category, difficulty, time_limit, created_by, is_published) VALUES (?,?,?,?,?,?,?)"
  );
  const insertQ = db.prepare(
    "INSERT INTO questions (quiz_id,question,option_a,option_b,option_c,option_d,correct,explanation,order_num) VALUES (?,?,?,?,?,?,?,?,?)"
  );

  const q1 = insertQuiz.run(
    'JavaScript Fundamentals',
    'Test your knowledge of core JavaScript concepts including variables, functions, and ES6+ features.',
    'Programming', 'Medium', 15, adminId, 1
  ).lastInsertRowid;

  insertQ.run(q1,'What does typeof null return in JavaScript?','object','null','undefined','string','A','typeof null returns object due to a legacy bug in JavaScript.',1);
  insertQ.run(q1,'Which method adds elements to the end of an array?','push()','append()','add()','insert()','A','The push() method adds one or more elements to the end of an array.',2);
  insertQ.run(q1,'What is the output of: console.log(0.1 + 0.2 === 0.3)?','false','true','undefined','NaN','A','Due to floating-point precision, 0.1 + 0.2 is not exactly 0.3.',3);
  insertQ.run(q1,'Which keyword declares a block-scoped variable?','let','var','int','define','A','The let keyword declares a block-scoped local variable.',4);
  insertQ.run(q1,'What does the => symbol represent?','Arrow function','Greater than or equal','Comparison operator','Assignment','A','The => symbol defines arrow functions introduced in ES6.',5);

  const q2 = insertQuiz.run(
    'World Geography',
    'Explore capitals, countries, and geographical facts from around the world.',
    'Geography', 'Easy', 10, adminId, 1
  ).lastInsertRowid;

  insertQ.run(q2,'What is the capital of Australia?','Canberra','Sydney','Melbourne','Brisbane','A','Canberra is the capital city of Australia, not Sydney.',1);
  insertQ.run(q2,'Which is the longest river in the world?','Nile','Amazon','Yangtze','Mississippi','A','The Nile River in Africa is generally considered the longest river.',2);
  insertQ.run(q2,'How many continents are there on Earth?','7','5','6','8','A','Earth has 7 continents.',3);
  insertQ.run(q2,'Which country has the largest land area?','Russia','Canada','China','USA','A','Russia is the largest country in the world by land area.',4);

  const q3 = insertQuiz.run(
    'Science and Technology',
    'A challenging quiz covering physics, chemistry, biology, and modern technology.',
    'Science', 'Hard', 20, adminId, 1
  ).lastInsertRowid;

  insertQ.run(q3,'What is the chemical symbol for Gold?','Au','Ag','Fe','Cu','A','Au comes from the Latin word Aurum meaning gold.',1);
  insertQ.run(q3,'How many bones are in the adult human body?','206','208','204','210','A','An adult human body has 206 bones.',2);
  insertQ.run(q3,'What is the approximate speed of light in vacuum?','299,792 km/s','300,000 km/s','186,000 km/s','150,000 km/s','A','The speed of light in vacuum is approximately 299,792 km/s.',3);

  console.log('✅ Database seeded with admin, users, and 3 quizzes');
}

export default db;
