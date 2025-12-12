/**
 * SessionManager - Manages session persistence with localStorage
 */

import type { UserProfile } from './UserProfiler';
import type { ExtractedEntity } from './EntityExtractor';

interface ConversationTurn {
    userQuery: string;
    intent: string;
    entities: ExtractedEntity[];
    response: string;
    timestamp: number;
}

interface SessionData {
    profile: UserProfile;
    conversationHistory: ConversationTurn[];
    timestamp: number;
}

export class SessionManager {
    private storageKey = 'lumo_ai_session';
    private maxHistorySize = 10;

    /**
     * Save session to localStorage
     */
    saveSession(profile: UserProfile, history: ConversationTurn[]): void {
        try {
            const data: SessionData = {
                profile,
                conversationHistory: history.slice(-this.maxHistorySize), // Keep last 10
                timestamp: Date.now()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            // localStorage might be disabled or full - fail silently
            console.warn('Failed to save session:', error);
        }
    }

    /**
     * Load session from localStorage
     */
    loadSession(): SessionData | null {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return null;

            const data: SessionData = JSON.parse(stored);

            // Check if session is still valid (within 24 hours)
            const dayInMs = 24 * 60 * 60 * 1000;
            if (Date.now() - data.timestamp > dayInMs) {
                // Session expired - clear it
                this.clearSession();
                return null;
            }

            return data;
        } catch (error) {
            console.warn('Failed to load session:', error);
            return null;
        }
    }

    /**
     * Check if user is returning
     */
    isReturningUser(): boolean {
        const session = this.loadSession();
        return session !== null && session.profile.visitCount > 0;
    }

    /**
     * Get welcome message for returning users
     */
    getWelcomeMessage(profile: UserProfile): string | null {
        if (profile.visitCount <= 1) return null;

        const lastVisit = profile.lastVisit;
        const daysSince = (Date.now() - lastVisit) / (1000 * 60 * 60 * 24);

        if (daysSince < 1) {
            return "Welcome back! Ready to pick up where we left off?";
        } else if (daysSince < 7) {
            return "Hey! Good to see you again! What interests you today?";
        } else {
            return "Welcome back! It's been a while - what would you like to explore?";
        }
    }

    /**
     * Clear session (privacy option)
     */
    clearSession(): void {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear session:', error);
        }
    }

    /**
     * Update visit count
     */
    incrementVisit(profile: UserProfile): UserProfile {
        return {
            ...profile,
            visitCount: profile.visitCount + 1,
            lastVisit: Date.now()
        };
    }
}
