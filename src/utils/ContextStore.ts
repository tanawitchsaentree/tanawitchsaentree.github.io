/**
 * ContextStore — single source of truth for conversation state.
 * Replaces SmartBot.context + ContextManager + SessionManager (3 systems → 1).
 */

interface ContextState {
    turnCount: number;
    lastIntent: string | null;
    lastEntity: string | null;
    entityExpiresAt: number;
    recentResponses: string[];
    flowNodeId: string;
    visitCount: number;
    lastVisit: number;
}

const STORAGE_KEY = 'lumo_ctx_v1';
const ENTITY_TTL_TURNS = 3;

const defaultState = (): ContextState => ({
    turnCount: 0,
    lastIntent: null,
    lastEntity: null,
    entityExpiresAt: 0,
    recentResponses: [],
    flowNodeId: 'root',
    visitCount: 0,
    lastVisit: Date.now(),
});

export class ContextStore {
    private state: ContextState;

    constructor() {
        this.state = this.load();
        this.state.visitCount++;
        this.state.lastVisit = Date.now();
        this.save();
    }

    private load(): ContextState {
        if (typeof window === 'undefined') return defaultState();
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultState();
            const parsed = JSON.parse(raw);
            // Invalidate if schema changed (missing key = old version)
            if (typeof parsed.flowNodeId === 'undefined') return defaultState();
            return parsed;
        } catch {
            return defaultState();
        }
    }

    private save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
    }

    addTurn(): void {
        this.state.turnCount++;
        if (this.state.lastEntity && this.state.turnCount > this.state.entityExpiresAt) {
            this.state.lastEntity = null;
        }
        this.save();
    }

    setLastEntity(entityId: string): void {
        this.state.lastEntity = entityId;
        this.state.entityExpiresAt = this.state.turnCount + ENTITY_TTL_TURNS;
        this.save();
    }

    setLastIntent(intent: string): void {
        this.state.lastIntent = intent;
        this.save();
    }

    trackResponse(text: string): void {
        this.state.recentResponses.push(text);
        if (this.state.recentResponses.length > 5) {
            this.state.recentResponses.shift();
        }
        this.save();
    }

    isRecentResponse(text: string): boolean {
        return this.state.recentResponses.includes(text);
    }

    setFlowNode(nodeId: string): void {
        this.state.flowNodeId = nodeId;
        this.save();
    }

    resetFlow(): void {
        this.state.flowNodeId = 'root';
        this.save();
    }

    get turnCount() { return this.state.turnCount; }
    get lastEntity() { return this.state.lastEntity; }
    get lastIntent() { return this.state.lastIntent; }
    get flowNodeId() { return this.state.flowNodeId; }
    get visitCount() { return this.state.visitCount; }
    get isReturning() { return this.state.visitCount > 1; }

    reset(): void {
        this.state = defaultState();
        this.save();
    }
}
