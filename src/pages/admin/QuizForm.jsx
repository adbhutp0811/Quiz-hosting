import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react';

const BLANK_Q = () => ({
  _id: Math.random().toString(36).slice(2),
  question: '', option_a: '', option_b: '', option_c: '', option_d: '',
  correct: 'A', explanation: ''
});

const CATEGORIES  = ['General','Programming','Geography','Science','History','Math','Language','Sports','Entertainment'];
const DIFFICULTIES = ['Easy','Medium','Hard'];

export default function QuizForm({ initial, quizId }) {
  const navigate = useNavigate();
  const isEdit = !!quizId;

  const [form, setForm] = useState({
    title:        initial?.title        || '',
    description:  initial?.description  || '',
    category:     initial?.category     || 'General',
    difficulty:   initial?.difficulty   || 'Medium',
    time_limit:   initial?.time_limit   || 0,
    is_published: initial?.is_published !== undefined ? !!initial.is_published : true,
  });

  const [questions, setQuestions] = useState(
    initial?.questions?.length
      ? initial.questions.map(q => ({ ...q, _id: q.id?.toString() || Math.random().toString(36).slice(2) }))
      : [BLANK_Q()]
  );

  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [activeQ, setActiveQ] = useState(0);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setQ = (idx, k, v) => setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [k]: v } : q));
  const addQ    = () => { setQuestions(qs => [...qs, BLANK_Q()]); setActiveQ(questions.length); };
  const removeQ = idx => {
    if (questions.length === 1) return;
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    setActiveQ(Math.max(0, activeQ - (idx <= activeQ ? 1 : 0)));
  };
  const moveQ = (idx, dir) => {
    const qs = [...questions];
    const to = idx + dir;
    if (to < 0 || to >= qs.length) return;
    [qs[idx], qs[to]] = [qs[to], qs[idx]];
    setQuestions(qs); setActiveQ(to);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    questions.forEach((q, i) => {
      if (!q.question.trim()) e[`q${i}_question`] = 'Question text required';
      if (!q.option_a.trim()) e[`q${i}_a`] = 'Option A required';
      if (!q.option_b.trim()) e[`q${i}_b`] = 'Option B required';
      if (!q.option_c.trim()) e[`q${i}_c`] = 'Option C required';
      if (!q.option_d.trim()) e[`q${i}_d`] = 'Option D required';
    });
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, questions };
      if (isEdit) await api.put(`/quizzes/${quizId}`, payload);
      else        await api.post('/quizzes', payload);
      navigate('/admin/quizzes');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Save failed. Please try again.' });
    } finally { setSaving(false); }
  };

  const optKeys   = ['A','B','C','D'];
  const optFields = ['option_a','option_b','option_c','option_d'];

  return (
    <form onSubmit={submit} className="fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/quizzes')}>
          <ArrowLeft size={16}/>Back
        </button>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--gray-900)' }}>
          {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
        </h1>
        <div style={{ display:'flex', gap:10, marginLeft:'auto' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner"/>Saving...</> : <><Save size={16}/>{isEdit ? 'Save Changes' : 'Create Quiz'}</>}
          </button>
        </div>
      </div>

      {errors.general && <div className="alert alert-error" style={{ marginBottom:16 }}>{errors.general}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20, alignItems:'start' }}>
        {/* Left: meta */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:20 }}>
          <div className="card">
            <div className="card-header"><h2 style={{ fontWeight:700, fontSize:'.95rem' }}>Quiz Details</h2></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input value={form.title} onChange={e => setField('title', e.target.value)}
                  className={`form-input ${errors.title ? 'error' : ''}`} placeholder="Quiz title..." />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  className="form-input" placeholder="Brief description..." rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={form.category} onChange={e => setField('category', e.target.value)} className="form-input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <div style={{ display:'flex', gap:6 }}>
                  {DIFFICULTIES.map(d => (
                    <button key={d} type="button"
                      style={{
                        flex:1, padding:'8px', borderRadius:'var(--radius-sm)', border:'1.5px solid',
                        borderColor: form.difficulty === d ? (d==='Easy'?'#10b981':d==='Medium'?'#f59e0b':'#ef4444') : 'var(--gray-200)',
                        background: form.difficulty === d ? (d==='Easy'?'#d1fae5':d==='Medium'?'#fef3c7':'#fee2e2') : 'white',
                        color: form.difficulty === d ? (d==='Easy'?'#065f46':d==='Medium'?'#92400e':'#991b1b') : 'var(--gray-600)',
                        fontSize:'.82rem', fontWeight:600, cursor:'pointer', transition:'var(--transition)'
                      }}
                      onClick={() => setField('difficulty', d)}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Time Limit (minutes)</label>
                <input type="number" min={0} max={120} value={form.time_limit}
                  onChange={e => setField('time_limit', parseInt(e.target.value) || 0)}
                  className="form-input" placeholder="0 = no limit" />
                <span className="form-hint">0 = no time limit</span>
              </div>
              <div onClick={() => setField('is_published', !form.is_published)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:14, background:'var(--gray-50)', borderRadius:'var(--radius-sm)', cursor:'pointer', border:'1.5px solid var(--gray-200)' }}>
                <div>
                  <div style={{ fontSize:'.875rem', fontWeight:600 }}>Published</div>
                  <div style={{ fontSize:'.78rem', color:'var(--gray-500)' }}>{form.is_published ? 'Visible to users' : 'Hidden (draft)'}</div>
                </div>
                <div style={{ width:40, height:22, borderRadius:999, background: form.is_published ? 'var(--primary)' : 'var(--gray-300)', position:'relative', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:'white', position:'absolute', top:3, left: form.is_published ? 21 : 3, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Question list */}
          <div className="card">
            <div className="card-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ fontWeight:700, fontSize:'.95rem' }}>Questions ({questions.length})</h2>
              <button type="button" className="btn btn-primary btn-sm" onClick={addQ}><Plus size={14}/>Add</button>
            </div>
            <div style={{ padding:8, display:'flex', flexDirection:'column', gap:4 }}>
              {questions.map((q, i) => (
                <button key={q._id} type="button"
                  onClick={() => setActiveQ(i)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                    borderRadius:'var(--radius-sm)', border:'1.5px solid',
                    borderColor: activeQ === i ? 'var(--primary)' : errors[`q${i}_question`] ? 'var(--danger)' : 'transparent',
                    background: activeQ === i ? 'var(--primary-light)' : errors[`q${i}_question`] ? '#fef2f2' : 'transparent',
                    cursor:'pointer', textAlign:'left', transition:'var(--transition)', width:'100%'
                  }}>
                  <span style={{ width:22, height:22, borderRadius:'50%', background: activeQ === i ? 'var(--primary)' : 'var(--gray-200)', color: activeQ === i ? 'white' : 'var(--gray-600)', fontSize:'.72rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                  <span style={{ flex:1, fontSize:'.82rem', color:'var(--gray-700)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:500 }}>{q.question || 'Untitled question'}</span>
                  {q.question && <CheckCircle size={13} style={{ color:'#10b981', flexShrink:0 }}/>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: question editor */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {questions.map((q, i) => i !== activeQ ? null : (
            <div key={q._id} className="card scale-in">
              <div className="card-header" style={{ display:'flex', alignItems:'center', gap:8 }}>
                <HelpCircle size={16} style={{ color:'var(--primary)' }}/>
                <h2 style={{ fontWeight:700, fontSize:'.95rem' }}>Question {i+1}</h2>
                <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
                  <button type="button" className="btn btn-icon btn-ghost btn-sm" onClick={() => moveQ(i,-1)} disabled={i===0}><ChevronUp size={15}/></button>
                  <button type="button" className="btn btn-icon btn-ghost btn-sm" onClick={() => moveQ(i,1)} disabled={i===questions.length-1}><ChevronDown size={15}/></button>
                  <button type="button" className="btn btn-icon btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => removeQ(i)} disabled={questions.length===1}><Trash2 size={15}/></button>
                </div>
              </div>
              <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea value={q.question} onChange={e => setQ(i,'question',e.target.value)}
                    className={`form-input ${errors[`q${i}_question`] ? 'error' : ''}`}
                    placeholder="Enter your question here..." rows={3} />
                  {errors[`q${i}_question`] && <span className="form-error">{errors[`q${i}_question`]}</span>}
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom:10, display:'block' }}>Answer Options — click a row to mark as correct</label>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {optKeys.map((key, ki) => (
                      <div key={key}
                        onClick={() => setQ(i,'correct',key)}
                        style={{
                          display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                          borderRadius:'var(--radius-sm)', cursor:'pointer', transition:'var(--transition)',
                          border:`1.5px solid ${q.correct===key ? '#10b981' : 'var(--gray-200)'}`,
                          background: q.correct===key ? '#f0fdf4' : 'white'
                        }}>
                        <div style={{
                          width:30, height:30, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'.78rem', fontWeight:700, transition:'var(--transition)',
                          background: q.correct===key ? '#10b981' : 'white',
                          border:`2px solid ${q.correct===key ? '#10b981' : 'var(--gray-300)'}`,
                          color: q.correct===key ? 'white' : 'var(--gray-500)'
                        }}>{key}</div>
                        <input value={q[optFields[ki]]} onChange={e => { e.stopPropagation(); setQ(i,optFields[ki],e.target.value); }}
                          onClick={e => e.stopPropagation()}
                          className={`form-input ${errors[`q${i}_${key.toLowerCase()}`] ? 'error' : ''}`}
                          style={{ flex:1, border:'none', background:'transparent', padding:'4px 0' }}
                          placeholder={`Option ${key}`} />
                        {q.correct===key && (
                          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.72rem', fontWeight:700, color:'#10b981', whiteSpace:'nowrap' }}>
                            <CheckCircle size={13}/>Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Explanation (optional)</label>
                  <textarea value={q.explanation} onChange={e => setQ(i,'explanation',e.target.value)}
                    className="form-input" placeholder="Explain why this answer is correct..." rows={2} />
                </div>

                {i < questions.length - 1 && (
                  <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf:'flex-start' }}
                    onClick={() => setActiveQ(i+1)}>Next Question →</button>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline" onClick={addQ} style={{ width:'100%' }}>
            <Plus size={16}/>Add Another Question
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width:900px) {
          form > div:last-of-type { grid-template-columns:1fr !important; }
          form > div:last-of-type > div:first-child { position:static !important; }
        }
      `}</style>
    </form>
  );
}
