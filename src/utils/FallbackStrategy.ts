/**
 * FallbackStrategy - Intelligent fallback responses for edge cases
 */

import fallbackResponses from '../data/fallback_responses.json';

interface Suggestion {
    label: string;
    payload: string;
    icon?: string;
}

export class FallbackStrategy {
    /**
     * Handle no-context scenario
     */
    handleNoContext(): { text: string; suggestions: Suggestion[] } {
        const responses = (fallbackResponses as any).no_context.responses;
        const selected = this.random(responses) as any;

        return {
            text: selected.text,
            suggestions: [
                { label: 'Experience', payload: "Experience" },
                { label: 'Skills', payload: "Skills" },
                { label: 'Quick Summary', payload: 'Quick Summary' }
            ]
        };
    }

    /**
     * Handle vague query
     */
    handleVagueQuery(): { text: string; action: string } {
        const responses = (fallbackResponses as any).vague_query.responses;
        const selected = this.random(responses) as any;

        return {
            text: selected.text,
            action: selected.action || 'surprise_query'
        };
    }

    /**
     * Handle low confidence
     */
    handleLowConfidence(): { text: string; suggestions: Suggestion[] } {
        const responses = (fallbackResponses as any).low_confidence.responses;
        const selected = this.random(responses) as any;

        return {
            text: `${selected.text}
• Work Experience & Projects
• Skills & Expertise
• Contact Information

What interests you?`,
            suggestions: [
                { label: 'Experience', payload: "Experience" },
                { label: 'Skills', payload: "Skills" },
                { label: 'Contact', payload: 'Contact' }
            ]
        };
    }

    /**
     * Handle gibberish
     */
    handleGibberish(): { text: string; suggestions: Suggestion[] } {
        const responses = (fallbackResponses as any).gibberish.responses;
        const selected = this.random(responses) as any;

        return {
            text: `${selected.text}
• Experience & Projects
• Skills & Expertise
• Contact Info`,
            suggestions: [
                { label: 'Experience', payload: "Experience" },
                { label: 'Skills', payload: "Skills" },
                { label: 'Quick Tour', payload: 'Quick Summary' }
            ]
        };
    }

    /**
     * Handle too broad query
     */
    handleTooBroad(): { text: string; suggestions: Suggestion[] } {
        return {
            text: "That's a lot to cover! Let's start with what interests you most:",
            suggestions: [
                { label: 'Quick Summary', payload: 'Quick Summary' },
                { label: 'Experience', payload: 'Experience' },
                { label: 'Skills', payload: 'Skills' }
            ]
        };
    }

    /**
     * Get random item from array
     */
    private random<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }
}
