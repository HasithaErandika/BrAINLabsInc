import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 focus:bg-white placeholder:text-zinc-400 ${
            error ? 'border-black bg-zinc-50' : ''
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[10px] font-medium uppercase text-black italic">
            * {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
