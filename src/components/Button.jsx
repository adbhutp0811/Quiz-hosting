import React from "react";
import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-size-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
