import React, { type ButtonHTMLAttributes } from 'react';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isActive?: boolean;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    disabled,
    isActive,
    ...props
}) => {
    return (
        <button
            className={`
        relative
        inline-flex items-center justify-center
        px-4 py-2
        font-mono text-xs font-bold uppercase tracking-wider
        bg-[var(--background)] text-[var(--foreground)]
        border-2 border-[var(--primary)]
        transition-transform duration-100 ease-out
        
        shadow-[4px_4px_0px_0px_var(--primary)]
        
        hover:-translate-x-[1px] hover:-translate-y-[1px]
        hover:shadow-[5px_5px_0px_0px_var(--primary)]
        
        active:translate-x-[2px] active:translate-y-[2px]
        active:shadow-none
        
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:transform-none
        disabled:shadow-none
        
        ${className}
      `}
            disabled={disabled}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </button>
    );
};
