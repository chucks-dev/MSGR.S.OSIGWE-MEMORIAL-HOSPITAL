"use client";

import { useId, useState } from "react";
import { Icon } from "./Icons";

/** Wraps a label, control, hint and error message with correct ARIA wiring. */
export function Field({ label, error, hint, children, id }) {
  return (
    <div className={`field${error ? " invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && (
        <span className="hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="error-text" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function TextField({ label, name, error, hint, type = "text", ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <input
        id={id}
        name={name}
        type={type}
        className="input"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
    </Field>
  );
}

export function TextArea({ label, name, error, hint, ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <textarea
        id={id}
        name={name}
        className="textarea"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
    </Field>
  );
}

export function SelectField({ label, name, error, hint, children, ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <select
        id={id}
        name={name}
        className="select"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
}

/** Password input, hidden by default, with an eye button to show or hide it. */
export function PasswordField({ label, name, error, hint, autoComplete, ...rest }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <div className="pw-wrap">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className="input"
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...rest}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <Icon name={visible ? "eyeOff" : "eye"} />
        </button>
      </div>
    </Field>
  );
}

export function Checkbox({ label, name, ...rest }) {
  const id = useId();
  return (
    <div className="check">
      <input id={id} name={name} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
