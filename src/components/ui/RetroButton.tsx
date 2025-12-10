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
        border-[1.5px] border-[var(--primary)]
        rounded-[var(--radius)]
        transition-all duration-150 ease-out
        
        /* Modern Retro Shadow: Subtle, Hard, Respects Radius */
        shadow-[2px_2px_0px_0px_var(--primary)]
        
        /* Hover: Lift */
        hover:-translate-y-[1px]
        hover:shadow-[3px_3px_0px_0px_var(--primary)]
        
        /* Active: Press */
        active:translate-y-[1px]
        active:shadow-[1px_1px_0px_0px_var(--primary)]
        
        /* Disabled */
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:transform-none disabled:shadow-none
        
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
