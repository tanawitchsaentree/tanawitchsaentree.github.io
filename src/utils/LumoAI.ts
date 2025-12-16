/**
 * LumoAI - Championship AI Engine
 * Connects all JSON brain files into intelligent, context-aware conversations
 */

import profileData from '../data/profile_data_enhanced.json';
import greetingSystem from '../data/greeting_system.json';
import conversationFlows from '../data/conversation_flows.json';

import { IntentClassifier } from './IntentClassifier';
import { EntityExtractor, type ExtractedEntity } from './EntityExtractor';
import { AnalyticsManager } from './AnalyticsManager';
import { searchEngine } from './SearchEngine';
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
    // searchEngine is imported as singleton
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
        // Force smart greeting suggestions (Contextual Menu)
        const smartSuggestions = this.generateSuggestions('greeting');

        return {
            message: selected.message,
            suggestions: smartSuggestions,
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
    generateResponse(query: string): { text: string; suggestions?: Suggestion[]; command?: { type: string; value: string } } {
        // 🧠 CEREBRO LAYER 0.5: Auto-Execute Intent (Priority Command)
        if (this.smallTalkHandler.detectAutoExecute(query)) {
            const response = this.handleSurpriseQuery();
            this.recordTurn(query, 'auto_execute', [], response.text);
            return response;
        }

        // 🧠 CEREBRO LAYER 1: Deep Understanding (Intent Classification)
        // Check intents deeply first - if we are sure, act on it.
        const intentScores = this.intentClassifier.classify(query, {
            userType: this.conversationState.userType,
            conversationDepth: this.conversationState.conversationDepth
        });
        // 🧠 CEREBRO LAYER 0: Direct Payload Router (Systemic Brain Repair)
        // Intercepts known button commands to bypass fuzzy classification
        const directResponse = this.executePayload(query);
        if (directResponse) {
            AnalyticsManager.trackCommand(query); // Track button click
            this.recordTurn(query, 'direct_command', [], directResponse.text);
            return directResponse;
        }

        // 🧠 CEREBRO LAYER 1: Extract Entities
        const entities = this.entityExtractor.extract(query);
        const bestIntent = intentScores[0];

        // High Confidence Shortcut (>0.6) -> Bypass heuristics if we are sure
        if (bestIntent && bestIntent.confidence > 0.6 && bestIntent.intent !== 'clarification_needed') {
            const response = this.executeIntent(bestIntent.intent, entities, query);
            if (response) {
                this.recordTurn(query, bestIntent.intent, entities, response.text);
                return response;
            }
        }

        // 🧠 CEREBRO LAYER 2: Check for small talk/social cues
        const smallTalk = this.smallTalkHandler.detect(query);
        if (smallTalk.isSmallTalk && smallTalk.response) {
            const response = {
                text: smallTalk.response,
                suggestions: this.generateSuggestions(undefined, 3)
            };
            this.recordTurn(query, `smalltalk_${smallTalk.type}`, [], response.text);
            return response;
        }

        // 🧠 CEREBRO LAYER 3: Check for gibberish
        if (this.contextValidator.isGibberish(query)) {
            const response = this.fallbackStrategy.handleGibberish();
            this.recordTurn(query, 'gibberish', [], response.text);
            return response;
        }

        // 🧠 CEREBRO LAYER 4: Check for vague queries
        if (this.contextValidator.isVague(query)) {
            const fallback = this.fallbackStrategy.handleVagueQuery();
            if (fallback.action === 'surprise_query') {
                const response = this.handleSurpriseQuery();
                this.recordTurn(query, 'vague_to_surprise', [], response.text);
                return response;
            }
            // For other fallback actions, return the fallback text
            return {
                text: fallback.text,
                suggestions: this.generateSuggestions(undefined, 3)
            };
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

        // Step 4: Check if we have decent confidence (Medium Confidence > threshold)
        if (bestIntent && this.intentClassifier.meetsThreshold(bestIntent)) {
            AnalyticsManager.trackIntent(bestIntent.intent, bestIntent.score, entities.map(e => e.value)); // Track Intent
            const response = this.executeIntent(bestIntent.intent, entities, query);
            if (response) {
                this.recordTurn(query, bestIntent.intent, entities, response.text);
                return response;
            }
        }

        // Step 5: CORTEX FALLBACK - Semantic Search for unknown queries
        // If we didn't understand the intent, maybe we can find keywords in the database?
        const searchResults = searchEngine.search(query);
        if (searchResults.length > 0 && searchResults[0].score > 1.5) {
            const bestMatch = searchResults[0];
            AnalyticsManager.trackEvent('lumo_search_fallback', { query, match: bestMatch.title });

            return {
                text: `I'm not 100% sure what you're asking, but I found this related to **"${query}"**:\n\n` +
                    `**${bestMatch.title}** (${bestMatch.company || bestMatch.type})\n${bestMatch.description}\n\n` +
                    `Is that what you were looking for?`,
                suggestions: this.smartRecommender ? this.smartRecommender.getContextualSuggestions('fallback') || [] : []
            };
        }

        // Step 6: Smart Fallback Strategylligent low confidence fallback
        const response = this.fallbackStrategy.handleLowConfidence();
        this.recordTurn(query, 'low_confidence', entities, response.text);
        return response;
    }

    /**
     * Router to execute specific intents
     */
    private executeIntent(intent: string, entities: any[], query?: string): { text: string; suggestions?: Suggestion[]; command?: { type: string; value: string } } | null {
        switch (intent) {
            case 'experience_query':
            case 'company_specific':
                return this.handleExperienceQuery(entities);
            case 'skills_query':
            case 'skill_specific':
                return this.handleSkillsQuery();
            case 'contact_query':
                return this.handleContactQuery();
            case 'surprise_query':
                return this.handleSurpriseQuery();
            case 'quick_summary':
                return this.handleQuickTour();
            case 'deep_dive':
                return this.handleDeepDive();
            case 'theme_change':
                return this.handleThemeChange(entities, query || '');
            default:
                return null;
        }
    }

    /**
     * Direct Payload Router - Deterministic execution for known buttons
     */
    private executePayload(query: string): { text: string; suggestions?: Suggestion[]; command?: { type: string; value: string } } | null {
        const normalized = query.toLowerCase().trim();

        switch (normalized) {
            case 'contact':
            case 'contact info':
            case 'email':
                return {
                    ...this.handleContactQuery(),
                    command: { type: 'scroll', value: 'contact-section' }
                };
            case 'experience':
            case 'work experience':
                return {
                    ...this.handleExperienceQuery(),
                    command: { type: 'scroll', value: 'experience-section' }
                };
            case 'skills':
            case 'other skills':
                return this.handleSkillsQuery();
            case 'quick summary':
            case 'give me the highlights':
                return this.handleQuickTour();
            case 'deep dive':
            case 'tell me everything':
                return this.handleDeepDive();
            case 'surprise me':
            case 'fun facts':
                return this.handleSurpriseQuery();
            case 'projects':
                return this.handleExperienceQuery(); // Route projects to experience

            // UI COMMANDS
            case 'scroll to top':
            case 'go to top':
            case 'start over':
                return {
                    text: "Back to the top!",
                    command: { type: 'scroll', value: 'profile-section' }
                };
            case 'download cv':
            case 'download resume':
            case 'get resume':
                return {
                    text: "Downloading my resume now...",
                    command: { type: 'download', value: 'resume' }
                };
            case 'toggle theme':
            case 'switch theme':
            case 'dark mode':
            case 'light mode':
                return {
                    text: "Switching visual mode.",
                    command: { type: 'theme', value: 'toggle' }
                };

            default:
                return null;
        }
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
        // 2. Check for Specific Entity (Company)
        // ... existing entity check ...

        // 3. CORTEX SEARCH: Integration Point
        // If we want to use search here, we would instantiate searchEngine.search()
        // For now, we rely on the generic summary fallback.

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
        AnalyticsManager.trackLead('chat_inquiry'); // Track Lead
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
     * Handle theme change
     */
    private handleThemeChange(_entities: ExtractedEntity[], query: string): { text: string; suggestions?: Suggestion[]; command?: { type: string; value: string } } {
        let theme = 'dark';
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('twilight')) theme = 'twilight';
        else if (lowerQuery.includes('light')) theme = 'light';
        else if (lowerQuery.includes('dark')) theme = 'dark';

        const emoji = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌇';

        return {
            text: `Switching to **${theme} mode**... ${emoji}`,
            command: { type: 'set_theme', value: theme },
            suggestions: []
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
                        suggestions: this.smartRecommender ? this.smartRecommender.getContextualSuggestions('fallback') || [] : []
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
    /**
     * Generate context-aware suggestions
     */
    private generateSuggestions(currentIntent?: string, _maxCount: number = 3): Suggestion[] {
        // Phase 6: Smart Silence Strategy
        // Only return suggestions if SmartRecommender has a specific context-aware set.
        if (currentIntent && this.smartRecommender) {
            const strictSuggestions = this.smartRecommender.getContextualSuggestions(currentIntent);
            if (strictSuggestions && strictSuggestions.length > 0) {
                // Determine if we need to personalize/reorder based on user profile
                // For now, strict suggestions are manually curated, so we keep them as is.
                return strictSuggestions;
            }
        }

        // Default to SILENCE (Empty array)
        // We no longer fallback to the generic suggestion pool to avoid "button spam".
        // If the AI has nothing specific to suggest, it should remain silent and let the chat content stand alone.
        return [];
    }

    /**
     * Get conversation state
     */
    getState(): ConversationState {
        return { ...this.conversationState };
    }
}
