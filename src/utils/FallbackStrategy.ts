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
                { label: 'Experience', payload: "Tell me about Nate's experience" },
                { label: 'Skills', payload: "What are Nate's skills?" },
                { label: 'Quick Summary', payload: 'Give me a quick summary' }
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
                { label: 'Experience', payload: "Tell me about his experience" },
                { label: 'Skills', payload: "What are his skills?" },
                { label: 'Contact', payload: 'How can I contact him?' }
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
                { label: 'Experience', payload: "Tell me about his work" },
                { label: 'Skills', payload: "What can he do?" },
                { label: 'Quick Tour', payload: 'Give me the highlights' }
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
                { label: 'Quick Summary', payload: 'Give me the highlights first' },
                { label: 'Experience', payload: 'Start with experience' },
                { label: 'Skills', payload: 'Start with skills' }
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
