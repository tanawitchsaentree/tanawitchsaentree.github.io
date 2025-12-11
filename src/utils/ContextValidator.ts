/**
 * ContextValidator - Validates if queries make sense given conversation state
 */

export interface ValidationResult {
    isValid: boolean;
    reason?: 'no_context' | 'first_message' | 'ambiguous' | 'missing_reference';
    suggestion?: string;
}

export class ContextValidator {
    /**
     * Validate if "tell me more" type query has context
     */
    validateFollowUp(
        queryType: string,
        conversationHistory: any[]
    ): ValidationResult {
        // Check if this is a follow-up query
        const isFollowUp = ['follow_up_more', 'follow_up_previous', 'follow_up_next'].includes(queryType);

        if (!isFollowUp) {
            return { isValid: true };
        }

        // Check if we have conversation history
        if (!conversationHistory || conversationHistory.length === 0) {
            return {
                isValid: false,
                reason: 'no_context',
                suggestion: "I'd love to tell you more! What would you like to know about?"
            };
        }

        // Valid - has context
        return { isValid: true };
    }

    /**
     * Validate if reference has a target
     */
    validateReference(
        hasReference: boolean,
        lastTopic: string | null
    ): ValidationResult {
        if (!hasReference) {
            return { isValid: true };
        }

        if (!lastTopic) {
            return {
                isValid: false,
                reason: 'missing_reference',
                suggestion: "What would you like to know more about?"
            };
        }

        return { isValid: true };
    }

    /**
     * Check if query is too vague
     */
    isVague(query: string): boolean {
        const vagueTriggers = [
            'something',
            'anything',
            'whatever',
            'idk',
            'dunno',
            'random'
        ];

        const normalized = query.toLowerCase().trim();
        return vagueTriggers.some(trigger => normalized.includes(trigger));
    }

    /**
     * Detect gibberish
     */
    isGibberish(query: string): boolean {
        const normalized = query.toLowerCase().trim();

        // Common gibberish patterns
        const gibberishPatterns = ['asdf', 'qwer', 'zxcv', 'jkl', 'fdsa', 'asd'];
        if (gibberishPatterns.some(pattern => normalized.includes(pattern))) {
            return true;
        }

        // Check vowel ratio (gibberish typically has low vowels)
        const vowels = (normalized.match(/[aeiou]/g) || []).length;
        const consonants = (normalized.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
        const total = vowels + consonants;

        if (total > 5 && vowels / total < 0.15) {
            return true;
        }

        // Check for excessive consonant streaks
        if (/[bcdfghjklmnpqrstvwxyz]{6,}/.test(normalized)) {
            return true;
        }

        return false;
    }
}
