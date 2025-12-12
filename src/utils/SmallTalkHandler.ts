/**
 * SmallTalkHandler - Detects and handles casual conversation
 */

import smallTalkPatterns from '../data/smalltalk_patterns.json';

export interface SmallTalkResult {
    isSmallTalk: boolean;
    type?: 'greeting' | 'gratitude' | 'reaction' | 'affirmation' | 'farewell' | 'confusion' | 'encouragement';
    response?: string;
}

export class SmallTalkHandler {
    /**
     * Detect if query is small talk
     */
    detect(query: string): SmallTalkResult {
        const normalized = query.toLowerCase().trim();
        const patterns = smallTalkPatterns as any;

        // Check greetings
        if (this.matchesAny(normalized, patterns.greetings.triggers)) {
            return {
                isSmallTalk: true,
                type: 'greeting',
                response: this.random(patterns.greetings.responses)
            };
        }

        // Check gratitude
        if (this.matchesAny(normalized, patterns.gratitude.triggers)) {
            return {
                isSmallTalk: true,
                type: 'gratitude',
                response: this.random(patterns.gratitude.responses)
            };
        }

        // Check positive reactions
        if (this.matchesAny(normalized, patterns.reactions.positive.triggers)) {
            return {
                isSmallTalk: true,
                type: 'reaction',
                response: this.random(patterns.reactions.positive.responses)
            };
        }

        // Check laughter
        if (this.matchesAny(normalized, patterns.reactions.laughter.triggers)) {
            return {
                isSmallTalk: true,
                type: 'reaction',
                response: this.random(patterns.reactions.laughter.responses)
            };
        }

        // Check surprise
        if (this.matchesAny(normalized, patterns.reactions.surprise.triggers)) {
            return {
                isSmallTalk: true,
                type: 'reaction',
                response: this.random(patterns.reactions.surprise.responses)
            };
        }

        // Check affirmations
        if (this.matchesAny(normalized, patterns.affirmations.triggers)) {
            return {
                isSmallTalk: true,
                type: 'affirmation',
                response: this.random(patterns.affirmations.responses)
            };
        }

        // Check farewells
        if (this.matchesAny(normalized, patterns.farewells.triggers)) {
            return {
                isSmallTalk: true,
                type: 'farewell',
                response: this.random(patterns.farewells.responses)
            };
        }

        // Check confusion
        if (this.matchesAny(normalized, patterns.confusion.triggers)) {
            return {
                isSmallTalk: true,
                type: 'confusion',
                response: this.random(patterns.confusion.responses)
            };
        }

        // Check encouragement
        if (this.matchesAny(normalized, patterns.encouragement.triggers)) {
            return {
                isSmallTalk: true,
                type: 'encouragement',
                response: this.random(patterns.encouragement.responses)
            };
        }

        return { isSmallTalk: false };
    }

    /**
     * Detect if user wants AI to auto-pick content (not ask questions)
     */
    detectAutoExecute(query: string): boolean {
        const triggers = [
            'just tell me',
            'tell me something',
            'surprise me',
            'you pick',
            'you choose',
            'you decide',
            'bring it',
            'whatever',
            'anything is fine'
        ];

        const normalized = query.toLowerCase().trim();
        return triggers.some(trigger => normalized.includes(trigger));
    }

    /**
     * Check if query matches any trigger
     */
    private matchesAny(query: string, triggers: string[]): boolean {
        return triggers.some(trigger => {
            // Exact match or word boundary match
            return query === trigger ||
                query.includes(` ${trigger} `) ||
                query.startsWith(`${trigger} `) ||
                query.endsWith(` ${trigger}`);
        });
    }

    /**
     * Get random item from array
     */
    private random<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }
}
