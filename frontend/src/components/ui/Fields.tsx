import React from 'react';
import './ui.css';

interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const Label: React.FC<{ label?: string; required?: boolean; htmlFor?: string }> = ({ label, required, htmlFor }) =>
  label ? (
    <label className="field-label" htmlFor={htmlFor}>
      {label}
      {required && <span className="field-required">*</span>}
    </label>
  ) : null;

const Feedback: React.FC<{ error?: string; helperText?: string }> = ({ error, helperText }) => {
  if (error) {
    return (
      <p className="field-error-text" role="alert">
        <span>⚠</span> {error}
      </p>
    );
  }
  if (helperText) return <p className="field-help">{helperText}</p>;
  return null;
};

export const Input: React.FC<InputProps> = ({ label, error, helperText, required, className = '', id, ...props }) => {
  const inputId = id || props.name;
  return (
    <div className="field-group">
      <Label label={label} required={required} htmlFor={inputId} />
      <input
        id={inputId}
        className={`field ${error ? 'field-error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      <span id={`${inputId}-error`}>
        <Feedback error={error} helperText={helperText} />
      </span>
    </div>
  );
};

export const Textarea: React.FC<TextareaProps> = ({ label, error, helperText, required, className = '', id, ...props }) => {
  const inputId = id || props.name;
  return (
    <div className="field-group">
      <Label label={label} required={required} htmlFor={inputId} />
      <textarea
        id={inputId}
        className={`field ${error ? 'field-error' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      <Feedback error={error} helperText={helperText} />
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  options,
  placeholder,
  id,
  ...props
}) => {
  const inputId = id || props.name;
  return (
    <div className="field-group">
      <Label label={label} required={required} htmlFor={inputId} />
      <select id={inputId} className={`field ${error ? 'field-error' : ''} ${className}`} aria-invalid={!!error} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Feedback error={error} helperText={helperText} />
    </div>
  );
};

export default Input;
