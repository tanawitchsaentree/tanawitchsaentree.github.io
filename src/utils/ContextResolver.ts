/**
 * ContextResolver - The "Reasoning" Unit 🧠
 * Resolves ambiguous references ("it", "that", "them") using weighted scoring.
 */

import { ContextManager, type EntityItem } from './ContextManager';

interface ScoredCandidate {
    entity: EntityItem;
    score: number;
    breakdown: {
        recency: number;
        topic: number;
        mention: number;
    };
}

export interface ResolutionResult {
    resolvedEntity: EntityItem | null;
    confidence: number;
    isAmbiguous: boolean;
    clarificationNeeded?: boolean;
    candidates?: ScoredCandidate[];
}

export class ContextResolver {
    private contextManager: ContextManager;

    // SCORING WEIGHTS (Total 1.0)
    private readonly WEIGHTS = {
        RECENCY: 0.2,   // How recently was it added to stack?
        TOPIC: 0.3,     // Does it match the active topic?
        MENTION: 0.5    // Is it explicitly mentioned in CURRENT query? (Partial match)
    };

    constructor(contextManager: ContextManager) {
        this.contextManager = contextManager;
    }

    /**
     * Resolve references in a query
     * @param query User's current query ("Tell me more about it")
     */
    resolve(query: string): ResolutionResult {
        const context = this.contextManager.getContext();
        const stack = context.entityStack;

        if (stack.length === 0) {
            return {
                resolvedEntity: null,
                confidence: 0,
                isAmbiguous: false
            };
        }

        // 1. Score all candidates in the stack
        const candidates: ScoredCandidate[] = stack.map((entity, index) => {
            const breakdown = {
                recency: this.calculateRecencyScore(index),
                topic: this.calculateTopicScore(entity, context.activeTopic?.name),
                mention: this.calculateMentionScore(query, entity.value)
            };

            const score =
                (breakdown.recency * this.WEIGHTS.RECENCY) +
                (breakdown.topic * this.WEIGHTS.TOPIC) +
                (breakdown.mention * this.WEIGHTS.MENTION);

            return { entity, score, breakdown };
        });

        // 2. Sort by Score Descending
        candidates.sort((a, b) => b.score - a.score);

        if (candidates.length === 0) return { resolvedEntity: null, confidence: 0, isAmbiguous: false };

        const topCandidate = candidates[0];

        // 3. Ambiguity Check
        // If the gap between #1 and #2 is too small, we need clarification.
        let isAmbiguous = false;
        if (candidates.length > 1) {
            const secondCandidate = candidates[1];
            const scoreGap = topCandidate.score - secondCandidate.score;

            // If gap is less than 0.3, it's ambiguous
            if (scoreGap < 0.3) {
                isAmbiguous = true;
            }
        }

        return {
            resolvedEntity: topCandidate.entity,
            confidence: topCandidate.score,
            isAmbiguous,
            clarificationNeeded: isAmbiguous && topCandidate.score < 0.8, // Only clarify if not super confident
            candidates: candidates.slice(0, 3) // Return top 3 for debug/choice
        };
    }

    /**
     * Score Calculation Helpers
     */

    // Recency: 1.0 for top of stack, decays by position
    private calculateRecencyScore(index: number): number {
        // Linear decay: 1, 0.9, 0.8...
        return Math.max(0, 1 - (index / 10));
    }

    // Topic: 1.0 if it matches the active topic type/name
    private calculateTopicScore(entity: EntityItem, activeTopic: string | undefined): number {
        if (!activeTopic) return 0;
        // Simple string match for now
        return entity.value.toLowerCase().includes(activeTopic.toLowerCase()) ? 1 : 0;
    }

    // Mention: 1.0 if the entity value is partially in the current query
    private calculateMentionScore(query: string, entityValue: string): number {
        return query.toLowerCase().includes(entityValue.toLowerCase()) ? 1 : 0;
    }
}
