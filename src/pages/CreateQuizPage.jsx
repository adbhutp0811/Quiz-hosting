import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, CheckCircle, AlertCircle } from "lucide-react";
import { v4 as uuid } from "uuid";
import useStore from "../store/useStore";
import Input, { Textarea, Select } from "../components/Input";
import Button from "../components/Button";
import "./CreateQuizPage.css";

const CATEGORIES = ["General", "Technology", "Geography", "Science", "History", "Pop Culture", "Other"];

const emptyQuestion = () => ({
  id: uuid(),
  text: "",
  options: ["", "", "", ""],
  correct: 0,
});

export default function CreateQuizPage() {
  const createQuiz = useStore((s) => s.createQuiz);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const addQuestion = () => {
    setQuestions((qs) => [...qs, emptyQuestion()]);
  };

  const removeQuestion = (id) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
    // Clear error
    setErrors((e) => ({ ...e, [`q-${id}-${field}`]: "" }));
  };

  const updateOption = (qId, optIdx, value) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === optIdx ? value : o)) }
          : q
      )
    );
    setErrors((e) => ({ ...e, [`q-${qId}-opt-${optIdx}`]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Quiz title is required.";
    if (!description.trim()) e.description = "A short description is required.";
    if (questions.length < 1) e.questions = "Add at least one question.";

    questions.forEach((q) => {
      if (!q.text.trim()) e[`q-${q.id}-text`] = "Question text is required.";
      q.options.forEach((opt, i) => {
        if (!opt.trim()) e[`q-${q.id}-opt-${i}`] = "Option text is required.";
      });
    });
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const quiz = createQuiz({ title, description, category, questions });
    setLoading(false);
    setSaved(true);
    setTimeout(() => navigate(`/quiz/${quiz.id}/take`), 1200);
  };

  return (
    <div className="create-page">
      <div className="container">
        <div className="create-header">
          <h1 className="page-title">Create a quiz</h1>
          <p className="page-sub">Fill in the details below to publish your quiz.</p>
        </div>

        {saved && (
          <div className="create-success animate-fade-in" role="status">
            <CheckCircle size={18} />
            Quiz created! Redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Create quiz form">
          {/* Quiz details */}
          <section className="create-section" aria-labelledby="details-heading">
            <h2 id="details-heading" className="create-section-title">Quiz details</h2>
            <div className="create-fields">
              <Input
                label="Quiz title"
                id="quiz-title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((er) => ({ ...er, title: "" })); }}
                error={errors.title}
                required
                placeholder="e.g. World History Trivia"
              />
              <Textarea
                label="Description"
                id="quiz-desc"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((er) => ({ ...er, description: "" })); }}
                error={errors.description}
                required
                placeholder="Briefly describe what this quiz is about…"
              />
              <Select
                label="Category"
                id="quiz-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </section>

          {/* Questions */}
          <section className="create-section" aria-labelledby="questions-heading">
            <div className="questions-header">
              <h2 id="questions-heading" className="create-section-title">
                Questions
                <span className="question-count">{questions.length}</span>
              </h2>
              <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                <Plus size={14} />
                Add question
              </Button>
            </div>

            {errors.questions && (
              <p className="field-error" role="alert">{errors.questions}</p>
            )}

            <div className="questions-list">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="question-card animate-fade-in" aria-label={`Question ${qIdx + 1}`}>
                  <div className="question-card-header">
                    <div className="question-num-wrap">
                      <GripVertical size={16} className="drag-handle" aria-hidden="true" />
                      <span className="question-num">Q{qIdx + 1}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeQuestion(q.id)}
                      disabled={questions.length === 1}
                      aria-label={`Remove question ${qIdx + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="question-body">
                    <Input
                      label="Question"
                      id={`q-${q.id}-text`}
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                      error={errors[`q-${q.id}-text`]}
                      required
                      placeholder={`Enter question ${qIdx + 1}…`}
                    />

                    <fieldset className="options-fieldset">
                      <legend className="options-legend">
                        Answer options
                        <span className="options-hint">— select the correct one</span>
                      </legend>
                      <div className="options-list">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="option-row">
                            <label className="option-radio-wrap" aria-label={`Mark option ${oIdx + 1} as correct`}>
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correct === oIdx}
                                onChange={() => updateQuestion(q.id, "correct", oIdx)}
                                className="option-radio"
                                aria-label={`Option ${oIdx + 1} is correct`}
                              />
                              <span className={`option-radio-custom ${q.correct === oIdx ? "checked" : ""}`} aria-hidden="true">
                                {q.correct === oIdx && <CheckCircle size={12} />}
                              </span>
                            </label>
                            <div className="option-input-wrap">
                              <input
                                type="text"
                                id={`q-${q.id}-opt-${oIdx}`}
                                value={opt}
                                onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                                className={`option-input ${errors[`q-${q.id}-opt-${oIdx}`] ? "option-input-error" : ""}`}
                                placeholder={`Option ${oIdx + 1}`}
                                aria-label={`Option ${oIdx + 1} for question ${qIdx + 1}`}
                              />
                              {errors[`q-${q.id}-opt-${oIdx}`] && (
                                <span className="option-error" role="alert">
                                  <AlertCircle size={12} />
                                  {errors[`q-${q.id}-opt-${oIdx}`]}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-question-btn"
              onClick={addQuestion}
            >
              <Plus size={16} />
              Add another question
            </button>
          </section>

          {/* Submit */}
          <div className="create-actions">
            <Button type="button" variant="secondary" onClick={() => navigate("/quizzes")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {loading ? "Publishing…" : "Publish quiz"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
