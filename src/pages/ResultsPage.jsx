import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { Trophy, CheckCircle, XCircle, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';

export default function ResultsPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/attempts/${id}`).then(r => setAttempt(r.data)).catch(() => setError('Results not found')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner spinner-dark" style={{ width:32, height:32 }} />
    </div>
  );
  if (error || !attempt) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div className="alert alert-error">{error || 'Not found'}</div>
      <Link to="/browse" className="btn btn-primary">Browse Quizzes</Link>
    </div>
  );

  const pct = attempt.percentage;
  const passed = pct >= 60;
  const scoreColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = circ - (pct / 100) * circ;

  const optLabel = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)', paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'16px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <Link to="/browse" className="btn btn-ghost btn-sm"><BookOpen size={15}/>Browse More</Link>
        <span style={{ fontWeight:700, color:'var(--gray-700)' }}>Quiz Results</span>
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }}>Dashboard</Link>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 20px' }}>
        {/* Score card */}
        <div className="card fade-in" style={{ marginBottom:28, textAlign:'center', padding:'40px 24px' }}>
          <div style={{ marginBottom:20 }}>
            <svg width={140} height={140} style={{ transform:'rotate(-90deg)' }}>
              <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--gray-200)" strokeWidth={10} />
              <circle cx={70} cy={70} r={radius} fill="none" stroke={scoreColor} strokeWidth={10}
                strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                style={{ transition:'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{ marginTop:-90, marginBottom:70 }}>
              <div style={{ fontSize:'2.2rem', fontWeight:900, color:scoreColor, lineHeight:1 }}>{pct}%</div>
              <div style={{ fontSize:'.82rem', color:'var(--gray-500)', fontWeight:500 }}>Score</div>
            </div>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:999, background: passed ? '#d1fae5' : '#fee2e2', marginBottom:16 }}>
            {passed ? <Trophy size={18} style={{ color:'#059669' }} /> : <XCircle size={18} style={{ color:'#dc2626' }} />}
            <span style={{ fontWeight:700, color: passed ? '#065f46' : '#991b1b' }}>{passed ? 'Passed!' : 'Keep Practicing'}</span>
          </div>
          <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:8 }}>{attempt.quiz_title}</h2>
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--success)' }}>{attempt.score}</div>
              <div style={{ fontSize:'.78rem', color:'var(--gray-500)' }}>Correct</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--danger)' }}>{attempt.total - attempt.score}</div>
              <div style={{ fontSize:'.78rem', color:'var(--gray-500)' }}>Wrong</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--gray-700)' }}>{attempt.total}</div>
              <div style={{ fontSize:'.78rem', color:'var(--gray-500)' }}>Total</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:24, flexWrap:'wrap' }}>
            <Link to={`/quiz/${attempt.quiz_id}`} className="btn btn-outline"><RotateCcw size={15}/>Retake Quiz</Link>
            <Link to="/browse" className="btn btn-primary">More Quizzes<ArrowRight size={15}/></Link>
          </div>
        </div>

        {/* Answer review */}
        <h3 style={{ fontWeight:700, marginBottom:16, fontSize:'1.1rem' }}>Answer Review</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {(attempt.answers || []).map((a, i) => {
            return (
              <div key={i} className="card" style={{ border:`2px solid ${a.isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
                <div className="card-body">
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background: a.isCorrect ? 'var(--success)' : 'var(--danger)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:700, flexShrink:0 }}>
                      {i+1}
                    </div>
                    <p style={{ fontWeight:600, color:'var(--gray-900)', lineHeight:1.5, flex:1 }}>{a.question}</p>
                    {a.isCorrect ? <CheckCircle size={20} style={{ color:'var(--success)', flexShrink:0 }} /> : <XCircle size={20} style={{ color:'var(--danger)', flexShrink:0 }} />}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {optLabel.map((key) => {
                      const optionText = a.options?.[key] || '';
                      const isCorrect = key === a.correct;
                      const isUser = key === a.userAnswer;
                      let bg = 'var(--gray-50)', border = 'var(--gray-200)', color = 'var(--gray-700)';
                      if (isCorrect) { bg = '#f0fdf4'; border = '#10b981'; color = '#065f46'; }
                      else if (isUser && !isCorrect) { bg = '#fef2f2'; border = '#ef4444'; color = '#991b1b'; }
                      return (
                        <div key={key} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--radius-sm)', border:`1.5px solid ${border}`, background:bg }}>
                          <span style={{ width:24, height:24, borderRadius:'50%', background: isCorrect ? '#10b981' : isUser ? '#ef4444' : 'var(--gray-200)', color: (isCorrect || isUser) ? 'white' : 'var(--gray-600)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:700, flexShrink:0 }}>{key}</span>
                          <span style={{ fontSize:'.875rem', color, fontWeight: isCorrect ? 600 : 400, flex:1 }}>{optionText}</span>
                          {isCorrect && <span style={{ fontSize:'.72rem', fontWeight:700, color:'#10b981' }}>✓ Correct</span>}
                          {isUser && !isCorrect && <span style={{ fontSize:'.72rem', fontWeight:700, color:'#ef4444' }}>✗ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  {a.explanation && (
                    <div style={{ marginTop:12, padding:'10px 14px', background:'#eff6ff', borderRadius:'var(--radius-sm)', fontSize:'.85rem', color:'#1e40af', borderLeft:'3px solid #3b82f6' }}>
                      <strong>Explanation:</strong> {a.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
