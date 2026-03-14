import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input ref={ref} id={inputId} className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
});

export default Input;
