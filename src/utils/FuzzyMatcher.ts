/**
 * FuzzyMatcher - Typo-tolerant string matching
 * Implements Levenshtein distance for fuzzy string comparison
 */

export class FuzzyMatcher {
    private threshold: number;

    constructor(threshold: number = 0.75) {
        this.threshold = threshold;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * Returns the minimum number of edits needed to transform s1 into s2
     */
    private levenshteinDistance(s1: string, s2: string): number {
        const len1 = s1.length;
        const len2 = s2.length;

        // Create distance matrix
        const matrix: number[][] = Array(len1 + 1)
            .fill(null)
            .map(() => Array(len2 + 1).fill(0));

        // Initialize first column and row
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        // Fill matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // deletion
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[len1][len2];
    }

    /**
     * Calculate similarity score between two strings (0-1)
     * 1 = identical, 0 = completely different
     */
    similarity(s1: string, s2: string): number {
        if (s1 === s2) return 1.0;
        if (!s1 || !s2) return 0.0;

        // Normalize strings
        const str1 = s1.toLowerCase().trim();
        const str2 = s2.toLowerCase().trim();

        if (str1 === str2) return 1.0;

        const distance = this.levenshteinDistance(str1, str2);
        const maxLen = Math.max(str1.length, str2.length);

        return 1 - distance / maxLen;
    }

    /**
     * Check if two strings match within threshold
     */
    matches(s1: string, s2: string, customThreshold?: number): boolean {
        const threshold = customThreshold ?? this.threshold;
        return this.similarity(s1, s2) >= threshold;
    }

    /**
     * Find best match from array of candidates
     * Returns {match: string, score: number} or null
     */
    findBestMatch(
        query: string,
        candidates: string[],
        minScore?: number
    ): { match: string; score: number } | null {
        const threshold = minScore ?? this.threshold;
        let bestMatch: { match: string; score: number } | null = null;

        for (const candidate of candidates) {
            const score = this.similarity(query, candidate);
            if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { match: candidate, score };
            }
        }

        return bestMatch;
    }

    /**
     * Find all matches above threshold
     * Returns array of {match: string, score: number} sorted by score
     */
    findAllMatches(
        query: string,
        candidates: string[],
        minScore?: number
    ): Array<{ match: string; score: number }> {
        const threshold = minScore ?? this.threshold;
        const matches: Array<{ match: string; score: number }> = [];

        for (const candidate of candidates) {
            const score = this.similarity(query, candidate);
            if (score >= threshold) {
                matches.push({ match: candidate, score });
            }
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * Phonetic matching using double metaphone algorithm (simplified)
     * Groups similar-sounding words
     */
    soundsLike(s1: string, s2: string): boolean {
        // Simplified phonetic rules
        const phonetic = (str: string): string => {
            return str
                .toLowerCase()
                .replace(/ph/g, 'f')
                .replace(/ck/g, 'k')
                .replace(/[aeiou]+/g, 'a') // Reduce vowels
                .replace(/([a-z])\1+/g, '$1'); // Remove doubles
        };

        return phonetic(s1) === phonetic(s2);
    }

    /**
     * Partial match - check if query is substring of candidate
     */
    partialMatch(query: string, candidate: string): boolean {
        const q = query.toLowerCase().trim();
        const c = candidate.toLowerCase().trim();
        return c.includes(q) || q.includes(c);
    }

    /**
     * Smart match - combines fuzzy, phonetic, and partial matching
     */
    smartMatch(query: string, candidate: string): { matches: boolean; score: number; method: string } {
        // Exact match
        if (query.toLowerCase() === candidate.toLowerCase()) {
            return { matches: true, score: 1.0, method: 'exact' };
        }

        // Fuzzy match
        const fuzzyScore = this.similarity(query, candidate);
        if (fuzzyScore >= this.threshold) {
            return { matches: true, score: fuzzyScore, method: 'fuzzy' };
        }

        // Phonetic match
        if (this.soundsLike(query, candidate)) {
            return { matches: true, score: 0.8, method: 'phonetic' };
        }

        // Partial match
        if (this.partialMatch(query, candidate)) {
            const score = Math.min(query.length, candidate.length) / Math.max(query.length, candidate.length);
            if (score >= 0.6) {
                return { matches: true, score, method: 'partial' };
            }
        }

        return { matches: false, score: fuzzyScore, method: 'none' };
    }
}
