import type { ChatEngine, BotResponse, ConversationTurn } from './ChatEngine';
import profile from '../data/profile_data_enhanced.json';

/**
 * GeminiEngine — LLM-powered engine using Google Gemini Free Tier.
 *
 * HOW TO ACTIVATE (when ready):
 * 1. Get a free API key: https://aistudio.google.com/app/apikey
 * 2. Add to .env:  VITE_GEMINI_KEY=your_key_here
 * 3. Restrict key to your domain in Google Cloud Console (prevents abuse)
 * 4. In ChatBox.tsx, replace:
 *      return new RuleBasedEngine()
 *    with:
 *      const key = import.meta.env.VITE_GEMINI_KEY
 *      return key ? new GeminiEngine(key) : new RuleBasedEngine()
 *
 * Free tier: 1,500 requests/day, 15 RPM — more than enough for a portfolio.
 * Cost: $0
 */
export class GeminiEngine implements ChatEngine {
    private apiKey: string;
    private systemPrompt: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.systemPrompt = buildSystemPrompt();
    }

    async chat(input: string, history: ConversationTurn[]): Promise<BotResponse> {
        const contents = [
            ...history.map(t => ({
                role: t.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: t.content }]
            })),
            { role: 'user', parts: [{ text: input }] }
        ];

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: this.systemPrompt }] },
                    contents,
                    generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
                })
            }
        );

        if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";

        return {
            text,
            suggestions: [
                { label: 'Experience', payload: "What's his experience?" },
                { label: 'Skills', payload: 'What are his skills?' },
                { label: 'Contact', payload: 'How to contact?' },
            ]
        };
    }

    getGreeting(): BotResponse {
        return {
            text: `Hey! I'm Lumo, Nate's AI assistant. I know everything about his ${profile.experience.summary.total_years} years of design work. What would you like to know?`,
            suggestions: [
                { label: 'Experience', payload: "What's his experience?" },
                { label: 'Skills', payload: 'What are his skills?' },
                { label: 'Contact', payload: 'How to contact?' },
            ]
        };
    }

    getProactiveNudge(): BotResponse {
        return {
            text: "Still there? Feel free to ask me anything about Nate's work!",
            suggestions: [
                { label: 'Experience', payload: "What's his experience?" },
                { label: 'Contact', payload: 'How to contact?' },
            ]
        };
    }
}

function buildSystemPrompt(): string {
    const id = profile.identity;
    const exp = profile.experience;
    const skills = profile.skills;
    const contact = profile.contact;

    const experienceLines = exp.timeline
        .map(e => `- ${e.role.title} at ${e.company.name} (${e.role.start} to ${e.role.end}): ${e.storytelling.medium}`)
        .join('\n');

    const skillLines = Object.values(skills.categories)
        .flatMap((cat: any) => cat.competencies)
        .map((s: any) => `- ${s.name} (${s.proficiency}): ${s.description}`)
        .join('\n');

    return `You are Lumo, a friendly and slightly playful AI assistant representing ${id.full_name.value} (nickname: ${id.full_name.nickname}).
Your job is to help visitors learn about Nate's professional background.

PERSONALITY:
- Warm, helpful, and concise
- Use light humour but stay professional
- Answer ONLY questions related to Nate's work, skills, background, and contact
- For off-topic questions, politely redirect back to Nate's profile

NATE'S PROFILE:
Name: ${id.full_name.value} (Nate)
Current Role: ${id.current_title.value} at ${id.current_title.company}
Location: ${id.location.city}, ${id.location.country}
Summary: ${profile.career_narrative.elevator_pitch}

WORK EXPERIENCE:
${experienceLines}

SKILLS:
${skillLines}

CONTACT:
Email: ${contact.primary.value}
LinkedIn: ${contact.social.linkedin.url}
Behance: ${contact.social.behance.url}

RESPONSE RULES:
- Keep responses under 100 words unless asked for detail
- Use plain text only — no markdown headers, no asterisks
- End with a relevant follow-up suggestion when appropriate
- Never fabricate information not in this profile`;
}
