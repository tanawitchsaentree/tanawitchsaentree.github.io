/**
 * AnalyticsManager - Bridges LumoAI events to Google Analytics (GA4)
 */

declare global {
    interface Window {
        gtag: (command: string, eventName: string, eventParams?: any) => void;
        dataLayer: any[];
    }
}

export const AnalyticsManager = {
    /**
     * Log a specific event to GA4
     * @param eventName - The action name (e.g., 'lumo_intent', 'lumo_click')
     * @param params - Additional metadata
     */
    logEvent: (eventName: string, params: Record<string, any> = {}) => {
        // Check if running in browser with GA initialized
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, params);
        } else {
            // Dev mode / No GA fallback
            console.log(`[📊 Analytics] ${eventName}:`, params);
        }
    },

    /**
     * Track a user intent (Question asked)
     */
    trackIntent: (intent: string, confidence: number, entities: string[]) => {
        AnalyticsManager.logEvent('lumo_intent', {
            intent_name: intent,
            confidence: confidence,
            entities: entities.join(',')
        });
    },

    /**
     * Track a direct command (Button click)
     */
    trackCommand: (command: string) => {
        AnalyticsManager.logEvent('lumo_command', {
            command_name: command,
            source: 'button_click'
        });
    },

    /**
     * Track a lead generation event (Contact)
     */
    trackLead: (method: string) => {
        AnalyticsManager.logEvent('lumo_lead', {
            method: method
        });
    }
};
