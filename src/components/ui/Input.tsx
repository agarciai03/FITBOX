import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string; // Si hay error, lo pintaremos en rojo
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="flex flex-col w-full gap-1 mb-4">
                <label className="text-sm font-medium text-fitbox-text-muted">
                    {label}
                </label>

                <input
                    ref={ref}
                    className={`
            bg-[#1e2028] border rounded-lg px-4 py-3 text-fitbox-text 
            focus:outline-none focus:ring-2 focus:ring-fitbox-red/50 transition-all
            ${error ? 'border-fitbox-red' : 'border-neutral-800 focus:border-fitbox-red'}
            ${className}
            `}
                    {...props}
                />

                {/* Renderizado condicional del error */}
                {error && (
                    <span className="text-xs font-medium text-fitbox-red mt-1">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';