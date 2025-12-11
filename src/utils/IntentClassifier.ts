/**
 * IntentClassifier - Advanced intent detection with semantic understanding
 */

import advancedIntents from '../data/advanced_intents.json';
import { FuzzyMatcher } from './FuzzyMatcher';

export interface IntentScore {
    intent: string;
    score: number;
    confidence: number;
    matchedKeywords: string[];
    matchedPatterns: string[];
}

export class IntentClassifier {
    private fuzzyMatcher: FuzzyMatcher;

    // Common slang/abbreviation mappings
    private slangMap: { [key: string]: string } = {
        'sklz': 'skills',
        'skil': 'skill',
        'wat': 'what',
        'wut': 'what',
        'wrk': 'work',
        'exp': 'experience',
        'xp': 'experience',
        'pls': 'please',
        'thx': 'thanks',
        'thnx': 'thanks',
        'u': 'you',
        'ur': 'your',
        'r': 'are',
        'y': 'why',
        'bc': 'because',
        'gud': 'good',
        'gd': 'good'
    };

    constructor() {
        this.fuzzyMatcher = new FuzzyMatcher(0.75);
    }

    /**
     * Classify user query and return top intents with scores
     */
    classify(query: string, context?: any): IntentScore[] {
        const scores: IntentScore[] = [];

        // Normalize query by replacing common slang
        let normalizedQuery = query.toLowerCase().trim();
        for (const [slang, proper] of Object.entries(this.slangMap)) {
            const slangRegex = new RegExp(`\\b${slang}\\b`, 'gi');
            normalizedQuery = normalizedQuery.replace(slangRegex, proper);
        }

        // Score each intent
        for (const [intentId, intentData] of Object.entries(advancedIntents.intents)) {
            const score = this.scoreIntent(normalizedQuery, intentData as any, context);
            if (score.score > 0) {
                scores.push({ intent: intentId, ...score });
            }
        }

        // Sort by score descending
        return scores.sort((a, b) => b.score - a.score);
    }

    /**
     * Get best matching intent
     */
    getBestIntent(query: string, context?: any): IntentScore | null {
        const scores = this.classify(query, context);
        return scores.length > 0 ? scores[0] : null;
    }

    /**
     * Score individual intent against query
     */
    private scoreIntent(query: string, intent: any, context?: any): Omit<IntentScore, 'intent'> {
        let score = 0;
        const matchedKeywords: string[] = [];
        const matchedPatterns: string[] = [];

        // 1. Primary keywords (high weight)
        if (intent.primary_keywords) {
            for (const keyword of intent.primary_keywords) {
                if (this.matchesKeyword(query, keyword)) {
                    score += 10;
                    matchedKeywords.push(keyword);
                }
            }
        }

        // 2. Secondary keywords (medium weight)
        if (intent.secondary_keywords) {
            for (const keyword of intent.secondary_keywords) {
                if (this.matchesKeyword(query, keyword)) {
                    score += 5;
                    matchedKeywords.push(keyword);
                }
            }
        }

        // 3. Synonyms (medium weight)
        if (intent.synonyms) {
            for (const [_, synonymList] of Object.entries(intent.synonyms)) {
                for (const synonym of synonymList as string[]) {
                    if (this.matchesKeyword(query, synonym)) {
                        score += 7;
                        matchedKeywords.push(synonym);
                    }
                }
            }
        }

        // 4. Semantic patterns (highest weight)
        if (intent.semantic_patterns) {
            for (const pattern of intent.semantic_patterns) {
                if (this.matchesPattern(query, pattern)) {
                    score += 15;
                    matchedPatterns.push(pattern);
                }
            }
        }

        // 5. Context boosters
        if (context && intent.context_boosters) {
            const booster = this.getContextBoost(intent.context_boosters, context);
            score *= booster;
        }

        // 6. Negative keywords (penalize)
        if (intent.negative_keywords) {
            for (const negKeyword of intent.negative_keywords) {
                if (query.includes(negKeyword)) {
                    score *= 0.3;
                }
            }
        }

        // Calculate confidence (0-1)
        const maxPossibleScore = 50; // Rough estimate
        const confidence = Math.min(score / maxPossibleScore, 1.0);

        return {
            score,
            confidence,
            matchedKeywords,
            matchedPatterns
        };
    }

    /**
     * Check if query matches keyword (with fuzzy matching)
     */
    private matchesKeyword(query: string, keyword: string): boolean {
        // Exact match
        if (query.includes(keyword.toLowerCase())) {
            return true;
        }

        // Fuzzy match with LOWER threshold for better typo tolerance
        const words = query.split(/\s+/);
        for (const word of words) {
            // More forgiving threshold: 0.65 instead of 0.8
            if (this.fuzzyMatcher.matches(word, keyword, 0.65)) {
                return true;
            }
            // Also check if keyword contains the word (partial match)
            if (keyword.toLowerCase().includes(word.toLowerCase()) && word.length >= 3) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if query matches semantic pattern
     */
    private matchesPattern(query: string, pattern: string): boolean {
        // Convert pattern to regex
        // Pattern: "tell me about {his|your} {work|career}"
        // Regex: "tell me about (his|your) (work|career)"

        const regexPattern = pattern
            .replace(/\{([^}]+)\}/g, '($1)') // Convert {a|b} to (a|b)
            .replace(/\s+/g, '\\s+'); // Allow flexible spacing

        const regex = new RegExp(regexPattern, 'i');
        return regex.test(query);
    }

    /**
     * Get context boost multiplier
     */
    private getContextBoost(boosters: any, context: any): number {
        let boost = 1.0;

        for (const [boosterKey, boosterValue] of Object.entries(boosters)) {
            if (context[boosterKey]) {
                boost *= boosterValue as number;
            }
        }

        return boost;
    }

    /**
     * Check if intent meets confidence threshold
     */
    meetsThreshold(intentScore: IntentScore): boolean {
        const intentData = (advancedIntents.intents as any)[intentScore.intent];
        const threshold = intentData?.confidence_threshold || 0.6;
        return intentScore.confidence >= threshold;
    }
}
