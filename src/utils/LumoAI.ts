/**
 * LumoAI - Championship AI Engine
 * Connects all JSON brain files
 */

import profileData from '../data/profile_data_enhanced.json';
import greetingSystem from '../data/greeting_system.json';
import conversationFlows from '../data/conversation_flows.json';
import { FlowEngine, type SessionToken } from './FlowEngine';
import { EnglishGrammarEngine } from './GrammarEngine';
import { ResponseCoordinator, type ResponseComponent } from './ResponseCoordinator';
import templates from '../data/templates.json';
import { knowledgeGraph } from './KnowledgeGraph';

import { IntentClassifier } from './IntentClassifier';
import { EntityExtractor, type ExtractedEntity } from './EntityExtractor';
import { AnalyticsManager } from './AnalyticsManager';
import { SearchEngine } from './SearchEngine'; // Changed from singleton import to class import

import { ReferenceResolver } from './ReferenceResolver';
import { SmallTalkHandler } from './SmallTalkHandler';
import { ContextValidator } from './ContextValidator';
import { FallbackStrategy } from './FallbackStrategy';
import { UserProfiler, type UserProfile } from './UserProfiler';
import { ContextManager } from './ContextManager';
import { ContextResolver } from './ContextResolver';
import { SmartRecommender } from './SmartRecommender';
import { SessionManager } from './SessionManager';


// Types
interface Suggestion {
    label: string;
    payload: string;
    icon?: string;
}

interface MediaContent {
    type: 'image' | 'video';
    url: string;
    alt: string;
    caption?: string;
    thumbnail?: string; // Added for video poster
}

// Phase 6: Dynamic UI Schema
export interface UIAction {
    label: string;
    type: 'button' | 'link' | 'copy';
    payload: string; // URL, command, or text to copy
    variant: 'primary' | 'secondary' | 'ghost';
    icon?: string; // Lucide icon name
}

export interface UIComponent {
    type: 'modal' | 'card' | 'notification' | 'toast';
    title?: string;
    subtitle?: string;
    body?: string; // Markdown supported
    media?: MediaContent;
    actions?: UIAction[];
    data?: any; // Flexible payload for specific components (e.g., chart data)
}

interface LumoResponse {
    text: string;
    suggestions?: Suggestion[];
    command?: { type: string; value: string };
    media?: MediaContent;
    ui?: UIComponent; // Phase 6: Dynamic UI Payload
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
    lastSurpriseContent: string | null;
    nudgeCount: number;
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
        lastSurpriseContent: null,
        nudgeCount: 0 // Track nudges for politeness
    };

    // Advanced AI components
    private intentClassifier: IntentClassifier;
    private entityExtractor: EntityExtractor;
    private smartRecommender: SmartRecommender;
    private smallTalkHandler: SmallTalkHandler;
    private searchEngine: SearchEngine; // Changed from singleton to instance

    private flowEngine: FlowEngine; // Added FlowEngine
    private sessionToken: SessionToken; // Added SessionToken
    private grammarEngine: EnglishGrammarEngine; // Module 6: Bard

    // v2.1 Context Modules
    private contextManager: ContextManager;
    private contextResolver: ContextResolver;

    // Legacy Support (Phase out later or keeping for specific needs)
    private referenceResolver: ReferenceResolver; // KEEPING for now as bridge

    // Phase 3: Cerebro modules
    private contextValidator: ContextValidator;
    private fallbackStrategy: FallbackStrategy;
    // Phase 4: Memory & Learning modules
    private userProfiler: UserProfiler;
    private sessionManager: SessionManager;
    private userProfile: UserProfile | null = null;

    constructor() {
        this.intentClassifier = new IntentClassifier();
        this.entityExtractor = new EntityExtractor();
        this.smartRecommender = new SmartRecommender();
        this.smallTalkHandler = new SmallTalkHandler();
        this.searchEngine = new SearchEngine(); // Instantiated SearchEngine


        // Module 5: Flow Engine
        this.flowEngine = new FlowEngine();
        this.sessionToken = this.flowEngine.createToken();

        this.grammarEngine = new EnglishGrammarEngine();

        // v2.1 Context System
        this.contextManager = new ContextManager();
        this.contextResolver = new ContextResolver(this.contextManager);

        this.referenceResolver = new ReferenceResolver();
        // Phase 3: Initialize Cerebro
        this.contextValidator = new ContextValidator();
        this.fallbackStrategy = new FallbackStrategy();
        // Phase 4: Initialize Memory System
        this.userProfiler = new UserProfiler();
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
    /**
     * Check for Global Interrupts (Escape Hatch)
     */
    private isGlobalInterrupt(query: string): boolean {
        const triggers = ['stop', 'restart', 'start over', 'home', 'main menu', 'help'];
        const normalized = query.toLowerCase().trim();
        return triggers.includes(normalized) || triggers.some(t => normalized === t);
    }

    /**
     * Handle Global Interrupt
     */
    private handleGlobalInterrupt(_query: string): LumoResponse {
        // Reset Flow Engine State
        this.sessionToken = this.flowEngine.createToken();

        return {
            text: "🛑 I've stopped the current topic. What would you like to do next?",
            suggestions: [
                { label: 'Start Over', payload: 'start over', icon: '🔄' },
                { label: 'Experience', payload: 'experience', icon: '💼' },
                { label: 'Chat', payload: 'hello', icon: '👋' }
            ]
        };
    }

    /**
     * Handle Debug Command
     */
    private handleDebug(): LumoResponse {
        const context = this.contextManager.getContext();
        const state = this.conversationState;

        const debugInfo = `
**🕷️ LumoAI Debug Console**

**🧠 Memory (Context v2.1)**
- **Active Topic:** ${context.activeTopic ? `**${context.activeTopic.name}** (${context.activeTopic.confidence.toFixed(2)})` : 'None'}
- **Entity Stack:** ${context.entityStack.length > 0 ? context.entityStack.map(e => `${e.value} (${e.expiresAfterTurns}t)`).join(', ') : 'Empty'}
- **History Depth:** ${context.history.length}/10

**📊 Logic State**
- **Last Intent:** ${context.recentIntents.length > 0 ? context.recentIntents[0].intent : 'None'}
- **Conversation Depth:** ${state.conversationDepth}
- **Session Token:** ${this.sessionToken?.currentNodeId || 'N/A'}

**📈 Health**
- **Latency Avg:** ${AnalyticsManager.getSessionMetrics().averageLatency.toFixed(0)}ms
- **Fallback Rate:** ${(AnalyticsManager.getSessionMetrics().fallbackRate * 100).toFixed(0)}%
        `.trim();

        return {
            text: debugInfo,
            suggestions: []
        };
    }

    /**
     * Parallel Check for Intent and SmallTalk (Async Wrapper)
     */
    private async parallelCheck(query: string): Promise<{ intent: any | null; smallTalk: any | null }> {
        // Wrap synchronous calls in Promises to allow future async expansion (v3.0)
        // and to treat them as independent parallel tasks.

        const checkIntent = new Promise<any>((resolve) => {
            try {
                const scores = this.intentClassifier.classify(query, {
                    userType: this.conversationState.userType,
                    conversationDepth: this.conversationState.conversationDepth
                });
                resolve(scores.length > 0 ? scores[0] : null);
            } catch (e) {
                console.error('Intent Classifier Error:', e);
                resolve(null);
            }
        });

        const checkSmallTalk = new Promise<any>((resolve) => {
            try {
                resolve(this.smallTalkHandler.detect(query));
            } catch (e) {
                console.error('SmallTalk Handler Error:', e);
                resolve(null);
            }
        });

        // Use Promise.allSettled to ensure individual failures don't crash the logic
        const [intentResult, smallTalkResult] = await Promise.allSettled([checkIntent, checkSmallTalk]);

        return {
            intent: intentResult.status === 'fulfilled' ? intentResult.value : null,
            smallTalk: smallTalkResult.status === 'fulfilled' ? smallTalkResult.value : null
        };
    }

    /**
     * Generate intelligent response based on query - CEREBRO ORCHESTRATION v2.1
     * With Error Handling & Timeout Protection
     */
    async generateResponse(query: string): Promise<LumoResponse> {
        try {
            // TIMEOUT PROTECTION (1.5s limit)
            const timeoutPromise = new Promise<LumoResponse>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 1500)
            );

            const startTime = Date.now();

            // CORE LOGIC WRAPPER
            const logicPromise = (async () => {
                // 1. Global Interrupts (Highest Priority)
                if (this.isGlobalInterrupt(query)) {
                    this.contextManager.reset(); // Reset Context
                    return this.handleGlobalInterrupt(query);
                }

                // DEBUG MODE (Phase 4.1)
                if (query.toLowerCase().trim() === '/debug') {
                    return this.handleDebug();
                }

                // Phase 6: Dynamic UI Demo Trigger
                if (query.toLowerCase().includes('render modal')) {
                    return {
                        text: "Initiating Dynamic UI sequence... Rendering Component [ID: MODAL-DEMO-01].",
                        ui: {
                            type: 'modal',
                            title: 'System Override',
                            body: "Dynamic UI Engine is online.\n\nThis component was generated purely from JSON data. No hardcoded React components were used for this specific instance.\n\nWe can now render:\n- Images/Videos\n- Markdown Text\n- Interactive Buttons",
                            media: {
                                type: 'image',
                                url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000&auto=format&fit=crop', // Cyberpunk code image
                                alt: 'System Core',
                                caption: 'Visualizing Neural Network'
                            },
                            actions: [
                                { label: 'Acknowledge', type: 'button', variant: 'primary', payload: 'close' },
                                { label: 'View Source', type: 'link', variant: 'secondary', payload: 'https://github.com/tanawitchsaentree' }
                            ]
                        }
                    };
                }

                // 2. Flow Engine (Scripted Conversations)
                const flowResult = this.flowEngine.process(this.sessionToken, query);
                if (flowResult.response) {
                    this.sessionToken = flowResult.nextToken;

                    // Track in Context Manager
                    this.contextManager.addMessage('user', query);
                    this.contextManager.addMessage('bot', flowResult.response.text);

                    return {
                        text: flowResult.response.text,
                        suggestions: flowResult.response.suggestions?.map(s => ({
                            label: s,
                            payload: s.toLowerCase(),
                            icon: '👉'
                        })),
                        command: flowResult.response.command
                    };
                }

                // 3. Direct Payload Router
                const directResponse = this.executePayload(query);
                if (directResponse) {
                    AnalyticsManager.trackCommand(query);
                    this.recordTurn(query, 'direct_command', [], directResponse.text);
                    this.contextManager.addMessage('user', query);
                    this.contextManager.addMessage('bot', directResponse.text);
                    return directResponse;
                }

                // 4. Parallel Check (Intent + Small Talk)
                const { intent, smallTalk } = await this.parallelCheck(query);
                const entities = this.entityExtractor.extract(query);

                // --- v2.1 CONTEXT RESOLUTION START ---
                // Try to resolve ambiguous pronouns "it", "that"
                const resolution = this.contextResolver.resolve(query);

                // 1. Handle Ambiguity (Clarification Strategy)
                if (resolution.isAmbiguous && resolution.candidates && resolution.candidates.length > 1) {
                    const c1 = resolution.candidates[0].entity.value;
                    const c2 = resolution.candidates[1].entity.value;

                    AnalyticsManager.trackEvent('context_ambiguity_triggered', { query, c1, c2 });

                    return {
                        text: `I'm not quite sure if you're referring to **${c1}** or **${c2}**. Could you clarify?`,
                        suggestions: [
                            { label: c1, payload: c1.toLowerCase(), icon: '👉' },
                            { label: c2, payload: c2.toLowerCase(), icon: '👉' }
                        ]
                    };
                }

                // 2. Apply Resolved Context
                // If we have a resolved entity and current intent is vague or specific "tell me more"
                if (resolution.resolvedEntity && resolution.confidence > 0.6) {
                    console.log('[Context] Resolved Entity:', resolution.resolvedEntity.value);
                    // Add to entities if not present
                    if (!entities.some(e => e.value === resolution.resolvedEntity!.value)) {
                        entities.push({
                            type: resolution.resolvedEntity.type,
                            value: resolution.resolvedEntity.value,
                            confidence: resolution.confidence,
                            position: 0
                        });
                    }
                }
                // --- v2.1 CONTEXT RESOLUTION END ---

                const components: ResponseComponent[] = [];

                if (smallTalk && smallTalk.isSmallTalk && smallTalk.response) {
                    components.push({ type: 'greeting', text: smallTalk.response });
                }

                if (intent && this.intentClassifier.meetsThreshold(intent)) {
                    const intentResponse = this.executeIntent(intent.intent, entities, query);
                    if (intentResponse) {
                        components.push({
                            type: 'intent',
                            text: intentResponse.text,
                            suggestions: intentResponse.suggestions,
                            command: intentResponse.command
                        });

                        // Track Intent in Context Manager
                        this.contextManager.trackIntent(intent.intent, intent.confidence);
                        // If intent relates to a specific topic (entity), set it as active topic
                        if (entities.length > 0) {
                            this.contextManager.setTopic(entities[0].value);
                            this.contextManager.addEntity(entities[0].type, entities[0].value);
                        }
                    }
                }

                if (components.length > 0) {
                    const coordinated = ResponseCoordinator.compose(components);
                    if (intent && this.intentClassifier.meetsThreshold(intent)) {
                        AnalyticsManager.trackIntent(intent.intent, intent.score, entities.map(e => e.value));
                    }

                    this.recordTurn(query, intent?.intent || 'small_talk', entities, coordinated.text);
                    this.contextManager.addMessage('user', query);
                    this.contextManager.addMessage('bot', coordinated.text);

                    return {
                        text: coordinated.text,
                        suggestions: coordinated.suggestions || this.generateSuggestions(undefined, 3),
                        command: coordinated.command
                    };
                }

                // SAFETY NETS
                if (this.contextValidator.isGibberish(query)) {
                    return this.fallbackStrategy.handleGibberish();
                }

                if (this.contextValidator.isVague(query)) {
                    const fallback = this.fallbackStrategy.handleVagueQuery();
                    if (fallback.action === 'surprise_query') {
                        return this.handleSurpriseQuery();
                    }
                    return { text: fallback.text, suggestions: this.generateSuggestions(undefined, 3) };
                }

                // Legacy Follow-up Check
                const reference = this.referenceResolver.detectReference(query);
                if (reference.hasReference && reference.type) {
                    // Check v2 Context First
                    if (resolution.resolvedEntity) {
                        // Prefer v2 resolution over legacy referenceResolver if possible
                        // But for now, let's keep legacy route as fallback for "more"
                    }

                    const validation = this.contextValidator.validateFollowUp(
                        reference.type,
                        this.conversationState.conversationHistory
                    );
                    if (validation.isValid) {
                        const response = this.handleFollowUp(reference.type);
                        this.recordTurn(query, 'follow_up', [], response.text);
                        return response;
                    }
                }

                // Fuzzy Search
                const searchResults = this.searchEngine.search(query);
                if (searchResults.length > 0) {
                    const bestMatch = searchResults[0];
                    if (bestMatch.score > 1) { // Adjusted to be safer (usually >1 is good for MiniSearch)
                        AnalyticsManager.trackEvent('lumo_search_fallback', { query, match: bestMatch.title });
                        return {
                            text: `I'm not 100% sure, but I found this related to **"${query}"**:\n\n` +
                                `**${bestMatch.title}**\n${bestMatch.description}\n\n` +
                                `Is that helpful?`,
                            suggestions: [{ label: 'Yes', payload: 'yes', icon: '👍' }, { label: 'No', payload: 'no', icon: '👎' }]
                        };
                    }
                }

                // Final Fallback
                const response = this.fallbackStrategy.handleLowConfidence();
                this.recordTurn(query, 'low_confidence', entities, response.text);
                return response;

            })();

            // RACE: Logic vs Timeout
            const response = await Promise.race([logicPromise, timeoutPromise]);

            AnalyticsManager.trackLatency(Date.now() - startTime);

            return response;

        } catch (error) {
            console.error('[LumoAI] Critical Error:', error);
            // GRACEFUL DEGRADATION
            return {
                text: "My brain hiccupped! 🤯 I encountered an unexpected error. Could we try that again?",
                suggestions: this.generateSuggestions(undefined, 3)
            };
        }
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
                return this.handleSkillsQuery(entities);
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
            case 'portfolio':
            case 'see portfolio':
                return this.handleExperienceQuery();
            case 'show thai projects':
                // Ideally filter by Thailand, but for now show all projects
                return this.handleExperienceQuery();
            case 'remote work?':
            case 'remote work':
                return this.handleContactQuery();

            // NUDGE RESPONSES
            case 'just browsing':
            case 'no thanks':
                return {
                    text: "No problem! Take your time. If you get curious, try 'Surprise Me' for a random fact. 🎲",
                    suggestions: [{ label: 'Surprise Me', payload: 'surprise me', icon: '🎲' }]
                };
            case "yes, i'm hiring":
                const contactInfo = this.handleContactQuery();
                return {
                    text: "Music to my ears! 🎵 \n\n" + contactInfo.text
                };


            // UI COMMANDS
            case 'scroll to top':
            case 'go to top':
            case 'start over':
                return {
                    text: "Back to the top!",
                    command: { type: 'scroll', value: 'profile-section' }
                };

            // CHARM & CONTEXT
            case 'bangkok 🇹🇭':
            case 'bangkok':
            case 'thailand':
                return this.handleLocationQuery('bangkok');
            case 'canada 🇨🇦':
            case 'canada':
                return this.handleLocationQuery('canada');
            case 'usa 🇺🇸':
            case 'usa':
                return this.handleLocationQuery('usa');
            case 'europe 🇪🇺':
            case 'europe':
                return this.handleLocationQuery('europe');

            case 'show me the face!':
            case 'show face':
            case 'joke face':
                return this.handleMediaRequest('joke_face');

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
        // Module 6: Check for NLG Factors
        // If entity provided, try to generate unique text
        if (entities.length > 0) {
            const company = entities[0].value.toLowerCase();
            const factors = (profileData as any).nlg_factors;

            // Map common names to keys
            const key = Object.keys(factors).find(k => company.includes(k));

            if (key && factors[key]) {
                // Dynamic Suggestion Logic
                // Default fallback
                let suggestions = [{ label: 'Back to Menu', payload: 'experience', icon: '🔙' }];

                // Map entity key to node ID logic
                const nodeIdMap: Record<string, string> = {
                    'invitrace': 'node_project_invitrace',
                    'peakaccount': 'node_project_peakaccount',
                    'cp_origin': 'node_project_cporigin'
                };

                const flowNodeId = nodeIdMap[key];

                if (flowNodeId && (conversationFlows.nodes as any)[flowNodeId]) {
                    const node = (conversationFlows.nodes as any)[flowNodeId];
                    if (node.suggestions && node.suggestions.length > 0) {
                        suggestions = node.suggestions.map((s: string) => ({
                            label: s,
                            payload: s.toLowerCase(),
                            icon: s.includes('Back') ? '🔙' : '👉'
                        }));
                    }
                }

                return {
                    text: this.generateDynamicContent(key, 'professional'),
                    suggestions: suggestions
                };
            }
        }

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
    /**
     * Handle skills query - GRAPH ENHANCED 🧠
     */
    private handleSkillsQuery(entities: ExtractedEntity[] = []): { text: string; suggestions?: Suggestion[] } {
        // 1. CORTEX GRAPH LOOKUP
        if (entities.length > 0) {
            const skill = entities[0].value;
            const graphResults = knowledgeGraph.findSkillUsage(skill);

            if (graphResults.length > 0) {
                const places = graphResults.map(r => `**${r.target}** (${r.context})`).join(', ');
                // Dynamic Narrative
                return {
                    text: `Nate demonstrated **${skill}** at ${places}.\n\nIt was a key lever for his success in those roles.`,
                    suggestions: [{ label: `Experience at ${graphResults[0].target}`, payload: `Experience at ${graphResults[0].target}` }]
                };
            }
        }

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
        AnalyticsManager.trackEvent('contact_inquiry_viewed'); // Track Lead Interest
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
     * Module 6: Dynamic Content Generation
     */
    private generateDynamicContent(factorKey: string, vibe: 'professional' | 'casual' | 'recruiter' = 'professional'): string {
        const factors = (profileData as any).nlg_factors[factorKey];
        if (!factors) return "I don't have atomic details on that yet.";

        const vibeTemplates = (templates as any).en[vibe];
        // Random template
        const template = this.weightedRandom(vibeTemplates.map((t: string) => ({ content: t, weight: 1 }))) as any;

        return this.grammarEngine.fillTemplate(template.content, factors);
    }

    /**
     * Handle surprise query
     */
    private handleSurpriseQuery(): { text: string; suggestions?: Suggestion[] } {
        // Access 'extras' from the new JSON structure
        const surprises = (conversationFlows as any).extras.surprises;

        // Filter out the last shown surprise to prevent immediate repetition
        const candidates = this.conversationState.lastSurpriseContent
            ? surprises.filter((s: any) => s.content !== this.conversationState.lastSurpriseContent)
            : surprises;

        // Fallback to full list if filter leaves nothing (unlikely)
        const pool = candidates.length > 0 ? candidates : surprises;

        const selected = this.weightedRandom(pool) as any;

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
     * Handle location query (Charm Module)
     */
    private handleLocationQuery(location: string): LumoResponse {
        const contexts = greetingSystem.location_contexts as any;
        const normalized = location.toLowerCase().includes('bangkok') ? 'bangkok' :
            location.toLowerCase().includes('canada') ? 'canada' :
                location.toLowerCase().includes('usa') ? 'usa' :
                    location.toLowerCase().includes('europe') ? 'europe' : 'general';

        const data = contexts[normalized] || contexts.general;

        return {
            text: data.text,
            suggestions: data.suggestions.map((s: string) => ({ label: s, payload: s, icon: '🌍' }))
        };
    }

    /**
     * Get a proactive nudge for idle users (Charm Module)
     * "Polite Mode": Only nudge once per session.
     */
    getProactiveNudge(): LumoResponse {
        // Strict Politeness: If already nudged, stay silent.
        if (this.conversationState.nudgeCount > 0) {
            return { text: '', suggestions: [] }; // Silent response
        }

        const nudges: any[] = greetingSystem.idle_nudges;
        // Random selection
        const selected = this.weightedRandom(nudges.map(n => ({ ...n, weight: 1 }))) as any;

        // Track Nudge
        this.conversationState.nudgeCount++;

        return {
            text: selected.text,
            suggestions: selected.suggestions.map((s: string) => ({ label: s, payload: s, icon: '👉' }))
        };
    }

    /**
     * Handle media request (Charm Module)
     */
    private handleMediaRequest(type: string): LumoResponse {
        if (type === 'joke_face') {
            const media = greetingSystem.rich_media.joke_face;
            return {
                text: media.caption,
                media: {
                    type: 'image',
                    url: media.url,
                    alt: media.alt,
                    caption: media.caption
                },
                suggestions: [{ label: 'Back to serious', payload: 'quick_summary', icon: '👔' }]
            };
        }
        return { text: "I can't find that image right now.", suggestions: [] };
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
     * Generate dynamic suggestions based on context
     */
    private generateSuggestions(type?: string, count: number = 3): Suggestion[] {
        // Phase 4.2: Context-Aware Generic Suggestions
        if (!type) {
            const context = this.contextManager.getContext();
            const activeTopic = context.activeTopic?.name;

            // If we have an active topic, suggest things related to it
            if (activeTopic) {
                return [
                    { label: `More about ${activeTopic}`, payload: `tell me more about ${activeTopic}`, icon: '👀' },
                    { label: 'Related Skills', payload: 'skills', icon: '⚡' },
                    { label: 'Main Menu', payload: 'main menu', icon: '🏠' }
                ];
            }
        }

        const pool = type ? (templates.suggestions as any)[type] || [] : [];

        if (pool.length === 0) {
            // Fallback default suggestions
            return [
                { label: 'Experience', payload: 'experience', icon: '💼' },
                { label: 'Skills', payload: 'skills', icon: '⚡' },
                { label: 'Contact', payload: 'contact', icon: '📫' }
            ];
        }

        // Randomize
        return this.shuffleArray(pool).slice(0, count).map((s: any) => ({
            label: s.label,
            payload: s.payload,
            icon: s.icon
        }));
    }

    /**
     * Helper: Shuffle Array
     */
    private shuffleArray<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * Get conversation state
     */
    public getState(): ConversationState {
        return { ...this.conversationState };
    }
}
