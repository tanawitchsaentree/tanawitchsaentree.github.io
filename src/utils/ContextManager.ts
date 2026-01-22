/**
 * ContextManager - Core Memory Unit for LumoAI v2.1
 * Manages conversation history, entity stack with decay, and topic tracking.
 */

export interface Message {
    role: 'user' | 'bot' | 'system';
    content: string;
    timestamp: number;
}

export interface EntityItem {
    type: string;
    value: string;
    timestamp: number;
    expiresAfterTurns: number; // Decrements on User Turn
}

export interface ActiveTopic {
    name: string;
    confidence: number;
    lastMentionedAt: number;
}

export interface ConversationContext {
    version: number;
    history: Message[];           // Sliding window (Max 10)
    recentIntents: Array<{        // Traceability
        intent: string;
        confidence: number;
        timestamp: number;
    }>;
    entityStack: EntityItem[];    // FIFO for pronoun resolution
    activeTopic: ActiveTopic | null;
}

const DEFAULT_CONTEXT: ConversationContext = {
    version: 2,
    history: [],
    recentIntents: [],
    entityStack: [],
    activeTopic: null
};

export class ContextManager {
    private context: ConversationContext;
    private readonly STORAGE_KEY = 'lumo_context_v2';
    private readonly MAX_HISTORY = 10;
    private readonly DEFAULT_ENTITY_EXPIRY = 3; // Turns

    constructor() {
        this.context = this.loadContext();
    }

    /**
     * Load context with Migration Logic (v1 -> v2)
     */
    private loadContext(): ConversationContext {
        if (typeof window === 'undefined') return { ...DEFAULT_CONTEXT };

        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return { ...DEFAULT_CONTEXT };

            const parsed = JSON.parse(stored);

            // Migration Check
            if (!parsed.version || parsed.version < 2) {
                console.warn('[ContextManager] Migrating legacy context to v2');
                return this.migrateContext(parsed);
            }

            return parsed;
        } catch (e) {
            console.error('[ContextManager] Failed to load context, resetting.', e);
            return { ...DEFAULT_CONTEXT };
        }
    }

    /**
     * Legacy Migration Strategy
     */
    private migrateContext(oldContext: any): ConversationContext {
        // Salvage what we can, safely default the rest
        return {
            ...DEFAULT_CONTEXT,
            // Try to keep recent history if structure matches, otherwise clear
            history: Array.isArray(oldContext.history)
                ? oldContext.history.slice(-this.MAX_HISTORY)
                : [],
            // Reset complex logic states to avoid pollution
            entityStack: [],
            activeTopic: null
        };
    }

    /**
     * Save context to storage
     */
    private save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.context));
        }
    }

    /**
     * Add a message and trigger DECAY logic
     */
    addMessage(role: 'user' | 'bot', content: string): void {
        const message: Message = {
            role,
            content,
            timestamp: Date.now()
        };

        // Sliding Window
        this.context.history.push(message);
        if (this.context.history.length > this.MAX_HISTORY) {
            this.context.history.shift();
        }

        // DECAY LOGIC: Only on USER turns
        if (role === 'user') {
            this.decrementEntityExpiry();
            this.decayTopicConfidence();
        }

        this.save();
    }

    /**
     * Add entity to stack
     */
    addEntity(type: string, value: string): void {
        // Avoid duplicates at top of stack
        if (this.context.entityStack.length > 0) {
            const top = this.context.entityStack[0];
            if (top.value.toLowerCase() === value.toLowerCase()) {
                // Refresh expiry
                top.expiresAfterTurns = this.DEFAULT_ENTITY_EXPIRY;
                return;
            }
        }

        // Add to TOP (0 index)
        this.context.entityStack.unshift({
            type,
            value,
            timestamp: Date.now(),
            expiresAfterTurns: this.DEFAULT_ENTITY_EXPIRY
        });

        // Limit stack size (e.g., keep last 5 entities)
        if (this.context.entityStack.length > 5) {
            this.context.entityStack.pop();
        }

        this.save();
    }

    /**
     * Update active topic
     */
    setTopic(name: string, confidence: number = 1.0): void {
        this.context.activeTopic = {
            name,
            confidence,
            lastMentionedAt: Date.now()
        };
        this.save();
    }

    /**
     * Decay Entity Expiry (Called on User Turn)
     */
    private decrementEntityExpiry(): void {
        const initialCount = this.context.entityStack.length;

        this.context.entityStack = this.context.entityStack
            .map(e => ({
                ...e,
                expiresAfterTurns: e.expiresAfterTurns - 1
            }))
            .filter(e => e.expiresAfterTurns > 0);

        if (this.context.entityStack.length < initialCount) {
            console.log('[ContextManager] Entities expired/removed from stack');
        }
    }

    /**
     * Decay Topic Confidence (Simple Linear Decay)
     */
    private decayTopicConfidence(): void {
        if (this.context.activeTopic) {
            this.context.activeTopic.confidence -= 0.1; // 10% decay per turn
            if (this.context.activeTopic.confidence <= 0.3) {
                this.context.activeTopic = null; // Forget topic if too weak
            }
        }
    }

    /**
     * Public Getters
     */
    getContext(): ConversationContext {
        return this.context;
    }

    getHistory(): Message[] {
        return this.context.history;
    }

    getEntityStack(): EntityItem[] {
        return this.context.entityStack;
    }

    getLastIntent(): string | null {
        return this.context.recentIntents.length > 0
            ? this.context.recentIntents[0].intent
            : null;
    }

    /**
     * Record Intent Execution
     */
    trackIntent(intent: string, confidence: number): void {
        this.context.recentIntents.unshift({
            intent,
            confidence,
            timestamp: Date.now()
        });

        if (this.context.recentIntents.length > 5) {
            this.context.recentIntents.pop();
        }
        this.save();
    }

    /**
     * Reset Context (Global Interrupt)
     */
    reset(): void {
        this.context = { ...DEFAULT_CONTEXT };
        this.save();
    }
}
