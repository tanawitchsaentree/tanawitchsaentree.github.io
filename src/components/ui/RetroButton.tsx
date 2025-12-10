import React, { type ButtonHTMLAttributes } from 'react';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export const RetroButton: React.FC<RetroButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    disabled,
    ...props
}) => {
    return (
        <button
            className={`
        relative
        inline-flex items-center justify-center
        px-4 py-1.5
        font-mono text-xs uppercase tracking-wide
        bg-[var(--background)] text-[var(--foreground)]
        transition-all duration-75
        active:translate-y-[1px]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
        retro-btn
        ${className}
      `}
            style={{
                border: '2px solid var(--primary)',
            }}
            disabled={disabled}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
            <style>
                {`
          .retro-btn {
            box-shadow: 
              inset 1px 1px 0px 0px #ffffff,
              inset -1px -1px 0px 0px #000000,
              2px 2px 0px 0px var(--primary);
          }
          .retro-btn:active:not(:disabled) {
            box-shadow: 
              inset 2px 2px 0px 0px #000000,
              inset -1px -1px 0px 0px #ffffff,
              1px 1px 0px 0px var(--primary) !important;
          }
        `}
            </style>
        </button>
    );
};
