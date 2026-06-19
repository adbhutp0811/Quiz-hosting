import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, BookOpen } from 'lucide-react';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/quizzes')
      .then(r => setQuizzes(r.data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const togglePublish = async (id) => {
    try {
      const res = await api.patch(`/quizzes/${id}/publish`);
      setQuizzes(qs => qs.map(q => q.id === id ? { ...q, is_published: res.data.is_published } : q));
    } catch {}
  };

  const deleteQuiz = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(qs => qs.filter(q => q.id !== id));
      setConfirmDel(null);
    } catch {} finally { setDeleting(null); }
  };

  const filtered = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  const diffColor = { Easy:'badge-success', Medium:'badge-warning', Hard:'badge-danger' };

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Quizzes</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'.875rem', marginTop:4 }}>{quizzes.length} total quizzes</p>
        </div>
        <Link to="/admin/quizzes/create" className="btn btn-primary"><Plus size={16}/>Create Quiz</Link>
      </div>

      {/* Search */}
      <div style={{ background:'white', borderRadius:'var(--radius)', border:'1px solid var(--gray-200)', padding:16, marginBottom:20 }}>
        <div style={{ position:'relative', maxWidth:400 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} className="form-input"
            style={{ paddingLeft:38 }} placeholder="Search quizzes..." />
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner spinner-dark" style={{ width:32, height:32 }}/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} style={{ opacity:.2, margin:'0 auto 12px', display:'block' }}/>
          <h3>No quizzes found</h3>
          <p>Create your first quiz to get started</p>
          <Link to="/admin/quizzes/create" className="btn btn-primary" style={{ marginTop:16 }}>Create Quiz</Link>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
          {filtered.map(q => (
            <div key={q.id} className="card" style={{ display:'flex', flexDirection:'column', gap:0 }}>
              <div style={{ padding:'20px 20px 14px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                      <span className="badge badge-primary">{q.category}</span>
                      <span className={`badge ${diffColor[q.difficulty] || 'badge-gray'}`}>{q.difficulty}</span>
                      <span className={`badge ${q.is_published ? 'badge-success' : 'badge-gray'}`}>
                        {q.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 style={{ fontWeight:700, fontSize:'.95rem', lineHeight:1.3 }}>{q.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize:'.82rem', color:'var(--gray-500)', lineHeight:1.5, marginBottom:12 }}>
                  {q.description || 'No description'}
                </p>
                <div style={{ display:'flex', gap:16, fontSize:'.78rem', color:'var(--gray-500)' }}>
                  <span>{q.question_count} questions</span>
                  <span>{q.attempt_count} attempts</span>
                  {q.avg_score && <span>{Math.round(q.avg_score)}% avg</span>}
                </div>
              </div>
              <div style={{ borderTop:'1px solid var(--gray-100)', padding:'12px 20px', display:'flex', gap:8, background:'var(--gray-50)' }}>
                <Link to={`/admin/quizzes/edit/${q.id}`} className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>
                  <Edit2 size={14}/>Edit
                </Link>
                <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center', color: q.is_published ? 'var(--warning)' : 'var(--success)' }}
                  onClick={() => togglePublish(q.id)}>
                  {q.is_published ? <><EyeOff size={14}/>Unpublish</> : <><Eye size={14}/>Publish</>}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)', justifyContent:'center' }}
                  onClick={() => setConfirmDel(q)}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight:700 }}>Delete Quiz</h3>
              <button onClick={() => setConfirmDel(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'var(--gray-600)' }}>
                Are you sure you want to delete <strong>{confirmDel.title}</strong>? This will also delete all questions and attempt history. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteQuiz(confirmDel.id)} disabled={deleting === confirmDel.id}>
                {deleting === confirmDel.id ? <><div className="spinner"/>Deleting...</> : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
