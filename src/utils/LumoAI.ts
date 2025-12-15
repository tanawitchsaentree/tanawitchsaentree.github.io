/**
 * LumoAI - Championship AI Engine
 * Connects all JSON brain files into intelligent, context-aware conversations
 */

import profileData from '../data/profile_data_enhanced.json';
import greetingSystem from '../data/greeting_system.json';
import conversationFlows from '../data/conversation_flows.json';
import suggestionEngine from '../data/suggestion_engine.json';
import { IntentClassifier } from './IntentClassifier';
import { EntityExtractor, type ExtractedEntity } from './EntityExtractor';
import { ReferenceResolver } from './ReferenceResolver';
import { SmallTalkHandler } from './SmallTalkHandler';
import { ContextValidator } from './ContextValidator';
import { FallbackStrategy } from './FallbackStrategy';
import { UserProfiler, type UserProfile } from './UserProfiler';
import { SmartRecommender } from './SmartRecommender';
import { SessionManager } from './SessionManager';

// Types
interface Suggestion {
    label: string;
    payload: string;
    icon?: string;
}

interface ConversationTurn {
    userQuery: string;
    intent: string;
    entities: ExtractedEntity[];
    response: string;
    timestamp: number;
}

interface ConversationState {
    topicsDiscussed: string[];
    userType: string | null;
    responseLength: 'short' | 'medium' | 'detailed';
    emojiLevel: 'low' | 'medium' | 'high';
    conversationDepth: number;
    // Phase 2: Conversation memory
    conversationHistory: ConversationTurn[];
    lastIntent: string | null;
    lastEntities: ExtractedEntity[];
    lastTopic: string | null;
    lastResponse: string | null;
    lastSurpriseContent: string | null; // Track last surprise content to avoid repeats
}

export class LumoAI {
    private conversationState: ConversationState = {
        topicsDiscussed: [],
        userType: null,
        responseLength: 'medium',
        emojiLevel: 'medium',
        conversationDepth: 0,
        // Phase 2: Initialize conversation memory
        conversationHistory: [],
        lastIntent: null,
        lastEntities: [],
        lastTopic: null,
        lastResponse: null,
        lastSurpriseContent: null
    };

    // Advanced AI components
    private intentClassifier: IntentClassifier;
    private entityExtractor: EntityExtractor;
    private referenceResolver: ReferenceResolver;
    // Phase 3: Cerebro modules
    private smallTalkHandler: SmallTalkHandler;
    private contextValidator: ContextValidator;
    private fallbackStrategy: FallbackStrategy;
    // Phase 4: Memory & Learning modules
    private userProfiler: UserProfiler;
    private smartRecommender: SmartRecommender;
    private sessionManager: SessionManager;
    private userProfile: UserProfile | null = null;

    constructor() {
        this.intentClassifier = new IntentClassifier();
        this.entityExtractor = new EntityExtractor();
        this.referenceResolver = new ReferenceResolver();
        // Phase 3: Initialize Cerebro
        this.smallTalkHandler = new SmallTalkHandler();
        this.contextValidator = new ContextValidator();
        this.fallbackStrategy = new FallbackStrategy();
        // Phase 4: Initialize Memory System
        this.userProfiler = new UserProfiler();
        this.smartRecommender = new SmartRecommender();
        this.sessionManager = new SessionManager();

        // Load existing session if available
        this.loadSession();
    }

    /**
     * Load session from localStorage
     */
    private loadSession(): void {
        const session = this.sessionManager.loadSession();
        if (session) {
            this.userProfile = this.sessionManager.incrementVisit(session.profile);
            this.conversationState.conversationHistory = session.conversationHistory;

            // Show welcome back message in console
            const welcomeMsg = this.sessionManager.getWelcomeMessage(this.userProfile);
            if (welcomeMsg) {
                console.log('[LumoAI] ' + welcomeMsg);
            }
        }
    }

    /**
     * Save current session
     */
    private saveSession(): void {
        if (this.userProfile) {
            this.sessionManager.saveSession(
                this.userProfile,
                this.conversationState.conversationHistory
            );
        }
    }

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
     * Generate intelligent response based on query - CEREBRO ORCHESTRATION
     */
    generateResponse(query: string): { text: string; suggestions?: Suggestion[] } {
        // 🧠 CEREBRO LAYER 1: Check for small talk/social cues FIRST
        const smallTalk = this.smallTalkHandler.detect(query);
        if (smallTalk.isSmallTalk && smallTalk.response) {
            const response = {
                text: smallTalk.response,
                suggestions: this.generateSuggestions(undefined, 3)
            };
            this.recordTurn(query, `smalltalk_${smallTalk.type}`, [], response.text);
            return response;
        }

        // 🧠 CEREBRO LAYER 1.5: Auto-Execute Intent (CRITICAL FIX)
        // User says "just tell me" = wants content NOW, not questions!
        if (this.smallTalkHandler.detectAutoExecute(query)) {
            const response = this.handleSurpriseQuery();
            this.recordTurn(query, 'auto_execute', [], response.text);
            return response;
        }

        // 🧠 CEREBRO LAYER 2: Check for gibberish
        if (this.contextValidator.isGibberish(query)) {
            const response = this.fallbackStrategy.handleGibberish();
            this.recordTurn(query, 'gibberish', [], response.text);
            return response;
        }

        // 🧠 CEREBRO LAYER 3: Check for vague queries
        if (this.contextValidator.isVague(query)) {
            const fallback = this.fallbackStrategy.handleVagueQuery();
            // Execute the action (e.g., surprise_query)
            if (fallback.action === 'surprise_query') {
                const response = this.handleSurpriseQuery();
                this.recordTurn(query, 'vague_to_surprise', [], response.text);
                return response;
            }
        }

        // PHASE 2: Check for references/follow-ups
        const reference = this.referenceResolver.detectReference(query);

        if (reference.hasReference && reference.type) {
            // 🧠 CEREBRO LAYER 4: Validate context before handling follow-up
            const validation = this.contextValidator.validateFollowUp(
                reference.type,
                this.conversationState.conversationHistory
            );

            if (!validation.isValid) {
                // No context for "tell me more" - use intelligent fallback
                const response = this.fallbackStrategy.handleNoContext();
                this.recordTurn(query, 'follow_up_no_context', [], response.text);
                return response;
            }

            // Valid context - handle follow-up
            const response = this.handleFollowUp(reference.type);
            this.recordTurn(query, 'follow_up', [], response.text);
            return response;
        }

        // Step 1: Use advanced intent classification
        const intentScores = this.intentClassifier.classify(query, {
            userType: this.conversationState.userType,
            conversationDepth: this.conversationState.conversationDepth
        });

        // Step 2: Extract entities for context
        const entities = this.entityExtractor.extract(query);

        // Step 3: Get best intent
        const bestIntent = intentScores[0];

        // Step 4: Check if we have good confidence
        if (!bestIntent || !this.intentClassifier.meetsThreshold(bestIntent)) {
            // 🧠 CEREBRO LAYER 5: Intelligent low confidence fallback
            const response = this.fallbackStrategy.handleLowConfidence();
            this.recordTurn(query, 'low_confidence', entities, response.text);
            return response;
        }

        // Step 5: Route to handler based on intent
        let response;
        switch (bestIntent.intent) {
            case 'experience_query':
            case 'company_specific':
                response = this.handleExperienceQuery(entities);
                break;
            case 'skills_query':
            case 'skill_specific':
                response = this.handleSkillsQuery();
                break;
            case 'contact_query':
                response = this.handleContactQuery();
                break;
            case 'surprise_query':
                response = this.handleSurpriseQuery();
                break;
            case 'quick_summary':
                response = this.handleQuickTour();
                break;
            case 'deep_dive':
                response = this.handleDeepDive();
                break;
            default:
                // 🧠 CEREBRO LAYER 6: Graceful fallback (should rarely hit)
                response = this.fallbackStrategy.handleNoContext();
        }

        // Record this turn in conversation history
        this.recordTurn(query, bestIntent.intent, entities, response.text);

        return response;
    }

    /**
     * Handle experience query - with entity awareness
     */
    private handleExperienceQuery(entities: any[] = []): { text: string; suggestions?: Suggestion[] } {
        const summary = profileData.experience.summary;
        const currentRole = profileData.experience.timeline[0]; // Most recent

        // Check for specific company mention
        const companyEntity = entities.find(e => e.type === 'company_name');
        if (companyEntity) {
            // Find the company in timeline
            const companyExp = profileData.experience.timeline.find(
                exp => exp.company.name.toLowerCase().includes(companyEntity.value.toLowerCase())
            );

            if (companyExp) {
                return {
                    text: `**${companyExp.role.title}** at **${companyExp.company.name}**
${companyExp.storytelling.medium}`,
                    suggestions: this.generateSuggestions('company_specific', 3)
                };
            }
        }

        const text = `Nate has **${summary.total_years} experience** across ${summary.industries.join(', ')}.

- **Current:** **${currentRole.role.title}** at **${currentRole.company.name}**
- **Focus:** ${currentRole.storytelling.short}
- **Past:** Award-winning fintech apps & COVID vaccine passports.`;

        return {
            text,
            suggestions: this.generateSuggestions('experience', 3)
        };
    }

    /**
     * Handle skills query
     */
    private handleSkillsQuery(): { text: string; suggestions?: Suggestion[] } {
        const text = `Nate's expertise spans key areas:

- **Design Systems:** Thinks in systems, not just screens
- **User Research:** Loves talking to users (validation over assumptions)
- **Visual Design:** Photography background = strong composition
- **Leadership:** Growing designers & leading cross-functional teams`;

        return {
            text,
            suggestions: this.generateSuggestions('skills', 3)
        };
    }

    /**
     * Handle contact query
     */
    private handleContactQuery(): { text: string } {
        const contact = profileData.contact;

        return {
            text: `**Let's connect!**

- **Email:** ${contact.primary.value}
- **LinkedIn:** [Nate's Profile](${contact.social.linkedin.url})
- **Other:** Behance & GitHub

He typically responds within **24-48 hours**. Worth the wait! 😉`
        };
    }

    /**
     * Handle surprise query
     */
    private handleSurpriseQuery(): { text: string; suggestions?: Suggestion[] } {
        const surprises = conversationFlows.flows.surprise_me_adventure.surprises;

        // Filter out the last shown surprise to prevent immediate repetition
        const candidates = this.conversationState.lastSurpriseContent
            ? surprises.filter(s => s.content !== this.conversationState.lastSurpriseContent)
            : surprises;

        // Fallback to full list if filter leaves nothing (unlikely)
        const pool = candidates.length > 0 ? candidates : surprises;

        const selected = this.weightedRandom(pool);

        // Track this surprise
        this.conversationState.lastSurpriseContent = selected.content;

        return {
            text: `${selected.content}\n\n${selected.followup}`,
            suggestions: this.generateSuggestions('surprise', 3)
        };
    }

    /**
     * Handle quick tour
     */
    private handleQuickTour(): { text: string; suggestions?: Suggestion[] } {
        return {
            text: `**TL;DR:** Nate's a **Lead Product Designer** with 8+ years experience.

- **Specialties:** Design Systems, Healthcare, Fintech
- **Current Role:** Lead at **Invitrace Health**
- **Achievements:** Built award-winning apps & scaleable systems
- **Passion:** Mentoring & inclusive design

Open to meaningful work. 🎯`,
            suggestions: this.generateSuggestions('quick_summary', 3)
        };
    }

    /**
     * Handle deep dive
     */
    private handleDeepDive(): { text: string; suggestions?: Suggestion[] } {
        const narrative = profileData.career_narrative;
        const currentExp = profileData.experience.timeline[0];

        return {
            text: `**${narrative.elevator_pitch}**

${currentExp.storytelling.detailed}

- **Unique Value:** ${narrative.unique_value.join(', ')}
- **Career Theme:** Always focused on **${narrative.career_themes.impact}**`,
            suggestions: this.generateSuggestions('deep_dive', 3)
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
     * Record conversation turn in history
     */
    private recordTurn(query: string, intent: string, entities: ExtractedEntity[], response: string): void {
        const turn: ConversationTurn = {
            userQuery: query,
            intent,
            entities,
            response,
            timestamp: Date.now()
        };

        this.conversationState.conversationHistory.push(turn);
        this.conversationState.lastIntent = intent;
        this.conversationState.lastEntities = entities;
        this.conversationState.lastTopic = intent;
        this.conversationState.lastResponse = response;

        // Keep only last 10 turns
        if (this.conversationState.conversationHistory.length > 10) {
            this.conversationState.conversationHistory.shift();
        }

        // Phase 4: Build user profile from conversation
        this.userProfile = this.userProfiler.buildProfile(
            this.conversationState.conversationHistory,
            this.userProfile || undefined
        );

        // Phase 4: Save session to localStorage
        this.saveSession();
    }

    /**
     * Handle follow-up queries based on conversation history
     */
    private handleFollowUp(referenceType: string): { text: string; suggestions?: Suggestion[] } {
        const lastIntent = this.conversationState.lastIntent;
        const lastResponse = this.conversationState.lastResponse;

        if (referenceType === 'follow_up_more') {
            // User wants more details on last topic
            const intro = this.referenceResolver.getFollowUpIntro('follow_up_more');

            switch (lastIntent) {
                case 'experience_query':
                    return {
                        text: `${intro} ${profileData.career_narrative.elevator_pitch}`,
                        suggestions: this.generateSuggestions('experience', 3)
                    };
                case 'skills_query':
                    return {
                        text: `${intro} Nate excels in Design Systems, User Research, Visual Design, and Leadership. Each skill is backed by 8+ years of hands-on experience.`,
                        suggestions: this.generateSuggestions('skills', 3)
                    };
                default:
                    return {
                        text: lastResponse || "I don't have more details on that at the moment.",
                        suggestions: this.generateSuggestions(lastIntent || undefined, 3)
                    };
            }
        }

        // Default fallback
        return {
            text: "I'm not sure what you'd like to know more about. Could you be more specific?",
            suggestions: this.generateSuggestions(undefined, 3)
        };
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
     * Generate context-aware suggestions
     */
    private generateSuggestions(currentIntent?: string, maxCount: number = 3): Suggestion[] {
        // Phase 5 Refactor: Check for strict contextual overrides first
        // If SmartRecommender has a specific set for this context, use it exclusively.
        if (currentIntent && this.smartRecommender) {
            const strictSuggestions = this.smartRecommender.getContextualSuggestions(currentIntent);
            if (strictSuggestions) {
                return strictSuggestions;
            }
        }

        const pool = (suggestionEngine as any).suggestion_engine.suggestion_pool;
        const candidates: Array<{ suggestion: Suggestion; score: number }> = [];

        // Get user type preferences
        const userType = this.conversationState.userType || 'casual_browser';
        const userPrefs = (suggestionEngine as any).suggestion_engine.user_type_preferences[userType] || {};
        const prioritizedTopics = userPrefs.prioritize || [];

        for (const [key, suggestionData] of Object.entries(pool)) {
            const data = suggestionData as any;
            let score = 10; // Base score

            // Already discussed? Skip or lower priority
            if (this.conversationState.topicsDiscussed.includes(key)) {
                if (data.hide_after?.includes(currentIntent || '')) {
                    continue; // Skip completely
                }
                score -= 20; // Lower priority
            }

            // Should show after current topic?
            if (currentIntent && data.show_after?.includes(currentIntent)) {
                score += 15;
            }

            // User type priority boost
            if (prioritizedTopics.includes(key)) {
                score += 10;
            }

            // Priority level boost
            if (data.priority === 'high') score += 5;
            if (data.priority === 'low') score -= 5;

            candidates.push({
                suggestion: {
                    label: data.label,
                    payload: data.payload,
                    icon: data.icon
                },
                score
            });
        }

        // Sort by score and return top N
        candidates.sort((a, b) => b.score - a.score);
        let finalSuggestions = candidates.slice(0, maxCount).map(c => c.suggestion);

        // Phase 4: Personalize based on profile
        if (this.userProfile) {
            finalSuggestions = this.smartRecommender.personalizeOrder(
                finalSuggestions,
                this.userProfile
            );
        }

        return finalSuggestions;
    }

    /**
     * Get conversation state
     */
    getState(): ConversationState {
        return { ...this.conversationState };
    }
}
