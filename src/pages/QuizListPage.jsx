import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import useStore from "../store/useStore";
import QuizCard, { QuizCardSkeleton } from "../components/QuizCard";
import "./QuizListPage.css";

const CATEGORIES = ["All", "General", "Technology", "Geography", "Science", "History", "Pop Culture", "Other"];

export default function QuizListPage() {
  const quizzes = useStore((s) => s.quizzes);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...quizzes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          quiz.description.toLowerCase().includes(q) ||
          quiz.authorName.toLowerCase().includes(q)
      );
    }
    if (category !== "All") {
      list = list.filter((quiz) => quiz.category === category);
    }
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "most-questions") {
      list.sort((a, b) => b.questions.length - a.questions.length);
    }
    return list;
  }, [quizzes, search, category, sortBy]);

  return (
    <div className="quiz-list-page">
      <div className="container">
        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Browse Quizzes</h1>
            <p className="page-sub">
              {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} available to take
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar" role="search" aria-label="Filter quizzes">
          <div className="search-wrap">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              type="search"
              className="search-input"
              placeholder="Search quizzes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search quizzes"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <SlidersHorizontal size={14} aria-hidden="true" />
              <label htmlFor="sort-select" className="filter-label">Sort:</label>
              <select
                id="sort-select"
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most-questions">Most questions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="category-tabs" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              className={`cat-tab ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="results-count" aria-live="polite">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {search && ` for "${search}"`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="quiz-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => <QuizCardSkeleton key={n} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="quiz-grid">
            {filtered.map((q) => <QuizCard key={q.id} quiz={q} />)}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <BookOpen size={36} className="empty-icon" aria-hidden="true" />
            <h2 className="empty-title">No quizzes found</h2>
            <p className="empty-desc">
              {search
                ? `No quizzes match "${search}". Try a different search term.`
                : "No quizzes in this category yet. Be the first to create one!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
