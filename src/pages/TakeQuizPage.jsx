import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, BookOpen } from 'lucide-react';

export default function TakeQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const [quizRes, attemptsRes] = await Promise.all([
          api.get(`/quizzes/${id}`),
          api.get('/attempts/my/all')
        ]);

        const attempted = attemptsRes.data.some(a => Number(a.quiz_id) === Number(id));
        if (attempted) {
          setError('You have already attempted this quiz.');
          setLoading(false);
          return;
        }

        setQuiz(quizRes.data);
        if (quizRes.data.time_limit > 0) setTimeLeft(quizRes.data.time_limit * 60);
      } catch {
        setError('Quiz not found or not available');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); handleSubmit(); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const answerList = quiz.questions.map((q) => answers[q.id] || null);
      const res = await api.post('/attempts', {
        quiz_id: parseInt(id),
        answers: answerList,
        time_taken: timeTaken,
      });
      navigate(`/results/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner spinner-dark" style={{ width:32, height:32 }} />
    </div>
  );
  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/browse" className="btn btn-primary">Browse Quizzes</Link>
    </div>
  );
  if (!quiz) return null;

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const answered = quiz.questions.filter((q) => answers[q.id]).length;
  const progress = ((current + 1) / total) * 100;
  const opts = [
    { key:'A', text: q.option_a },
    { key:'B', text: q.option_b },
    { key:'C', text: q.option_c },
    { key:'D', text: q.option_d },
  ];

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f8faff,#eef2ff)', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid var(--gray-200)', padding:'12px 24px', display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:50, boxShadow:'var(--shadow-sm)' }}>
        <Link to="/browse" className="btn btn-ghost btn-sm"><ArrowLeft size={15}/>Exit</Link>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'.78rem', color:'var(--gray-500)', marginBottom:4 }}>{quiz.title}</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
          {timeLeft !== null && (
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.875rem', fontWeight:700, color: timeLeft < 60 ? 'var(--danger)' : 'var(--gray-700)' }}>
              <Clock size={15}/>{fmt(timeLeft)}
            </div>
          )}
          <span style={{ fontSize:'.875rem', fontWeight:600, color:'var(--gray-600)' }}>{current+1}/{total}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
        <div style={{ width:'100%', maxWidth:680 }} className="fade-in">
          {/* Question */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="card-body">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', fontWeight:700, flexShrink:0 }}>
                  {current+1}
                </div>
                <span style={{ fontSize:'.78rem', fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                  Question {current+1} of {total}
                </span>
              </div>
              <p style={{ fontSize:'1.15rem', fontWeight:600, color:'var(--gray-900)', lineHeight:1.6 }}>{q.question}</p>
            </div>
          </div>

          {/* Options */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            {opts.map(opt => {
              const selected = answers[q.id] === opt.key;
              return (
                <button key={opt.key} onClick={() => setAnswers(p => ({...p, [q.id]: opt.key}))}
                  style={{
                    display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
                    borderRadius:'var(--radius)', border:`2px solid ${selected ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: selected ? 'var(--primary-light)' : 'white',
                    cursor:'pointer', transition:'var(--transition)', textAlign:'left', width:'100%'
                  }}>
                  <div style={{
                    width:32, height:32, borderRadius:'50%', border:`2px solid ${selected ? 'var(--primary)' : 'var(--gray-300)'}`,
                    background: selected ? 'var(--primary)' : 'white',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'.8rem', fontWeight:700, color: selected ? 'white' : 'var(--gray-500)', flexShrink:0
                  }}>{opt.key}</div>
                  <span style={{ fontSize:'.95rem', fontWeight: selected ? 600 : 400, color: selected ? 'var(--primary-dark)' : 'var(--gray-700)' }}>
                    {opt.text}
                  </span>
                  {selected && <CheckCircle size={18} style={{ color:'var(--primary)', marginLeft:'auto', flexShrink:0 }} />}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <button className="btn btn-ghost" onClick={() => setCurrent(p => p - 1)} disabled={current === 0}>
              <ArrowLeft size={16}/>Previous
            </button>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
              {quiz.questions.map((qq, i) => (
                <button key={qq.id} onClick={() => setCurrent(i)}
                  style={{
                    width:28, height:28, borderRadius:'50%', border:'2px solid',
                    borderColor: i === current ? 'var(--primary)' : answers[qq.id] ? 'var(--success)' : 'var(--gray-300)',
                    background: i === current ? 'var(--primary)' : answers[qq.id] ? 'var(--success)' : 'white',
                    color: (i === current || answers[qq.id]) ? 'white' : 'var(--gray-500)',
                    fontSize:'.72rem', fontWeight:700, cursor:'pointer', transition:'var(--transition)'
                  }}>{i+1}</button>
              ))}
            </div>
            {current < total - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrent(p => p + 1)}>
                Next<ArrowRight size={16}/>
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit} disabled={submitting || answered < total}>
                {submitting ? <><div className="spinner"/>Submitting...</> : <><CheckCircle size={16}/>Submit ({answered}/{total})</>}
              </button>
            )}
          </div>
          {answered < total && current === total - 1 && (
            <p style={{ textAlign:'center', fontSize:'.82rem', color:'var(--warning)', marginTop:12, fontWeight:600 }}>
              Please answer all {total - answered} remaining question{total - answered !== 1 ? 's' : ''} before submitting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
