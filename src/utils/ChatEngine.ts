export interface Suggestion {
    label: string;
    payload: string;
    icon?: string;
}

export interface Command {
    type: 'scroll' | 'download' | 'theme';
    value?: string;
}

export interface BotResponse {
    text: string;
    suggestions?: Suggestion[];
    command?: Command;
    media?: {
        type: 'image' | 'video';
        url: string;
        alt: string;
        caption?: string;
    };
}

export interface ConversationTurn {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * ChatEngine — the single interface that ChatBox talks to.
 * Swap implementations without touching the UI.
 *
 * Current: RuleBasedEngine (no external deps)
 * Future:  GeminiEngine    (uncomment in ChatBox when ready)
 */
export interface ChatEngine {
    chat(input: string, history: ConversationTurn[]): Promise<BotResponse>;
    getGreeting(): BotResponse;
    getProactiveNudge(): BotResponse;
}
