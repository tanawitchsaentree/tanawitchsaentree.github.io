/**
 * AnalyticsManager - Health Monitoring for LumoAI Brain 🧠
 */

interface AnalyticsEvent {
    type: string;
    payload: any;
    timestamp: number;
}

interface PerformanceMetrics {
    averageLatency: number;
    intentConfidenceAvg: number;
    fallbackRate: number;
    errorRate: number;
}

export class AnalyticsManager {
    private static events: AnalyticsEvent[] = [];
    private static readonly MAX_EVENTS = 100;

    // Baselines
    private static readonly THRESHOLDS = {
        LATENCY_WARNING: 500, // ms
        LATENCY_ERROR: 1000,   // ms
        CONFIDENCE_LOW: 0.5,
        FALLBACK_CRITICAL: 0.3 // 30% Fallback rate is bad
    };

    /**
     * Track generic event
     */
    static trackEvent(type: string, payload: any = {}): void {
        this.events.unshift({
            type,
            payload,
            timestamp: Date.now()
        });

        if (this.events.length > this.MAX_EVENTS) {
            this.events.pop();
        }

        // Console Log for Dev Visibility (if in Dev Mode)
        // console.log(`[📊 Analytics] ${type}`, payload);
    }

    /**
     * Track Intent Classification
     */
    static trackIntent(intent: string, score: number, entities: string[]): void {
        this.trackEvent('intent_classified', { intent, score, entities });

        if (score < this.THRESHOLDS.CONFIDENCE_LOW) {
            console.warn(`[⚠️ Low Confidence] Intent: ${intent} (Score: ${score.toFixed(2)})`);
        }
    }

    /**
     * Track Button/Command Clicks
     */
    static trackCommand(command: string): void {
        this.trackEvent('command_executed', { command });
    }

    /**
     * Track Latency (Performance)
     */
    static trackLatency(ms: number): void {
        this.trackEvent('performance_latency', { ms });

        if (ms > this.THRESHOLDS.LATENCY_ERROR) {
            console.error(`[🚨 High Latency] Response took ${ms}ms`);
        } else if (ms > this.THRESHOLDS.LATENCY_WARNING) {
            console.warn(`[⚠️ Latency Warning] Response took ${ms}ms`);
        }
    }

    /**
     * Calculate Session Health Metrics
     */
    static getSessionMetrics(): PerformanceMetrics {
        const latencyEvents = this.events.filter(e => e.type === 'performance_latency');
        const intentEvents = this.events.filter(e => e.type === 'intent_classified');
        const fallbackEvents = this.events.filter(e => e.type === 'lumo_search_fallback' || e.type === 'low_confidence');

        const total = this.events.length || 1;

        const avgLatency = latencyEvents.reduce((acc, curr) => acc + curr.payload.ms, 0) / (latencyEvents.length || 1);
        const avgConfidence = intentEvents.reduce((acc, curr) => acc + curr.payload.score, 0) / (intentEvents.length || 1);
        const fallbackRate = fallbackEvents.length / total;

        return {
            averageLatency: avgLatency,
            intentConfidenceAvg: avgConfidence,
            fallbackRate: fallbackRate,
            errorRate: 0 // Placeholder
        };
    }
}
