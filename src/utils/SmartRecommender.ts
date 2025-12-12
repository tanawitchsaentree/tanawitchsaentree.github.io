/**
 * SmartRecommender - Generates intelligent recommendations based on user profile
 */

import type { UserProfile } from './UserProfiler';

interface Recommendation {
    message: string;
    suggestions: Array<{ label: string; payload: string }>;
}

export class SmartRecommender {
    /**
     * Get smart recommendation based on user profile
     */
    getRecommendation(profile: UserProfile): Recommendation | null {
        // If asked about 1 specific company → suggest others
        if (profile.companyInterest.length === 1) {
            return this.recommendRelatedCompanies(profile.companyInterest[0]);
        }

        // If asked about 1 specific skill → suggest projects
        if (profile.skillInterest.length === 1) {
            return this.recommendRelatedProjects(profile.skillInterest[0]);
        }

        // If many experience queries → offer deep dive
        const expQueries = profile.topicsExplored.filter(t =>
            t.includes('experience') || t.includes('company')
        ).length;

        if (expQueries >= 3) {
            return this.recommendDeepDive();
        }

        // If casual style → offer surprises
        if (profile.conversationStyle === 'casual' && profile.questionCount > 2) {
            return this.recommendSurprise();
        }

        return null;
    }

    /**
     * Recommend related companies
     */
    private recommendRelatedCompanies(company: string): Recommendation {
        const otherCompanies: Record<string, string> = {
            'Allianz': 'Invitrace',
            'Invitrace': 'Allianz',
            'allianz': 'Invitrace',
            'invitrace': 'Allianz'
        };

        const related = otherCompanies[company] || 'other companies';

        return {
            message: `Since you're interested in ${company}, you might also want to know about his work at ${related}!`,
            suggestions: [
                { label: `${related} Work`, payload: `Tell me about ${related}` },
                { label: 'Skills Used', payload: 'What skills did he use?' },
                { label: 'Projects', payload: 'Show me projects' }
            ]
        };
    }

    /**
     * Recommend related projects
     */
    private recommendRelatedProjects(skill: string): Recommendation {
        return {
            message: `Diving into ${skill}? Check out the award-winning projects he's built!`,
            suggestions: [
                { label: 'Projects', payload: 'Show me his projects' },
                { label: 'Experience', payload: 'Where has he worked?' },
                { label: 'Other Skills', payload: 'What else can he do?' }
            ]
        };
    }

    /**
     * Recommend deep dive
     */
    private recommendDeepDive(): Recommendation {
        return {
            message: "You seem interested in the full story - want a comprehensive overview?",
            suggestions: [
                { label: 'Deep Dive', payload: 'Tell me everything' },
                { label: 'Quick Summary', payload: 'Give me the highlights' },
                { label: 'Specific Projects', payload: 'Show me specific projects' }
            ]
        };
    }

    /**
     * Recommend surprise
     */
    private recommendSurprise(): Recommendation {
        return {
            message: "Want to hear something unexpected?",
            suggestions: [
                { label: 'Surprise Me', payload: 'Tell me something surprising' },
                { label: 'Fun Facts', payload: 'Any fun facts?' },
                { label: 'Projects', payload: 'Show me cool projects' }
            ]
        };
    }

    /**
     * Personalize suggestion order based on profile
     */
    personalizeOrder(
        suggestions: Array<{ label: string; payload: string }>,
        profile: UserProfile
    ): Array<{ label: string; payload: string }> {
        const scored = suggestions.map(sug => ({
            ...sug,
            score: this.scoreSuggestion(sug, profile)
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .map(({ label, payload }) => ({ label, payload }));
    }

    /**
     * Score suggestion based on profile
     */
    private scoreSuggestion(
        suggestion: { label: string; payload: string },
        profile: UserProfile
    ): number {
        let score = 0;

        const label = suggestion.label.toLowerCase();

        // Prefer content type they've shown interest in
        if (profile.preferredContentType === 'experience' && label.includes('experience')) {
            score += 10;
        }
        if (profile.preferredContentType === 'skills' && label.includes('skill')) {
            score += 10;
        }
        if (profile.preferredContentType === 'projects' && label.includes('project')) {
            score += 10;
        }

        // Penalize already clicked suggestions
        if (profile.clickedSuggestions.includes(suggestion.label)) {
            score -= 5;
        }

        // Prefer quick summaries for quick users
        if (profile.preferredDepth === 'quick' && label.includes('quick')) {
            score += 5;
        }

        // Prefer detailed for detail-oriented users
        if (profile.preferredDepth === 'detailed' && (label.includes('deep') || label.includes('detail'))) {
            score += 5;
        }

        return score;
    }
}
