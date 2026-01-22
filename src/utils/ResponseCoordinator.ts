export interface ResponseComponent {
    type: 'greeting' | 'intent' | 'fallback' | 'search';
    text: string;
    suggestions?: any[];
    command?: any;
    media?: any;
}

export class ResponseCoordinator {
    /**
     * Combines multiple response components into a single coherent response.
     * Prioritizes 'intent' for actions/suggestions but keeps 'greeting' text.
     */
    static compose(components: ResponseComponent[]) {
        const greeting = components.find(c => c.type === 'greeting');
        const main = components.find(c => c.type === 'intent' || c.type === 'search');
        const fallback = components.find(c => c.type === 'fallback');

        // Case 1: Greeting + Main Intent ("Hi! Here is my experience...")
        if (greeting && main) {
            return {
                text: `${greeting.text}\n\n${main.text}`,
                suggestions: main.suggestions || greeting.suggestions,
                command: main.command,
                media: main.media
            };
        }

        // Case 2: Only Main Intent
        if (main) {
            return {
                text: main.text,
                suggestions: main.suggestions,
                command: main.command,
                media: main.media
            };
        }

        // Case 3: Only Greeting
        if (greeting) {
            return {
                text: greeting.text,
                suggestions: greeting.suggestions,
                command: greeting.command
            };
        }

        // Case 4: Fallback
        return fallback || { text: "I'm not sure how to respond to that.", suggestions: [] };
    }
}
