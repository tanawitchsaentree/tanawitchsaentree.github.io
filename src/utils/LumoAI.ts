/**
 * LumoAI - Championship AI Engine
 * Connects all JSON brain files into intelligent, context-aware conversations
 */

import profileData from '../data/profile_data_enhanced.json';
import greetingSystem from '../data/greeting_system.json';
import conversationFlows from '../data/conversation_flows.json';

// Types
interface Suggestion {
    label: string;
    payload: string;
    icon?: string;
}

interface ConversationState {
    topicsDiscussed: string[];
    userType: string | null;
    responseLength: 'short' | 'medium' | 'detailed';
    emojiLevel: 'low' | 'medium' | 'high';
    conversationDepth: number;
}

export class LumoAI {
    private conversationState: ConversationState = {
        topicsDiscussed: [],
        userType: null,
        responseLength: 'medium',
        emojiLevel: 'medium',
        conversationDepth: 0
    };

    /**
     * Select greeting using weighted randomization
     */
    selectGreeting(): { message: string; suggestions: Suggestion[]; followUpId: string } {
        const hour = new Date().getHours();
        let timeContext: 'morning' | 'afternoon' | 'evening';

        if (hour >= 5 && hour <= 11) timeContext = 'morning';
        else if (hour >= 12 && hour <= 17) timeContext = 'afternoon';
        else timeContext = 'evening';

        const variants = greetingSystem.time_contexts[timeContext].variants;

        // Weighted random selection
        const selected = this.weightedRandom(variants);

        // Get suggestions
        const suggestions = selected.suggestions.map((key: string) => {
            const suggestion = (greetingSystem.suggestions as any)[key];
            return {
                label: suggestion.label,
                payload: suggestion.payload,
                icon: suggestion.icon || ''
            };
        });

        return {
            message: selected.message,
            suggestions,
            followUpId: selected.follow_up_id
        };
    }

    /**
     * Get follow-up message
     */
    getFollowUp(followUpId: string): { text: string; delay: number } | null {
        const followUp = (greetingSystem.follow_ups as any)[followUpId];
        if (!followUp) return null;

        return {
            text: followUp.text,
            delay: followUp.delay_ms
        };
    }

    /**
     * Detect user type based on behavior patterns
     */
    detectUserType(behavior: {
        timeOnPage?: number;
        scrollSpeed?: 'fast' | 'slow';
        sectionsVisited?: string[];
    }): string {
        // Simple heuristic - can be enhanced
        if (behavior.timeOnPage && behavior.timeOnPage < 120) {
            return 'recruiter';
        }
        if (behavior.scrollSpeed === 'slow' && behavior.sectionsVisited && behavior.sectionsVisited.length > 3) {
            return 'peer_designer';
        }
        return 'casual_browser';
    }

    /**
     * Generate intelligent response based on query
     */
    generateResponse(query: string): { text: string; suggestions?: Suggestion[] } {
        const lowerQuery = query.toLowerCase();

        // Experience query
        if (this.matchesKeywords(lowerQuery, ['experience', 'work', 'job', 'career', 'history'])) {
            return this.handleExperienceQuery();
        }

        // Skills query
        if (this.matchesKeywords(lowerQuery, ['skill', 'competenc', 'ability', 'expertise'])) {
            return this.handleSkillsQuery();
        }

        // Contact query
        if (this.matchesKeywords(lowerQuery, ['contact', 'email', 'reach', 'connect', 'linkedin'])) {
            return this.handleContactQuery();
        }

        // Surprise me query
        if (this.matchesKeywords(lowerQuery, ['surprise', 'random', 'fun', 'interesting'])) {
            return this.handleSurpriseQuery();
        }

        // Quick tour
        if (this.matchesKeywords(lowerQuery, ['quick', 'brief', 'tldr', 'summary', 'overview'])) {
            return this.handleQuickTour();
        }

        // Deep dive
        if (this.matchesKeywords(lowerQuery, ['detail', 'deep', 'more', 'tell me everything'])) {
            return this.handleDeepDive();
        }

        // Default fallback
        return {
            text: "I can tell you about Nate's experience, skills, or how to contact him. What interests you?",
            suggestions: [
                { label: 'Experience', payload: "Tell me about Nate's experience" },
                { label: 'Skills', payload: "What are Nate's skills?" },
                { label: 'Contact', payload: 'How can I contact Nate?' }
            ]
        };
    }

    /**
     * Handle experience query
     */
    private handleExperienceQuery(): { text: string; suggestions?: Suggestion[] } {
        const summary = profileData.experience.summary;
        const currentRole = profileData.experience.timeline[0]; // Most recent

        const text = `Nate's got ${summary.total_years} experience across ${summary.industries.join(', ')}. Currently ${currentRole.role.title} at ${currentRole.company.name}, where he's ${currentRole.storytelling.short}. Before that: award-winning fintech apps, COVID vaccine passports, and design systems across multiple companies.`;

        return {
            text,
            suggestions: [
                { label: 'Tell me more', payload: 'Tell me more about his experience' },
                { label: 'Skills', payload: "What are his skills?" },
                { label: 'Contact', payload: 'How can I contact him?' }
            ]
        };
    }

    /**
     * Handle skills query
     */
    private handleSkillsQuery(): { text: string; suggestions?: Suggestion[] } {
        const text = `Nate's expertise spans: Design Systems (he thinks in systems, not just screens), User Research (loves talking to users), Visual Design (photography background!), and Design Leadership (loves growing designers). He's expert-level in UX Strategy, IA, Interaction Design, and Cross-functional Collaboration.`;

        return {
            text,
            suggestions: [
                { label: 'Experience', payload: "Tell me about his experience" },
                { label: 'Projects', payload: 'Show me his projects' },
                { label: 'Contact', payload: 'How can I contact him?' }
            ]
        };
    }

    /**
     * Handle contact query
     */
    private handleContactQuery(): { text: string } {
        const contact = profileData.contact;

        return {
            text: `Best way to reach Nate: ${contact.primary.value}. Also on LinkedIn (${contact.social.linkedin.url}), Behance, and exploring on GitHub. He typically responds within 24-48 hours. Worth the wait though 😉`
        };
    }

    /**
     * Handle surprise query
     */
    private handleSurpriseQuery(): { text: string; suggestions?: Suggestion[] } {
        const surprises = conversationFlows.flows.surprise_me_adventure.surprises;
        const selected = this.weightedRandom(surprises);

        return {
            text: `${selected.content}\n\n${selected.followup}`,
            suggestions: [
                { label: 'Another!', payload: 'Tell me something else unexpected' },
                { label: 'Experience', payload: "Tell me about his experience" },
                { label: 'Contact', payload: 'Contact info' }
            ]
        };
    }

    /**
     * Handle quick tour
     */
    private handleQuickTour(): { text: string; suggestions?: Suggestion[] } {
        return {
            text: `TL;DR: Nate's a Lead Product Designer with 8+ years. Specializes in design systems, healthcare & fintech. Currently at Invitrace Health leading a design team. Built award-winning apps. Loves mentoring. Open to meaningful work. 🎯`,
            suggestions: [
                { label: 'Deep Dive', payload: 'Tell me everything' },
                { label: 'Skills', payload: 'What are his skills?' },
                { label: 'Contact', payload: 'How do I reach him?' }
            ]
        };
    }

    /**
     * Handle deep dive
     */
    private handleDeepDive(): { text: string; suggestions?: Suggestion[] } {
        const narrative = profileData.career_narrative;
        const currentExp = profileData.experience.timeline[0];

        return {
            text: `${narrative.elevator_pitch}\n\n${currentExp.storytelling.detailed}\n\nHis unique value: ${narrative.unique_value.join(', ')}. Career themes: always focused on ${narrative.career_themes.impact}.`,
            suggestions: [
                { label: 'Specific projects', payload: 'Tell me about specific projects' },
                { label: 'Skills breakdown', payload: 'Break down his skills' },
                { label: 'Contact', payload: 'How can I reach him?' }
            ]
        };
    }

    /**
     * Weighted random selection
     */
    private weightedRandom<T extends { weight: number }>(items: T[]): T {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= item.weight;
            if (random <= 0) return item;
        }

        return items[0]; // Fallback
    }

    /**
     * Check if query matches keywords
     */
    private matchesKeywords(query: string, keywords: string[]): boolean {
        return keywords.some(keyword => query.includes(keyword));
    }

    /**
     * Add easter egg based on context
     */
    addEasterEgg(): string | null {
        const hour = new Date().getHours();
        const day = new Date().getDay();

        // Late night easter egg
        if ((hour >= 23 || hour <= 4) && greetingSystem.easter_eggs.late_night) {
            return greetingSystem.easter_eggs.late_night.prefix.trim() + greetingSystem.easter_eggs.late_night.suffix;
        }

        // Weekend easter egg
        if ((day === 0 || day === 6) && greetingSystem.easter_eggs.weekend) {
            return greetingSystem.easter_eggs.weekend.prefix.trim() + greetingSystem.easter_eggs.weekend.suffix;
        }

        return null;
    }

    /**
     * Track conversation topic
     */
    trackTopic(topic: string): void {
        if (!this.conversationState.topicsDiscussed.includes(topic)) {
            this.conversationState.topicsDiscussed.push(topic);
            this.conversationState.conversationDepth++;
        }
    }

    /**
     * Get conversation state
     */
    getState(): ConversationState {
        return { ...this.conversationState };
    }
}
