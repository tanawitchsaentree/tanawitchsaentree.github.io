/**
 * UserProfiler - Builds and tracks user profiles from conversation behavior
 */

import type { ExtractedEntity } from './EntityExtractor';

export interface UserProfile {
    // Interests
    topicsExplored: string[];           // ["experience", "skills", "design_systems"]
    companyInterest: string[];          // ["Allianz", "Invitrace"]
    skillInterest: string[];            // ["Design Systems", "UX"]

    // Behavior
    conversationStyle: 'casual' | 'professional' | 'excited' | 'unknown';
    preferredDepth: 'quick' | 'medium' | 'detailed';
    questionCount: number;

    // Engagement
    sessionStartTime: number;
    totalTimeSpent: number;
    messageCount: number;

    // Preferences
    preferredContentType: 'experience' | 'skills' | 'projects' | 'mixed';
    clickedSuggestions: string[];       // Track what buttons they click

    // Returning user
    firstVisit: number;
    lastVisit: number;
    visitCount: number;
}

interface ConversationTurn {
    userQuery: string;
    intent: string;
    entities: ExtractedEntity[];
    response: string;
    timestamp: number;
}

export class UserProfiler {
    /**
     * Build profile from conversation history
     */
    buildProfile(history: ConversationTurn[], existingProfile?: UserProfile): UserProfile {
        const profile: UserProfile = existingProfile || this.createDefaultProfile();

        // Update visit tracking
        profile.lastVisit = Date.now();
        profile.messageCount = history.length;
        profile.totalTimeSpent = Date.now() - profile.sessionStartTime;

        // Analyze conversation
        for (const turn of history) {
            this.analyzeIntent(turn.intent, profile);
            this.analyzeEntities(turn.entities, profile);
            this.analyzeQuery(turn.userQuery, profile);
        }

        // Detect patterns
        profile.conversationStyle = this.detectStyle(history);
        profile.preferredDepth = this.detectDepth(history);
        profile.preferredContentType = this.detectContentPreference(profile);

        return profile;
    }

    /**
     * Create default profile
     */
    private createDefaultProfile(): UserProfile {
        const now = Date.now();
        return {
            topicsExplored: [],
            companyInterest: [],
            skillInterest: [],
            conversationStyle: 'unknown',
            preferredDepth: 'medium',
            questionCount: 0,
            sessionStartTime: now,
            totalTimeSpent: 0,
            messageCount: 0,
            preferredContentType: 'mixed',
            clickedSuggestions: [],
            firstVisit: now,
            lastVisit: now,
            visitCount: 1
        };
    }

    /**
     * Analyze intent to build interests
     */
    private analyzeIntent(intent: string, profile: UserProfile): void {
        // Track topics
        if (!profile.topicsExplored.includes(intent)) {
            profile.topicsExplored.push(intent);
        }

        profile.questionCount++;
    }

    /**
     * Analyze entities to extract interests
     */
    private analyzeEntities(entities: ExtractedEntity[], profile: UserProfile): void {
        for (const entity of entities) {
            if (entity.type === 'company_name' && !profile.companyInterest.includes(entity.value)) {
                profile.companyInterest.push(entity.value);
            }
            if (entity.type === 'skill_name' && !profile.skillInterest.includes(entity.value)) {
                profile.skillInterest.push(entity.value);
            }
        }
    }

    /**
     * Analyze query for behavioral patterns
     */
    private analyzeQuery(query: string, _profile: UserProfile): void {
        const lower = query.toLowerCase();

        // Detect asking for details
        if (lower.includes('detail') || lower.includes('more') || lower.includes('elaborate')) {
            // User likes depth
        }

        // Detect casual language
        if (lower.includes('lol') || lower.includes('yo') || lower.includes('wat')) {
            // Casual user
        }
    }

    /**
     * Detect conversation style from history
     */
    private detectStyle(history: ConversationTurn[]): 'casual' | 'professional' | 'excited' | 'unknown' {
        let casualScore = 0;
        let professionalScore = 0;
        let excitedScore = 0;

        for (const turn of history) {
            const query = turn.userQuery.toLowerCase();

            // Casual markers
            if (query.match(/\b(lol|haha|yo|sup|wat|thx)\b/)) {
                casualScore++;
            }

            // Professional markers
            if (query.length > 30 && !query.includes('!')) {
                professionalScore++;
            }

            // Excited markers
            if (query.includes('!') || query.toUpperCase() === query) {
                excitedScore++;
            }
        }

        const max = Math.max(casualScore, professionalScore, excitedScore);
        if (max === 0) return 'unknown';
        if (max === casualScore) return 'casual';
        if (max === excitedScore) return 'excited';
        return 'professional';
    }

    /**
     * Detect preferred depth
     */
    private detectDepth(history: ConversationTurn[]): 'quick' | 'medium' | 'detailed' {
        let detailRequests = 0;
        let quickRequests = 0;

        for (const turn of history) {
            const query = turn.userQuery.toLowerCase();
            if (query.includes('detail') || query.includes('more') || query.includes('deep')) {
                detailRequests++;
            }
            if (query.includes('quick') || query.includes('summary') || query.includes('tldr')) {
                quickRequests++;
            }
        }

        if (detailRequests > quickRequests) return 'detailed';
        if (quickRequests > detailRequests) return 'quick';
        return 'medium';
    }

    /**
     * Detect content preference
     */
    private detectContentPreference(profile: UserProfile): 'experience' | 'skills' | 'projects' | 'mixed' {
        const topics = profile.topicsExplored;

        const experienceCount = topics.filter(t =>
            t.includes('experience') || t.includes('company')
        ).length;

        const skillsCount = topics.filter(t =>
            t.includes('skill') || t.includes('design')
        ).length;

        const projectsCount = topics.filter(t =>
            t.includes('project')
        ).length;

        const max = Math.max(experienceCount, skillsCount, projectsCount);
        if (max === 0) return 'mixed';
        if (max === experienceCount) return 'experience';
        if (max === skillsCount) return 'skills';
        if (max === projectsCount) return 'projects';
        return 'mixed';
    }

    /**
     * Track suggestion click
     */
    trackClick(suggestionLabel: string, profile: UserProfile): void {
        if (!profile.clickedSuggestions.includes(suggestionLabel)) {
            profile.clickedSuggestions.push(suggestionLabel);
        }
    }
}
