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
     * Get strictly contextual suggestions (bypassing generic pool)
     */
    getContextualSuggestions(context: string): { label: string; payload: string; icon?: string }[] | null {
        switch (context) {
            case 'greeting':
                return [
                    { label: 'Quick Summary', payload: 'Quick Summary', icon: '⚡' },
                    { label: 'Work Experience', payload: 'Experience', icon: '💼' },
                    { label: 'Surprise Me', payload: 'Surprise Me', icon: '🎲' }
                ];
            case 'quick_summary':
                return [
                    { label: 'Deep Dive', payload: 'Deep Dive', icon: '🔍' },
                    { label: 'Contact', payload: 'Contact', icon: '📧' }
                ];
            case 'company_specific':
                // User already saw experience, don't ask "Experience?" again.
                // Offer deeper content or contact.
                return [
                    { label: 'Contact', payload: 'Contact', icon: '📧' }
                ];
            case 'surprise':
                return [
                    { label: 'Another One!', payload: 'Surprise Me', icon: '🎲' },
                    { label: 'Quick Summary', payload: 'Quick Summary', icon: '⚡' }
                ];
            case 'fallback':
                return [
                    { label: 'Try "Experience"', payload: 'Experience', icon: '💼' },
                    { label: 'Try "Skills"', payload: 'Skills', icon: '🛠️' }
                ];
            default:
                return null;
        }
    }

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
        // Fix: Stay on topic! Don't jump to another company immediately.
        // User wants to know more about THIS company.

        return {
            message: `Interested in his time at ${company}? There's deeper work to explore there.`,
            suggestions: [
                { label: `Projects at ${company}`, payload: `Show me projects at ${company}` },
                { label: `My Role at ${company}`, payload: `What was his role at ${company}?` },
                { label: `Challenges`, payload: `What challenges did he face at ${company}?` }
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
                { label: 'Projects', payload: 'Projects' },
                { label: 'Experience', payload: 'Experience' },
                { label: 'Other Skills', payload: 'Skills' }
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
                { label: 'Deep Dive', payload: 'Deep Dive' },
                { label: 'Quick Summary', payload: 'Quick Summary' },
                { label: 'Specific Projects', payload: 'Projects' }
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
                { label: 'Surprise Me', payload: 'Surprise Me' },
                { label: 'Fun Facts', payload: 'Surprise Me' },
                { label: 'Projects', payload: 'Projects' }
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
