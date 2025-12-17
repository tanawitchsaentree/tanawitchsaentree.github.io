
export interface IGrammarEngine {
    conjugate(verb: string, tense: 'past' | 'present' | 'future' | 'continuous'): string;
    list(items: string[]): string;
    fillTemplate(template: string, factors: Record<string, string>): string;
    capitalize(text: string): string;
}

export class EnglishGrammarEngine implements IGrammarEngine {

    /**
     * Simple conjugation engine
     * In a real app, this would use a library or a larger dictionary
     */
    conjugate(verb: string, tense: 'past' | 'present' | 'future' | 'continuous'): string {
        const v = verb.toLowerCase();

        // Irregulars (small list for now)
        const irregularities: Record<string, any> = {
            'build': { past: 'built', present: 'builds', continuous: 'building' },
            'lead': { past: 'led', present: 'leads', continuous: 'leading' },
            'run': { past: 'ran', present: 'runs', continuous: 'running' },
            'create': { past: 'created', present: 'creates', continuous: 'creating' }
        };

        if (irregularities[v]) {
            if (tense === 'future') return `will ${v}`;
            return irregularities[v][tense] || v;
        }

        // Regular rules
        switch (tense) {
            case 'past':
                return v.endsWith('e') ? `${v}d` : `${v}ed`;
            case 'present':
                return `${v}s`;
            case 'continuous':
                return v.endsWith('e') ? `${v.slice(0, -1)}ing` : `${v}ing`;
            case 'future':
                return `will ${v}`;
            default:
                return v;
        }
    }

    /**
     * Oxford Commas included!
     */
    list(items: string[]): string {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} and ${items[1]}`;

        const allButLast = items.slice(0, -1).join(', ');
        const last = items[items.length - 1];
        return `${allButLast}, and ${last}`;
    }

    capitalize(text: string): string {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    /**
     * Fills "He {action_past} the {subject}"
     * Handles {action_past}, {action_present}, etc.
     */
    fillTemplate(template: string, factors: Record<string, string>): string {
        return template.replace(/\{(\w+)(?:_(\w+))?\}/g, (match, key, modifier) => {
            const value = factors[key];
            if (!value) return match; // Keep unresolved slots? Or empty?

            // If it's a verb (modifier is a tense)
            if (modifier && ['past', 'present', 'future', 'continuous'].includes(modifier)) {
                return this.conjugate(value, modifier as any);
            }

            // Generic formatting
            if (modifier === 'capitalize') {
                return this.capitalize(value);
            }

            return value;
        });
    }
}
