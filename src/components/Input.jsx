import React from "react";
import "./Input.css";

export default function Input({
  label,
  id,
  error,
  hint,
  type = "text",
  required = false,
  className = "",
  ...rest
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input-field ${error ? "input-error" : ""}`}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        required={required}
        {...rest}
      />
      {hint && !error && <span id={`${id}-hint`} className="input-hint">{hint}</span>}
      {error && (
        <span id={`${id}-error`} className="input-error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({ label, id, error, hint, required = false, className = "", ...rest }) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <textarea
        id={id}
        className={`input-field textarea-field ${error ? "input-error" : ""}`}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        required={required}
        {...rest}
      />
      {hint && !error && <span id={`${id}-hint`} className="input-hint">{hint}</span>}
      {error && (
        <span id={`${id}-error`} className="input-error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function Select({ label, id, error, required = false, children, className = "", ...rest }) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <select
        id={id}
        className={`input-field select-field ${error ? "input-error" : ""}`}
        aria-invalid={!!error}
        required={required}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span id={`${id}-error`} className="input-error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
