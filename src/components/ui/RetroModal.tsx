import React from 'react';
import { X } from 'lucide-react';
import { RetroButton } from './RetroButton';
import type { UIComponent, UIAction } from '../../utils/LumoAI';

interface RetroModalProps {
    component: UIComponent;
    onClose: () => void;
    onAction: (action: UIAction) => void;
}

export const RetroModal: React.FC<RetroModalProps> = ({ component, onClose, onAction }) => {
    // Stop click propagation to prevent closing when clicking inside modal
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-[var(--card)] text-[var(--card-foreground)] border-2 border-[var(--foreground)] p-0 shadow-[8px_8px_0px_0px_var(--foreground)] animate-in zoom-in-95 duration-200"
                onClick={handleContentClick}
                style={{ borderRadius: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-[var(--foreground)] bg-[var(--muted)]">
                    <h3 className="font-mono font-bold text-lg uppercase tracking-wide">
                        {component.title || 'System Message'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Media */}
                    {component.media && (
                        <div className="w-full border-2 border-[var(--foreground)] overflow-hidden">
                            {component.media.type === 'image' ? (
                                <img
                                    src={component.media.url}
                                    alt={component.media.alt}
                                    className="w-full h-auto object-cover"
                                />
                            ) : (
                                <video
                                    src={component.media.url}
                                    controls
                                    className="w-full h-auto"
                                    poster={component.media.thumbnail}
                                />
                            )}
                            {component.media.caption && (
                                <p className="p-2 text-xs font-mono border-t-2 border-[var(--foreground)] bg-[var(--background)]">
                                    {component.media.caption}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Text Content */}
                    {component.body && (
                        <div className="prose prose-sm font-sans max-w-none text-[var(--foreground)] whitespace-pre-wrap">
                            {component.body}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {component.actions && component.actions.length > 0 && (
                    <div className="flex flex-wrap gap-4 p-6 pt-0 justify-end">
                        {component.actions.map((action, idx) => (
                            <RetroButton
                                key={idx}
                                variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                                onClick={() => onAction(action)}
                            >
                                {action.label}
                            </RetroButton>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
