import React, { type ButtonHTMLAttributes, type CSSProperties } from 'react';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export const RetroButton: React.FC<RetroButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    disabled,
    style,
    ...props
}) => {
    const buttonStyle: CSSProperties = {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',

        // OUTLINE STYLE
        background: 'transparent',
        color: 'var(--foreground)',

        // Thick Border
        border: '2px solid var(--foreground)',
        borderRadius: '0',

        // Hard Shadow
        boxShadow: '4px 4px 0px 0px var(--foreground)',

        transition: 'all 75ms',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,

        ...style
    };

    return (
        <button
            className={`retro-btn ${className}`}
            style={buttonStyle}
            disabled={disabled}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '5px 5px 0px 0px var(--foreground)';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--foreground)';
                }
            }}
            onMouseDown={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '1px 1px 0px 0px var(--foreground)';
                }
            }}
            onMouseUp={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '5px 5px 0px 0px var(--foreground)';
                }
            }}
            {...props}
        >
            {children}
        </button>
    );
};
