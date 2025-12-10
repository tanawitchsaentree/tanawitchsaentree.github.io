import brainData from '../data/brain.json';
import dictionaryData from '../data/dictionary.json';
import graphData from '../data/graph_data.json';
import suggestionRulesData from '../data/suggestion_rules.json';
import { ProfileData } from './ProfileData';

// Types based on brain.json structure
type EntityKey = keyof typeof brainData.entities;
type IntentId = string;

export interface Suggestion {
    label: string;
    payload: string;
}

export interface BotResponse {
    text: string;
    suggestions?: Suggestion[];
}

interface MatchResult {
    intentId: IntentId;
    score: number;
    matchedEntity?: EntityKey;
    patternMatch?: boolean; // New flag for semantic pattern validation
}

interface Dictionary {
    concepts: Record<string, string[]>;
}

interface SuggestionRule {
    id: string;
    after_intent?: string;
    after_entity?: string;
    suggestions: {
        en: Suggestion[];
        th: Suggestion[];
    };
    reason: string;
}

interface SuggestionRules {
    rules: SuggestionRule[];
    default_suggestions: {
        en: Suggestion[];
        th: Suggestion[];
    };
    fallback_suggestions: {
        en: Suggestion[];
        th: Suggestion[];
    };
}

interface SemanticPattern {
    id: string;
    structure: string[];
    intent: string;
    response_strategy: string;
}

interface Brain {
    bot: any;
    fragments: { en: any; th: any };
    entities: Record<string, any>;
    intents: any[];
    semantic_patterns: SemanticPattern[];
    responses_strategies: Record<string, { en: string[]; th: string[] }>;
}

interface GraphNode {
    id: string;
    label: string;
    type: string;
}

interface GraphEdge {
    source: string;
    target: string;
    relation: string;
    text_en: string;
    text_th: string;
}

interface Graph {
    nodes: Record<string, GraphNode>;
    edges: GraphEdge[];
}

interface Context {
    lastEntity?: EntityKey;
    lastIntent?: string;
    turnCount: number; // For decay
    lastEntityTurn: number; // When was the entity last mentioned?
    recentResponses: Set<string>; // Repetition guard
    language: 'en' | 'th'; // Language context
}

export class SmartBot {
    private brain: Brain;
    private dictionary: Dictionary;
    private graph: Graph; // New Graph Engine
    private suggestionRules: SuggestionRules;
    private context: Context;

    constructor() {
        this.brain = brainData as any; // Cast for extended structure
        this.dictionary = dictionaryData;
        this.graph = graphData;
        this.suggestionRules = suggestionRulesData as any;
        this.context = {
            turnCount: 0,
            lastEntityTurn: 0,
            recentResponses: new Set(),
            language: 'en'
        };
    }

    /**
     * Main processing function
     */
    public process(input: string): BotResponse {
        this.context.turnCount++;

        // 0. Language Detection
        this.context.language = this.detectLanguage(input);

        const normalizedInput = input.toLowerCase().trim();
        const tokens = normalizedInput.split(/[\s,.?!]+/);

        // 0. Sentiment Analysis
        const sentiment = this.analyzeSentiment(tokens);

        // 1. Semantic Analysis (The "Brain")
        const activeConcepts = this.parseConcepts(tokens, normalizedInput);
        const semanticMatch = this.findSemanticPattern(activeConcepts);

        // 1.5 Graph Reasoning (The "Calculated" Brain)
        // Check if input contains 2 distinct nodes from our graph logic?
        // Simple mapping: check tokens against graph node IDs/Labels
        const detectedNodes = this.detectGraphNodes(normalizedInput);
        if (detectedNodes.length >= 2) {
            // Find path between first two distinct nodes
            // Simplified: simple BFS
            const path = this.findPath(detectedNodes[0], detectedNodes[1]);
            if (path) {
                const graphResponse = this.generateGraphResponse(path, this.context.language);
                if (graphResponse) {
                    // Assuming addResponseToMemory exists or will be added
                    this.addResponseToMemory(graphResponse);
                    return { text: graphResponse }; // Suggestion for graph? Maybe unrelated for now.
                }
            }
        }

        // 2. Extract Entities (Fuzzy)
        const matchedEntity = this.extractEntity(normalizedInput);

        // 3. Score Intents (Hybrid: Semantic Pattern priority, then Fuzzy+Token)
        let bestMatch: MatchResult;

        if (semanticMatch) {
            // If we found a semantic pattern, it overrides everything with high confidence
            bestMatch = {
                intentId: semanticMatch.intent,
                score: 100,
                matchedEntity: matchedEntity,
                patternMatch: true
            };
        } else {
            // Fallback to standard fuzzy scoring
            bestMatch = this.findBestIntent(tokens, normalizedInput, matchedEntity);
        }

        // 4. Update Context
        if (matchedEntity) {
            this.context.lastEntity = matchedEntity;
            this.context.lastEntityTurn = this.context.turnCount;
        } else {
            // Decay Logic
            if (this.context.lastEntity && (this.context.turnCount - this.context.lastEntityTurn > 3)) {
                this.context.lastEntity = undefined;
            }
        }

        // Track last intent for suggestion context
        this.context.lastIntent = bestMatch.intentId;

        // 5. Generate Response (Dynamic Assembly)
        return this.generateResponse(bestMatch, sentiment);
    }

    /**
     * Detect Language (Simple Script Check)
     */
    private detectLanguage(input: string): 'en' | 'th' {
        const thaiRange = /[\u0E00-\u0E7F]+/;
        return thaiRange.test(input) ? 'th' : 'en';
    }

    /**
     * Convert tokens into abstract concepts using dictionary
     */
    private parseConcepts(tokens: string[], fullInput: string): Set<string> {
        const concepts = new Set<string>();

        for (const [concept, keywords] of Object.entries(this.dictionary.concepts)) {
            // Strategy 1: Token Exact Match (English)
            if (this.context.language === 'en') {
                if (keywords.some(k => tokens.includes(k))) {
                    concepts.add(concept);
                }
            } else {
                // Strategy 2: Substring Match (Thai/Polyglot)
                // This covers Thai 'sentenceswithoutspaces'
                if (keywords.some(k => fullInput.includes(k))) {
                    concepts.add(concept);
                }
            }
        }
        return concepts;
    }

    /**
     * Check if active concepts match any defined semantic logic patterns
     */
    private findSemanticPattern(concepts: Set<string>): SemanticPattern | undefined {
        // We look for patterns where ALL required concepts are present
        // This effectively parses: "Is[question] he[person] good[quality]?"

        for (const pattern of this.brain.semantic_patterns) {
            const allMet = pattern.structure.every(requiredConcept => concepts.has(requiredConcept));
            if (allMet) return pattern;
        }
        return undefined;
    }

    /**
     * Helper: Analyze Sentiment
     */
    private analyzeSentiment(tokens: string[]): 'positive' | 'negative' | 'neutral' {
        const positive = ['good', 'great', 'cool', 'awesome', 'thanks', 'happy', 'wow', 'love'];
        const negative = ['bad', 'wrong', 'fail', 'no', 'hate', 'stupid', 'worst', 'mistake'];

        if (tokens.some(t => positive.includes(t))) return 'positive';
        if (tokens.some(t => negative.includes(t))) return 'negative';
        return 'neutral';
    }

    /**
     * Find mentioned known entities (companies, skills) with FUZZY MATCHING
     */
    private extractEntity(input: string): EntityKey | undefined {
        // Check specific entities first with fuzzy logic
        for (const [key, entity] of Object.entries(this.brain.entities)) {
            // Check keywords (phrases)
            if (entity.keywords.some((k: string) => this.isFuzzyMatch(input, k.toLowerCase()))) {
                return key as EntityKey;
            }
        }

        // Anaphora Resolution
        const anaphoraKeywords = ["it", "that", "there", "him", "he", "more"];
        if (this.context.lastEntity && anaphoraKeywords.some(k => input.includes(k))) {
            return this.context.lastEntity;
        }

        return undefined;
    }

    /**
     * Helper: Levenshtein Distance Calculation (The "Math")
     */
    private levenshteinDistance(a: string, b: string): number {
        const matrix = [];

        // Increment along the first column of each row
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // Increment each column in the first row
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    /**
     * Helper: Check if input contains keyword with typo tolerance
     */
    private isFuzzyMatch(input: string, keyword: string, threshold = 2): boolean {
        // Optimization: simple include check first
        if (input.includes(keyword)) return true;

        const inputWords = input.split(' ');
        const keywordWords = keyword.split(' ');

        // If keyword is single word, check against all input words
        if (keywordWords.length === 1) {
            return inputWords.some(word => this.levenshteinDistance(word, keyword) <= threshold);
        }

        // Multi-word phrase fuzzy match is expensive/complex, skip for now or require tighter match
        // For simplicity 'Genius' mode: check strict includes for phrases, fuzzy for single words
        return input.includes(keyword);
    }

    /**
     * Score all intents based on keyword matches and context
     */
    private findBestIntent(tokens: string[], fullInput: string, entity?: EntityKey): MatchResult {
        let bestScore = 0;
        let bestIntentId = 'unknown';

        for (const intent of this.brain.intents) {
            let score = 0;

            // 1. Token Match (Fuzzy)
            for (const keyword of intent.keywords) {
                const keywordParts = keyword.toLowerCase().split(' ');

                // If keyword is multi-word (e.g. "who is"), check phrase
                if (keywordParts.length > 1) {
                    if (fullInput.includes(keyword.toLowerCase())) {
                        score += 20; // High score for exact phrase match
                    }
                } else {
                    // Single word match with fuzzy
                    if (tokens.some(t => this.levenshteinDistance(t, keyword.toLowerCase()) <= 2)) {
                        score += 10;
                    }
                }
            }

            // 2. Context Bonus
            // If this intent is related to the last one? (Not implemented in JSON, but we can guess)

            // 3. Entity Match Bonus
            if (intent.id === 'entity_query' && entity) {
                score += 50;
            }

            // 4. Input Density Penalty (If input is long but few matches, lower confidence)
            // Not strictly necessary for "Genius" feel unless we want strict rejection.

            if (score > bestScore) {
                bestScore = score;
                bestIntentId = intent.id;
            }
        }

        // Special Case: If we found an entity but score is low (e.g. just "Invitrace"), default to entity_query
        if (entity && bestScore < 15) {
            return { intentId: 'entity_query', score: 60, matchedEntity: entity };
        }

        return { intentId: bestIntentId, score: bestScore, matchedEntity: entity };
    }

    /**
     * Construct the final string - DYNAMIC ASSEMBLY
     */
    private generateResponse(match: MatchResult, sentiment: 'positive' | 'negative' | 'neutral'): BotResponse {
        const { intentId, matchedEntity, score, patternMatch } = match;
        const lang = this.context.language;
        let coreResponse = "";
        let finalSuggestions: Suggestion[] = [];

        // 0. Handle Semantic Pattern Response Strategy
        if (patternMatch && match.intentId) {
            const strategyName = this.brain.semantic_patterns.find(p => p.intent === intentId)?.response_strategy;
            if (strategyName && this.brain.responses_strategies && this.brain.responses_strategies[strategyName]) {
                const strategies = this.brain.responses_strategies[strategyName][lang];
                if (strategies && strategies.length > 0) {
                    coreResponse = strategies[Math.floor(Math.random() * strategies.length)];
                }
            }
        }

        // Threshold check - Smart Fallback Logic
        if (!coreResponse && score < 5) {
            // GENIUS FALLBACK
            const knownTopics = lang === 'en' ? ["Experience", "Skills", "Contact"] : ["ประสบการณ์", "ทักษะ", "ติดต่อ"];
            const suggestion = knownTopics[Math.floor(Math.random() * knownTopics.length)];

            const pivotsEn = [
                `I'm not sure about that, but I can tell you about Nate's ${suggestion}. 🦴`,
                `That's a new scent! 👃 While I dig for that, want to verify his ${suggestion}?`,
                `Hmm, I missed that. But did you know Nate is great at Design Systems? 🎨`
            ];

            const pivotsTh = [
                `ผมไม่แน่ใจเรื่องนั้นครับ แต่ผมเล่าเรื่อง ${suggestion} ของคุณเนทให้ฟังได้นะ 🦴`,
                `กลิ่นใหม่! 👃 ระหว่างที่ผมดมหาคำตอบ ลองมาดู ${suggestion} ไหมครับ?`,
                `งื้ด... ผมฟังไม่ทันครับ แต่รู้ไหมว่าคุณเนทเก่งเรื่อง Design System มากเลยนะ! 🎨`
            ];

            const pivots = lang === 'th' ? pivotsTh : pivotsEn;

            // Retry until unique
            let attempt = 0;
            let pivot = pivots[Math.floor(Math.random() * pivots.length)];
            while (this.context.recentResponses.has(pivot) && attempt < 5) {
                pivot = pivots[Math.floor(Math.random() * pivots.length)];
                attempt++;
            }
            this.addResponseToMemory(pivot);

            // Fallback suggestions
            finalSuggestions = lang === 'en'
                ? [{ label: "Show Experience", payload: "experience" }, { label: "Contact Info", payload: "contact" }]
                : [{ label: "ดูประสบการณ์", payload: "experience" }, { label: "ข้อมูลติดต่อ", payload: "contact" }];

            return { text: pivot, suggestions: finalSuggestions };
        }

        // Handle Entity Query
        if (!coreResponse && intentId === 'entity_query' && matchedEntity) {
            const entity = this.brain.entities[matchedEntity];
            const intentObj = this.brain.intents.find(i => i.id === 'entity_query');
            if (intentObj) {
                const templates = intentObj.responses;
                const template = templates[Math.floor(Math.random() * templates.length)];

                coreResponse = template
                    .replace('{name}', entity.name)
                    .replace('{description}', (entity.data as any).description || '');

                if ('role' in entity.data) {
                    coreResponse = coreResponse
                        .replace('{role}', entity.data.role || '')
                        .replace('{period}', entity.data.period || '');
                }
            }
        }

        // Handle Standard Intents (If not already set by Strategy)
        if (!coreResponse) {
            const intent = this.brain.intents.find(i => i.id === intentId);
            if (intent) {
                const responses = intent.responses;
                // Retry guard for core response
                let attempt = 0;
                coreResponse = responses[Math.floor(Math.random() * responses.length)];
                while (this.context.recentResponses.has(coreResponse) && attempt < 5) {
                    coreResponse = responses[Math.floor(Math.random() * responses.length)];
                    attempt++;
                }

                // Extract Suggestions from Intent
                if (intent.suggestions && intent.suggestions[lang]) {
                    finalSuggestions = intent.suggestions[lang];
                }
            }
        }

        if (!coreResponse) {
            return {
                text: lang === 'th' ? "โฮ่ง! ระบบรวนนิดหน่อยครับ 🐕" : "Woof! Something went wrong in my logic circuits. 🐕"
            };
        }

        // DYNAMIC ASSEMBLY: [Opener] + [Core] + [Closer]
        // Only assemble if the core response isn't already very long or self-contained?
        // Let's do it randomly to feel "organic"

        const useOpener = Math.random() > 0.4; // 60% chance
        const useCloser = Math.random() > 0.7; // 30% chance

        const fragments = this.brain.fragments;
        let finalResponse = coreResponse;

        // Pick fragments based on language
        const currentFragments = fragments[lang] || fragments['en'];

        if (useOpener && currentFragments?.openers) {
            let opener = currentFragments.openers[Math.floor(Math.random() * currentFragments.openers.length)];

            // Adaptive Opener
            if (lang === 'en') {
                if (sentiment === 'positive') opener = "Glad you asked! 🦴";
                if (sentiment === 'negative') opener = "Let me try to help. 🐾";
            } else {
                if (sentiment === 'positive') opener = "ดีใจที่ถามครับ! 🦴";
                if (sentiment === 'negative') opener = "ให้ผมช่วยดูให้นะครับ 🐾";
            }

            finalResponse = `${opener} ${finalResponse}`;
        }

        if (useCloser && currentFragments?.closers) {
            const closer = currentFragments.closers[Math.floor(Math.random() * currentFragments.closers.length)];
            finalResponse = `${finalResponse} ${closer}`;
        }

        this.addResponseToMemory(coreResponse); // Remember the core fact to avoid repeating it
        // We don't remember the full finalResponse because variations (openers) make it unique enough, but we want to avoid repeating the same FACT.

        // UPDATE: Use context-aware suggestions
        if (!finalSuggestions || finalSuggestions.length === 0) {
            finalSuggestions = this.selectSuggestions(match);
        }

        // Ensure at least 2 suggestions
        if (finalSuggestions.length < 2) {
            const defaults = this.suggestionRules.default_suggestions[lang];
            finalSuggestions = [...finalSuggestions, ...defaults].slice(0, 3);
        }

        return { text: finalResponse, suggestions: finalSuggestions };
    }

    /**
     * Generate dynamic buttons based on profile data
     */
    private generateDynamicButtons(intentId: string): Suggestion[] {
        // Find rule with generator
        const rule = this.suggestionRules.rules.find((r: any) =>
            r.after_intent === intentId && r.generate_from
        );

        if (!rule || !(rule as any).button_type) return [];

        const buttonType = (rule as any).button_type;
        const maxButtons = (rule as any).max_buttons || 5;

        // Generate based on type
        switch (buttonType) {
            case 'company_list':
                return this.generateCompanyButtons(maxButtons);
            case 'skill_list':
                return this.generateSkillButtons(maxButtons);
            default:
                return [];
        }
    }

    /**
     * Generate buttons for each company in work experience
     */
    private generateCompanyButtons(max: number = 5): Suggestion[] {
        const companies = ProfileData.getWorkExperienceSorted();

        return companies.slice(0, max).map(job => ({
            label: job.company,
            payload: `Tell me about ${job.company}`
        }));
    }

    /**
     * Generate buttons for top skills
     */
    private generateSkillButtons(max: number = 5): Suggestion[] {
        const skills = ProfileData.getTopCompetencies(max);

        return skills.map((skill: any) => ({
            label: skill.name,
            payload: skill.name
        }));
    }

    /**
     * Select context-aware suggestions based on conversation flow
     */
    private selectSuggestions(match: MatchResult): Suggestion[] {
        const lang = this.context.language;

        // 0. Try dynamic button generation FIRST
        const dynamicButtons = this.generateDynamicButtons(match.intentId);
        if (dynamicButtons.length > 0) {
            return dynamicButtons.slice(0, 5);
        }

        // 1. Check context-aware rules (Intent-based)
        if (this.context.lastIntent) {
            const rule = this.suggestionRules.rules.find((r: any) =>
                r.after_intent === this.context.lastIntent
            );
            if (rule && (rule as any).suggestions?.[lang]) {
                return (rule as any).suggestions[lang];
            }
        }

        // 2. Check entity-based rules
        if (match.matchedEntity) {
            const entityRule = this.suggestionRules.rules.find((r: any) =>
                r.after_entity === match.matchedEntity
            );
            if (entityRule && (entityRule as any).suggestions?.[lang]) {
                return (entityRule as any).suggestions[lang];
            }
        }

        // 3. Check if current intent has static suggestions
        const intent = this.brain.intents.find(i => i.id === match.intentId);
        if (intent?.suggestions?.[lang]) {
            return intent.suggestions[lang];
        }

        // 4. Default suggestions
        return (this.suggestionRules.default_suggestions as any)[lang] || [];
    }

    /**
     * Detect mentions of Graph Nodes in input
     */
    private detectGraphNodes(input: string): string[] {
        const foundNodes: string[] = [];

        // 1. Direct Text Match (ID or Label)
        for (const node of Object.values(this.graph.nodes)) {
            if (input.includes(node.id) || input.includes(node.label.toLowerCase())) {
                foundNodes.push(node.id);
            }
        }

        // 2. Concept -> Node Mapping (Pronoun Resolution)
        // If the semantic parser found 'bot_subject' ("you"), map it to 'lumo' node
        // If 'person_subject' ("he"), map it to 'nate' node
        // We need to re-run or reuse parseConcepts here. 
        // For efficiency, we'll just check the input against dictionary for these specific mappings locally.

        const tokens = input.toLowerCase().split(/[\s,.?!]+/);
        const activeConcepts = this.parseConcepts(tokens, input);

        if (activeConcepts.has('bot_subject')) foundNodes.push('lumo');
        if (activeConcepts.has('person_subject')) foundNodes.push('nate');
        if (activeConcepts.has('thailand')) foundNodes.push('thailand'); // Direct concept-node map if needed

        return [...new Set(foundNodes)]; // Unique
    }

    /**
     * Pathfinding: BFS to find shortest path between start and end node
     */
    private findPath(startId: string, endId: string): GraphEdge[] | null {
        if (startId === endId) return null;

        // BFS Queue: { current node ID, path to get here }
        const queue: { node: string; path: GraphEdge[] }[] = [{ node: startId, path: [] }];
        const visited = new Set<string>();
        visited.add(startId);

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (current.node === endId) {
                return current.path;
            }

            // Find neighbors (Bidirectional traversal for reasoning)
            const neighbors = this.graph.edges.filter(e => e.source === current.node || e.target === current.node);

            for (const edge of neighbors) {
                const neighborId = edge.source === current.node ? edge.target : edge.source;
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ node: neighborId, path: [...current.path, edge] });
                }
            }
        }
        return null;
    }

    /**
     * Generate natural language from graph path
     */
    private generateGraphResponse(path: GraphEdge[], lang: 'en' | 'th'): string {
        let sentence = "";

        path.forEach((edge, index) => {
            const startNode = this.graph.nodes[edge.source];
            const endNode = this.graph.nodes[edge.target];
            const relationText = lang === 'th' ? edge.text_th : edge.text_en;

            // Very simple chaining: "NodeA relation NodeB."
            // In a real graph, we might be traversing B <- A, so we should check direction.
            // For this simpler version, we assume the edge text reads Source -> Target.
            // If our path step traversed Target -> Source, we might need a "reverse relation text".
            // But for now, let's just output the Edge's defined direction.

            const connector = index === 0 ? "" : (lang === 'th' ? " และ " : ", and ");
            sentence += `${connector}${startNode.label} ${relationText} ${endNode.label}`;
        });

        return sentence + ".";
    }

    private addResponseToMemory(response: string) {
        this.context.recentResponses.add(response);
        if (this.context.recentResponses.size > 5) {
            const iterator = this.context.recentResponses.values();
            const oldest = iterator.next().value;
            if (oldest) this.context.recentResponses.delete(oldest);
        }
    }
}
