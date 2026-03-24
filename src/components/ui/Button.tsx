import React from 'react';

// Tipamos las propiedades que puede recibir nuestro botón
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    fullWidth?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) => {

    // Clases base (transiciones suaves, redondeo, texto centrado)
    const baseClasses = "inline-flex justify-center items-center rounded-lg px-4 py-2 font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    // Clases dinámicas según la variante
    const variantClasses = {
        primary: "bg-fitbox-red text-white hover:bg-fitbox-red-hover shadow-lg shadow-red-500/20",
        secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
        danger: "bg-red-900 text-red-100 hover:bg-red-800",
        ghost: "bg-transparent text-fitbox-text hover:bg-neutral-800"
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};