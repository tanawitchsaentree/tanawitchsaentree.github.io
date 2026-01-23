import React, { useState, useEffect } from 'react';
import { RetroModal } from './ui/RetroModal';
import type { UIComponent, UIAction } from '../utils/LumoAI';
import { UIController } from '../utils/UIController';

export const DynamicUIRenderer: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState<UIComponent | null>(null);

    useEffect(() => {
        const handleRender = (e: CustomEvent) => {
            if (e.detail && e.detail.component) {
                setActiveComponent(e.detail.component);
            }
        };

        const handleClose = () => {
            setActiveComponent(null);
        };

        window.addEventListener('lumo-render-ui', handleRender as EventListener);
        window.addEventListener('lumo-close-ui', handleClose as EventListener);

        return () => {
            window.removeEventListener('lumo-render-ui', handleRender as EventListener);
            window.removeEventListener('lumo-close-ui', handleClose as EventListener);
        };
    }, []);

    const handleAction = (action: UIAction) => {
        // Handle different action types
        switch (action.type) {
            case 'link':
                window.open(action.payload, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(action.payload);
                // Could toast here
                break;
            case 'button':
                // For now, buttons just close. In future, they send commands back to brain.
                console.log('Action triggered:', action.payload);
                break;
        }
        // Auto-close on action? Maybe configurable. For now, yes unless specified.
        UIController.closeUI();
    };

    if (!activeComponent) return null;

    // Render based on type
    switch (activeComponent.type) {
        case 'modal':
            return (
                <RetroModal
                    component={activeComponent}
                    onClose={() => UIController.closeUI()}
                    onAction={handleAction}
                />
            );
        // Future: Add Card, Toast, Notification cases
        default:
            return null;
    }
};
