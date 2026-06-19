import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QuizForm from './QuizForm.jsx';
import api from '../../api/axios.js';

export default function AdminEditQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get(`/quizzes/${id}/admin`)
      .then(r => { setQuiz(r.data); setLoading(false); })
      .catch(() => { setError('Quiz not found'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px' }}>
      <div className="spinner spinner-dark" />
    </div>
  );
  if (error) return <div className="alert alert-error">{error}</div>;

  return <QuizForm initial={quiz} quizId={id} />;
}
