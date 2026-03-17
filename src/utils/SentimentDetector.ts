/**
 * SentimentDetector — reads the framing of a question before routing.
 * Determines HOW something is being asked, not just WHAT.
 */

export type Sentiment = 'skeptical' | 'negative' | 'deep_dive' | 'comparison' | 'casual' | 'neutral';

const SIGNALS: Record<Exclude<Sentiment, 'neutral'>, string[]> = {
    skeptical: [
        'really', 'actually', 'prove', 'seriously', 'how do you know',
        'doubt', 'why should', 'sure about', 'convinced', 'guarantee',
        'just saying', 'supposedly', 'claim'
    ],
    negative: [
        'bad', 'weak', 'fail', 'failed', 'struggle', "can't", 'worst',
        'not good', 'poor', 'lacking', 'never', 'wrong', 'mistake',
        'weakness', 'limitation', 'problem with', 'issue with', 'flaw'
    ],
    deep_dive: [
        'how exactly', 'explain', 'walk me through', 'specifically',
        'in detail', 'elaborate', 'expand', 'more about', 'what happened',
        'how did', 'tell me more', 'dig into', 'break down', 'unpack'
    ],
    comparison: [
        'better', 'vs', 'versus', 'compare', 'different', 'over others',
        'than other', 'unique', 'stand out', 'unlike', 'contrast',
        'how does', 'what makes him different'
    ],
    casual: [
        'cool', 'nice', 'interesting', 'wow', 'awesome', 'great',
        'love', 'amazing', 'sweet', 'neat', 'rad'
    ],
};

export function detectSentiment(input: string): Sentiment {
    const norm = input.toLowerCase();
    for (const [sentiment, words] of Object.entries(SIGNALS) as [Sentiment, string[]][]) {
        if (words.some(w => norm.includes(w))) return sentiment;
    }
    return 'neutral';
}

export const SENTIMENT_OPENERS: Record<Sentiment, string[]> = {
    skeptical: [
        "Fair — here's the specific evidence:",
        "Here's what actually happened:",
        "Good question — concrete answer:"
    ],
    negative: [
        "Honestly?",
        "Real talk —",
        "Not everything was smooth —"
    ],
    deep_dive: [
        "Getting into it —",
        "Here's how it actually worked:",
        "The real story:"
    ],
    comparison: [
        "Here's how it compares:",
        "Interesting contrast —",
        "The difference is real —"
    ],
    casual: ["", "", ""],
    neutral: ["", "", ""],
};

export function pickOpener(sentiment: Sentiment): string {
    const pool = SENTIMENT_OPENERS[sentiment];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick ? pick + ' ' : '';
}
