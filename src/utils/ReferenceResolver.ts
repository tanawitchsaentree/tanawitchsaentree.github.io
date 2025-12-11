/**
 * ReferenceResolver - Detects and resolves conversational references
 */

import referencePatterns from '../data/reference_patterns.json';

export class ReferenceResolver {
    /**
     * Check if query contains references to previous conversation
     */
    detectReference(query: string): { hasReference: boolean; type: string | null; topic?: string } {
        const normalized = query.toLowerCase().trim();
        const patterns = (referencePatterns as any).reference_patterns;

        // Check pronouns
        for (const pronoun of patterns.pronouns.subject_references) {
            if (normalized === pronoun || normalized.includes(` ${pronoun} `)) {
                return { hasReference: true, type: 'pronoun_reference' };
            }
        }

        // Check "tell me more" patterns
        for (const phrase of patterns.follow_up_more.phrases) {
            if (normalized.includes(phrase)) {
                return { hasReference: true, type: 'follow_up_more' };
            }
        }

        // Check "before that" patterns
        for (const phrase of patterns.follow_up_previous.phrases) {
            if (normalized.includes(phrase)) {
                return { hasReference: true, type: 'follow_up_previous' };
            }
        }

        // Check "after that" patterns  
        for (const phrase of patterns.follow_up_next.phrases) {
            if (normalized.includes(phrase)) {
                return { hasReference: true, type: 'follow_up_next' };
            }
        }

        // Check context switch (what about X)
        const contextSwitchMatch = normalized.match(/(?:what|how) about (.+)/i);
        if (contextSwitchMatch) {
            return {
                hasReference: true,
                type: 'context_switch',
                topic: contextSwitchMatch[1].replace(/\?$/, '').trim()
            };
        }

        return { hasReference: false, type: null };
    }

    /**
     * Check if query is asking for more details on last topic
     */
    isFollowUpMore(query: string): boolean {
        const detection = this.detectReference(query);
        return detection.type === 'follow_up_more';
    }

    /**
     * Check if query is asking for previous item
     */
    isFollowUpPrevious(query: string): boolean {
        const detection = this.detectReference(query);
        return detection.type === 'follow_up_previous';
    }

    /**
     * Check if query is asking for next item
     */
    isFollowUpNext(query: string): boolean {
        const detection = this.detectReference(query);
        return detection.type === 'follow_up_next';
    }

    /**
     * Get random intro phrase for follow-up responses
     */
    getFollowUpIntro(type: string): string {
        const intros = (referencePatterns as any).follow_up_responses;

        switch (type) {
            case 'follow_up_more':
                const moreIntros = intros.more_details_intros;
                return moreIntros[Math.floor(Math.random() * moreIntros.length)];
            case 'follow_up_previous':
                const prevIntros = intros.chronological_previous;
                return prevIntros[Math.floor(Math.random() * prevIntros.length)];
            case 'follow_up_next':
                const nextIntros = intros.chronological_next;
                return nextIntros[Math.floor(Math.random() * nextIntros.length)];
            case 'context_switch':
                const switchIntros = intros.context_switch;
                return switchIntros[Math.floor(Math.random() * switchIntros.length)];
            default:
                return '';
        }
    }
}
