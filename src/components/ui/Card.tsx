import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`bg-fitbox-card border border-neutral-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
            {children}
        </div>
    );
};