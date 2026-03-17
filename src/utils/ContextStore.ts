/**
 * ContextStore — single source of truth for conversation state.
 * Replaces SmartBot.context + ContextManager + SessionManager (3 systems → 1).
 *
 * Persisted (localStorage): visitCount, lastVisit
 * Session-only (memory):    anglesUsed, topicDepth, previousEntity
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

// Session-only — not persisted, resets each page load
interface SessionState {
    anglesUsed: Record<string, string[]>;
    topicDepth: Record<string, number>;
    previousEntity: string | null;
}

const STORAGE_KEY = 'lumo_ctx_v1';
const ENTITY_TTL_TURNS = 3;
const ANGLE_ORDER = ['story', 'proof', 'honest', 'personal'] as const;

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

const defaultSession = (): SessionState => ({
    anglesUsed: {},
    topicDepth: {},
    previousEntity: null,
});

export class ContextStore {
    private state: ContextState;
    private session: SessionState;

    constructor() {
        this.state = this.load();
        this.session = defaultSession();
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
        // Track previous before overwriting
        if (this.state.lastEntity && this.state.lastEntity !== entityId) {
            this.session.previousEntity = this.state.lastEntity;
        }
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

    // ─── Angle Rotation ──────────────────────────────────────────────────────────

    getNextAngle(topic: string, sentiment: string): string {
        // Sentiment always overrides rotation
        if (sentiment === 'skeptical' || sentiment === 'negative' || sentiment === 'comparison') return 'proof';
        if (sentiment === 'deep_dive') return 'honest';

        // First touch always uses story — establish context before going deeper
        const used = this.session.anglesUsed[topic] ?? [];
        if (used.length === 0) return 'story';

        const unused = ANGLE_ORDER.filter(a => !used.includes(a));
        const pool = unused.length > 0 ? unused : [...ANGLE_ORDER];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    markAngleUsed(topic: string, angle: string): void {
        if (!this.session.anglesUsed[topic]) this.session.anglesUsed[topic] = [];
        if (!this.session.anglesUsed[topic].includes(angle)) {
            this.session.anglesUsed[topic].push(angle);
        }
    }

    incrementDepth(topic: string): void {
        this.session.topicDepth[topic] = (this.session.topicDepth[topic] ?? 0) + 1;
    }

    getDepth(topic: string): number {
        return this.session.topicDepth[topic] ?? 0;
    }

    // ─── Getters ─────────────────────────────────────────────────────────────────

    get turnCount() { return this.state.turnCount; }
    get lastEntity() { return this.state.lastEntity; }
    get previousEntity() { return this.session.previousEntity; }
    get lastIntent() { return this.state.lastIntent; }
    get flowNodeId() { return this.state.flowNodeId; }
    get visitCount() { return this.state.visitCount; }
    get isReturning() { return this.state.visitCount > 1; }

    reset(): void {
        this.state = defaultState();
        this.session = defaultSession();
        this.save();
    }
}
