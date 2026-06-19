import { create } from "zustand";
import { v4 as uuid } from "uuid";

// ── Seed data ──────────────────────────────────────────────────────────────
const SEED_QUIZZES = [
  {
    id: "seed-1",
    title: "General Knowledge Essentials",
    description: "Test your broad knowledge across history, science, and culture.",
    category: "General",
    authorId: "seed-user",
    authorName: "Quizly Team",
    createdAt: new Date("2024-01-15").toISOString(),
    questions: [
      {
        id: "q1",
        text: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2,
      },
      {
        id: "q2",
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
      },
      {
        id: "q3",
        text: "Who painted the Mona Lisa?",
        options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
        correct: 2,
      },
      {
        id: "q4",
        text: "What is the chemical symbol for water?",
        options: ["WA", "H2O", "HO2", "W2O"],
        correct: 1,
      },
      {
        id: "q5",
        text: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2,
      },
    ],
  },
  {
    id: "seed-2",
    title: "JavaScript Fundamentals",
    description: "Challenge yourself on core JavaScript concepts and syntax.",
    category: "Technology",
    authorId: "seed-user",
    authorName: "Quizly Team",
    createdAt: new Date("2024-02-10").toISOString(),
    questions: [
      {
        id: "q1",
        text: "Which keyword declares a block-scoped variable in JavaScript?",
        options: ["var", "let", "def", "dim"],
        correct: 1,
      },
      {
        id: "q2",
        text: "What does 'typeof null' return in JavaScript?",
        options: ["null", "undefined", "object", "number"],
        correct: 2,
      },
      {
        id: "q3",
        text: "Which method converts a JSON string to a JavaScript object?",
        options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.decode()"],
        correct: 0,
      },
      {
        id: "q4",
        text: "What is the output of '2' + 2 in JavaScript?",
        options: ["4", "22", "NaN", "Error"],
        correct: 1,
      },
    ],
  },
  {
    id: "seed-3",
    title: "World Geography",
    description: "How well do you know the countries, capitals, and landmarks of our world?",
    category: "Geography",
    authorId: "seed-user",
    authorName: "Quizly Team",
    createdAt: new Date("2024-03-05").toISOString(),
    questions: [
      {
        id: "q1",
        text: "Which is the largest country by land area?",
        options: ["Canada", "China", "United States", "Russia"],
        correct: 3,
      },
      {
        id: "q2",
        text: "What is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correct: 1,
      },
      {
        id: "q3",
        text: "Which continent has the most countries?",
        options: ["Asia", "Europe", "Africa", "Americas"],
        correct: 2,
      },
    ],
  },
];

// ── Store ──────────────────────────────────────────────────────────────────
const useStore = create((set, get) => ({
  // Auth
  currentUser: null,
  users: [],

  register: ({ name, email, password }) => {
    const { users } = get();
    if (users.find((u) => u.email === email)) {
      return { error: "An account with this email already exists." };
    }
    const user = { id: uuid(), name, email, password, createdAt: new Date().toISOString() };
    set((s) => ({ users: [...s.users, user], currentUser: user }));
    return { success: true };
  },

  login: ({ email, password }) => {
    const { users } = get();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return { error: "Invalid email or password." };
    set({ currentUser: user });
    return { success: true };
  },

  logout: () => set({ currentUser: null }),

  // Quizzes
  quizzes: SEED_QUIZZES,

  createQuiz: (quizData) => {
    const { currentUser } = get();
    const quiz = {
      id: uuid(),
      ...quizData,
      authorId: currentUser?.id || "anonymous",
      authorName: currentUser?.name || "Anonymous",
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ quizzes: [quiz, ...s.quizzes] }));
    return quiz;
  },

  deleteQuiz: (id) => {
    set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) }));
  },

  getQuizById: (id) => get().quizzes.find((q) => q.id === id),

  // Results
  results: [],

  saveResult: (result) => {
    const entry = { id: uuid(), ...result, completedAt: new Date().toISOString() };
    set((s) => ({ results: [entry, ...s.results] }));
    return entry;
  },

  getResultsByUser: (userId) => get().results.filter((r) => r.userId === userId),
}));

export default useStore;
