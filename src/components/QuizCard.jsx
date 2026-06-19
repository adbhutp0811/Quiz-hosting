import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = {
  Programming: { bg: '#ede9fe', color: '#6d28d9' },
  Geography:   { bg: '#d1fae5', color: '#065f46' },
  Science:     { bg: '#dbeafe', color: '#1e40af' },
  History:     { bg: '#fef3c7', color: '#92400e' },
  Math:        { bg: '#fce7f3', color: '#9d174d' },
  General:     { bg: '#f3f4f6', color: '#374151' },
};

const DIFF_COLORS = {
  Easy:   { bg: '#d1fae5', color: '#065f46' },
  Medium: { bg: '#fef3c7', color: '#92400e' },
  Hard:   { bg: '#fee2e2', color: '#991b1b' },
};

export default function QuizCard({ quiz }) {
  const cat  = CATEGORY_COLORS[quiz.category] || CATEGORY_COLORS.General;
  const diff = DIFF_COLORS[quiz.difficulty]   || DIFF_COLORS.Medium;
  const avg  = quiz.avg_score ? Math.round(quiz.avg_score) : null;

  return (
    <div className="quiz-card">
      <div className="qc-header">
        <span className="qc-cat" style={{ background: cat.bg, color: cat.color }}>{quiz.category}</span>
        <span className="qc-diff" style={{ background: diff.bg, color: diff.color }}>{quiz.difficulty}</span>
      </div>
      <h3 className="qc-title">{quiz.title}</h3>
      <p className="qc-desc">{quiz.description || 'No description provided.'}</p>
      <div className="qc-meta">
        <span><BookOpen size={13} />{quiz.question_count || 0} Qs</span>
        {quiz.time_limit > 0 && <span><Clock size={13} />{quiz.time_limit} min</span>}
        <span><Users size={13} />{quiz.attempt_count || 0} taken</span>
        {avg !== null && <span><Star size={13} />{avg}% avg</span>}
      </div>
      <div className="qc-footer">
        <span className="qc-creator">by {quiz.creator_name}</span>
        <Link to={`/quiz/${quiz.id}`} className="btn btn-primary btn-sm">
          Take Quiz <ChevronRight size={14} />
        </Link>
      </div>

      <style>{`
        .quiz-card {
          background: white; border: 1px solid var(--gray-200); border-radius: var(--radius);
          padding: 20px; display: flex; flex-direction: column; gap: 12px;
          transition: var(--transition); box-shadow: var(--shadow-sm);
        }
        .quiz-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--primary-light); }
        .qc-header { display: flex; gap: 8px; flex-wrap: wrap; }
        .qc-cat, .qc-diff { font-size: .72rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; letter-spacing: .03em; }
        .qc-title { font-size: 1rem; font-weight: 700; color: var(--gray-900); line-height: 1.4; }
        .qc-desc { font-size: .85rem; color: var(--gray-500); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .qc-meta { display: flex; gap: 12px; flex-wrap: wrap; }
        .qc-meta span { display: flex; align-items: center; gap: 4px; font-size: .78rem; color: var(--gray-500); font-weight: 500; }
        .qc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 4px; border-top: 1px solid var(--gray-100); }
        .qc-creator { font-size: .78rem; color: var(--gray-400); }
      `}</style>
    </div>
  );
}
