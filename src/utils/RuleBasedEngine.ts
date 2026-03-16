import type { ChatEngine, BotResponse, ConversationTurn, Suggestion } from './ChatEngine';
import { ContextStore } from './ContextStore';
import { FallbackStrategy } from './FallbackStrategy';
import profile from '../data/profile_data_enhanced.json';
import intentsData from '../data/intents.json';
import greetingSystem from '../data/greeting_system.json';

type IntentDef = typeof intentsData.intents[number];
type EntityDef = typeof intentsData.entities[number];

export class RuleBasedEngine implements ChatEngine {
    private ctx: ContextStore;
    private fallback: FallbackStrategy;

    constructor() {
        this.ctx = new ContextStore();
        this.fallback = new FallbackStrategy();
    }

    // ─── Public API ─────────────────────────────────────────────────────────────

    getGreeting(): BotResponse {
        const hour = new Date().getHours();
        let timeKey: 'morning' | 'afternoon' | 'evening';
        if (hour >= 5 && hour <= 11) timeKey = 'morning';
        else if (hour >= 12 && hour <= 17) timeKey = 'afternoon';
        else timeKey = 'evening';

        const pool = greetingSystem.time_contexts[timeKey].variants;
        const variant = this.weightedRandom(pool);

        const suggestions = (variant.suggestions as string[]).map(key => {
            const s = (greetingSystem.suggestions as any)[key];
            return s ? { label: s.label, payload: s.payload } : { label: key, payload: key };
        });

        // Easter eggs
        const isWeekend = [0, 6].includes(new Date().getDay());
        const isLateNight = hour >= 23 || hour <= 4;
        let prefix = '';
        if (isLateNight) prefix = greetingSystem.easter_eggs.late_night.prefix;
        else if (isWeekend) prefix = greetingSystem.easter_eggs.weekend.prefix;

        const returningMsg = this.ctx.isReturning
            ? greetingSystem.easter_eggs.repeated_visit.message + '\n\n'
            : '';

        return {
            text: returningMsg + (prefix ? prefix + variant.message : variant.message),
            suggestions
        };
    }

    getProactiveNudge(): BotResponse {
        const nudges = greetingSystem.idle_nudges;
        const nudge = this.pick(nudges);
        return {
            text: nudge.text,
            suggestions: nudge.suggestions.map(s => ({ label: s, payload: s }))
        };
    }

    async chat(input: string, _history: ConversationTurn[]): Promise<BotResponse> {
        this.ctx.addTurn();
        const norm = input.toLowerCase().trim();

        // 1. Entity detection (before intent — entity changes intent routing)
        const entity = this.extractEntity(norm);
        if (entity) this.ctx.setLastEntity(entity.id);

        // 2. Intent classification
        const intent = this.classifyIntent(norm, entity);
        this.ctx.setLastIntent(intent);

        // 3. Build response
        const response = this.buildResponse(intent, entity, norm);
        this.ctx.trackResponse(response.text);
        return response;
    }

    // ─── Entity Extraction ───────────────────────────────────────────────────────

    private extractEntity(input: string): EntityDef | null {
        // Anaphora: pronouns resolve to last entity
        const anaphoraWords = ['it', 'this', 'that', 'there', 'more about it'];
        const words = input.split(/\s+/);
        if (this.ctx.lastEntity && anaphoraWords.some(w => words.includes(w) || input.includes(w))) {
            return intentsData.entities.find(e => e.id === this.ctx.lastEntity) ?? null;
        }

        // Direct keyword match — check multi-word first, then single-word
        for (const entity of intentsData.entities) {
            const multiWord = entity.keywords.filter(k => k.includes(' '));
            if (multiWord.some(k => input.includes(k))) return entity;
        }
        for (const entity of intentsData.entities) {
            const singleWord = entity.keywords.filter(k => !k.includes(' '));
            if (singleWord.some(k => words.includes(k))) return entity;
        }

        return null;
    }

    // ─── Intent Classification ───────────────────────────────────────────────────

    private classifyIntent(input: string, entity: EntityDef | null): string {
        // Semantic patterns first (tightest matching — require 3 concepts)
        const semantic = this.checkSemanticPatterns(input);
        if (semantic) return semantic;

        const words = input.split(/\s+/);
        let bestScore = 0;
        let bestIntent = 'unknown';

        for (const intent of intentsData.intents) {
            let score = 0;
            for (const keyword of intent.keywords) {
                if (keyword.includes(' ')) {
                    if (input.includes(keyword)) score += 20;
                } else {
                    for (const word of words) {
                        if (word === keyword) { score += 10; break; }
                        // Fuzzy — only for longer words to avoid false positives
                        if (keyword.length > 4 && this.levenshtein(word, keyword) === 1) { score += 6; break; }
                    }
                }
            }
            if (score > bestScore) { bestScore = score; bestIntent = intent.id; }
        }

        // Entity with low intent score → treat as entity query
        if (entity && bestScore < 10) return 'query_entity';

        if (bestScore < 5) return 'unknown';
        return bestIntent;
    }

    private checkSemanticPatterns(input: string): string | null {
        const words = new Set(input.split(/\s+/));
        const map = intentsData.concept_map as Record<string, string[]>;

        for (const pattern of intentsData.semantic_patterns) {
            // All concepts must be satisfied
            const allMatch = pattern.structure.every(concept => {
                const conceptWords = map[concept] ?? [];
                return conceptWords.some(w => words.has(w));
            });
            if (allMatch) return pattern.intent;
        }
        return null;
    }

    // ─── Response Building ───────────────────────────────────────────────────────

    private buildResponse(intent: string, entity: EntityDef | null, input: string): BotResponse {
        // Entity always wins when present
        if (entity) return this.buildEntityResponse(entity);

        const intentDef = intentsData.intents.find(i => i.id === intent);

        // Intents with a command attached
        if (intentDef?.command) {
            const text = this.pickResponse(intentDef.response_key ?? '');
            return { text, suggestions: this.defaultSuggestions(), command: intentDef.command as any };
        }

        switch (intent) {
            case 'greeting':
                return this.buildStaticResponse('greeting', this.defaultSuggestions());
            case 'ask_lumo':
                return this.buildStaticResponse('ask_lumo', [
                    { label: 'Tell me about Nate', payload: "Who is Nate?" },
                    { label: 'Experience', payload: "What's his experience?" },
                ]);
            case 'ask_nate':
                return this.buildAskNateResponse();
            case 'query_experience':
                return this.buildExperienceResponse();
            case 'query_skills':
                return this.buildSkillsResponse();
            case 'query_contact':
                return this.buildContactResponse();
            case 'query_education':
                return this.buildEducationResponse();
            case 'challenges':
                return this.buildStaticResponse('challenges', [
                    { label: 'His strengths ⚡', payload: "What are his skills?" },
                    { label: 'Career timeline →', payload: "What's his experience?" },
                ]);
            case 'personal_trivia':
                return this.buildPersonalTriviaResponse();
            default:
                return this.fallback.handleLowConfidence();
        }
    }

    private buildEntityResponse(entity: EntityDef): BotResponse {
        if (entity.type === 'company') {
            const exp = (profile.experience.timeline as any[]).find(e => e.id === (entity as any).data_ref);
            if (!exp) return this.fallback.handleLowConfidence();

            const skillList = (exp.impact.skills_demonstrated as string[])
                .map(s => s.replace(/_/g, ' '))
                .join(', ');

            // Suggest 2 other companies dynamically
            const otherCompanies = (profile.experience.timeline as any[])
                .filter(e => e.id !== (entity as any).data_ref)
                .slice(0, 2)
                .map(e => ({ label: e.company.name, payload: `Tell me about ${e.company.name}` }));

            return {
                text: `${exp.storytelling.medium}\n\nSkills applied: ${skillList}`,
                suggestions: [
                    ...otherCompanies,
                    { label: 'Core skills ⚡', payload: "What are his skills?" },
                ]
            };
        }

        if (entity.type === 'skill') {
            const [catKey, skillName] = ((entity as any).data_ref_skill as string).split('/');
            const cat = (profile.skills.categories as any)[catKey];
            const skill = cat?.competencies.find((c: any) => c.name === skillName);
            if (!skill) return this.fallback.handleLowConfidence();

            const evidenceNote = skill.evidence?.length
                ? ` Demonstrated at: ${skill.evidence.join(', ')}.`
                : '';

            return {
                text: `${skill.name}: ${skill.description}.${evidenceNote}\n\n"${skill.conversational_angle}"`,
                suggestions: [
                    { label: 'More skills ⚡', payload: "What are his skills?" },
                    { label: 'See it in practice →', payload: "What's his experience?" },
                ]
            };
        }

        return this.fallback.handleLowConfidence();
    }

    private buildAskNateResponse(): BotResponse {
        const id = profile.identity;
        const loc = id.location;
        const totalYears = profile.experience.summary.total_years;
        const companyCount = profile.experience.summary.company_count;
        return {
            text: `${id.full_name.nickname} (${id.full_name.value}) is a ${id.current_title.value} at ${id.current_title.company}, based in ${loc.city}.\n\n${profile.career_narrative.elevator_pitch}`,
            suggestions: [
                { label: `${totalYears} yrs, ${companyCount} companies →`, payload: "What's his experience?" },
                { label: "What's he expert at?", payload: "What are his skills?" },
                { label: 'Say hi 👋', payload: 'How to contact?' },
            ]
        };
    }

    private buildExperienceResponse(): BotResponse {
        const timeline = profile.experience.timeline;
        const lines = timeline
            .map(e => `- ${e.role.title} at ${e.company.name}`)
            .join('\n');

        // Dynamic suggestions: first 3 companies from timeline
        const companySuggestions: Suggestion[] = timeline.slice(0, 3).map(e => ({
            label: e.company.name,
            payload: `Tell me about ${e.company.name}`
        }));

        return {
            text: `Nate has ${profile.experience.summary.total_years} of experience across ${profile.experience.summary.company_count} companies:\n\n${lines}\n\nAsk about any company for the full story.`,
            suggestions: companySuggestions
        };
    }

    private buildSkillsResponse(): BotResponse {
        const expertSkills = Object.values(profile.skills.categories as any)
            .flatMap((cat: any) => cat.competencies)
            .filter((c: any) => c.proficiency === 'expert')
            .map((c: any) => `- ${c.name}: ${c.description}`);

        return {
            text: `Nate's core strengths:\n\n${expertSkills.join('\n')}`,
            suggestions: [
                { label: 'Design Systems deep dive', payload: 'Tell me about design systems' },
                { label: 'User research side', payload: 'Tell me about user research' },
                { label: 'Where he applied them →', payload: "What's his experience?" },
            ]
        };
    }

    private buildContactResponse(): BotResponse {
        const c = profile.contact;
        return {
            text: `Email: ${c.primary.value}\nLinkedIn: ${c.social.linkedin.url}\nBehance: ${c.social.behance.url}\n\nBest way to reach him: ${c.primary.conversational}. Response time: ${c.primary.response_time}.`,
            suggestions: [
                { label: 'His career story →', payload: "What's his experience?" },
                { label: 'Core skills ⚡', payload: "What are his skills?" },
            ]
        };
    }

    private buildEducationResponse(): BotResponse {
        const lines = profile.education.map(e => {
            const degreeLabel = e.degree_type === 'bachelor' ? "Bachelor's" : 'Diploma';
            return `- ${degreeLabel} in ${e.field}, ${e.institution} (${new Date(e.start).getFullYear()}–${new Date(e.end).getFullYear()})`;
        });

        return {
            text: `Nate's education:\n\n${lines.join('\n')}\n\n${profile.education[0].conversational}`,
            suggestions: [
                { label: 'Career timeline →', payload: "What's his work experience?" },
                { label: 'Design skills ⚡', payload: "What are his skills?" },
            ]
        };
    }

    private buildPersonalTriviaResponse(): BotResponse {
        const loc = profile.identity.location;
        const themes = profile.career_narrative.career_themes;
        return {
            text: `Nate is based in ${loc.city}, ${loc.country}${loc.remote_friendly ? ' (open to remote)' : ''}. Outside of work: photography, complex board games, and exploring new tech. In his own words — "${themes.growth}"`,
            suggestions: [
                { label: 'His design career →', payload: "What's his experience?" },
                { label: 'Say hi 👋', payload: 'How to contact?' },
            ]
        };
    }

    private buildStaticResponse(key: string, suggestions: Suggestion[]): BotResponse {
        const text = this.pickResponse(key);
        const shouldAddOpener = Math.random() > 0.6;
        const opener = shouldAddOpener ? this.pick(intentsData.fragments.openers) + ' ' : '';
        return { text: opener + text, suggestions };
    }

    private pickResponse(key: string): string {
        const pool = (intentsData.responses as any)[key];
        if (!pool?.length) return "I can help with that!";
        const options = pool.filter((r: string) => !this.ctx.isRecentResponse(r));
        return this.pick(options.length ? options : pool);
    }

    private defaultSuggestions(): Suggestion[] {
        const totalYears = profile.experience.summary.total_years;
        const companyCount = profile.experience.summary.company_count;
        const pool: Suggestion[][] = [
            [
                { label: `${totalYears} yrs, ${companyCount} companies →`, payload: "What's his experience?" },
                { label: "What's he expert at?", payload: "What are his skills?" },
                { label: 'Say hi 👋', payload: 'How to contact?' },
            ],
            [
                { label: 'His design career →', payload: "What's his experience?" },
                { label: 'Core skills ⚡', payload: "What are his skills?" },
                { label: 'Who is Nate?', payload: 'Who is Nate?' },
            ],
            [
                { label: 'Career timeline →', payload: "What's his experience?" },
                { label: 'Design skills ⚡', payload: "What are his skills?" },
                { label: 'Get in touch', payload: 'How to contact?' },
            ],
        ];
        return this.pick(pool);
    }

    // ─── Utilities ───────────────────────────────────────────────────────────────

    private pick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    private weightedRandom<T extends { weight: number }>(items: T[]): T {
        const total = items.reduce((sum, i) => sum + i.weight, 0);
        let rand = Math.random() * total;
        for (const item of items) {
            rand -= item.weight;
            if (rand <= 0) return item;
        }
        return items[items.length - 1];
    }

    private levenshtein(a: string, b: string): number {
        if (a === b) return 0;
        const m = a.length, n = b.length;
        const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => {
            const row = new Array(n + 1).fill(0);
            row[0] = i;
            return row;
        });
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = a[i - 1] === b[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
        return dp[m][n];
    }
}
