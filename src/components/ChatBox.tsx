import { useState, useEffect, useRef } from 'react';
import jsonData from './profile_data.json';
import '../index.css';

// --- Interfaces (Update ProfileData interface) ---
interface WorkExperience {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  link: string;
  summary?: string;
  achievements?: string[];
}
interface ConversationStarter {
  greeting: string | string[];
  follow_up: string | string[];
  topic: string;
}
// ADD re_engagement_prompts to the interface
interface ProfileData {
  bot: { name: string; persona: string; lumo_intro: string; };
  memory: { user_name: null; last_topic: null; };
  work_experience: WorkExperience[];
  conversation_starters: ConversationStarter[];
  fact_snippets: Array<{ topic: string; text: string; }>;
  re_engagement_prompts: string[];
  fallbacks: string[];
  intents: { [key: string]: { keywords: string[]; response: string[] | string; }; };
}
interface Message {
  from: 'user' | 'bot';
  text: string;
  displayingText?: string;
}
interface BotResponse {
  text: string;
  topicToSet: string | null;
}

declare global {
  interface Window { __nudgedPrompts?: string[]; }
}

const profileData: ProfileData = jsonData;
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));


function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const introDisplayed = useRef(false);
  
  // NEW: Ref to hold the inactivity timer
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // NEW: Helper function to clear the timer
  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const displayHumanizedMessage = async (text: string, from: 'user' | 'bot' = 'bot', topicToSet: string | null = null) => {
    clearInactivityTimer(); // Clear any existing timer when a new message starts displaying
    if (from === 'bot') {
      setLastTopic(topicToSet);
    }
    const newMsg: Message = { from, text, displayingText: '' };
    setMessages(prev => [...prev, newMsg]);
    
    // Typing animation logic...
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (i > 0 && char !== ' ' && Math.random() < 0.025) {
            const wrongChar = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
            setMessages(prev => prev.map((msg, index) => index === prev.length - 1 ? { ...msg, displayingText: msg.displayingText + wrongChar } : msg));
            await sleep(Math.random() * 100 + 150);
            setMessages(prev => prev.map((msg, index) => index === prev.length - 1 ? { ...msg, displayingText: msg.displayingText!.slice(0, -1) } : msg));
            await sleep(Math.random() * 80 + 100);
        }
        setMessages(prev => prev.map((msg, index) => index === prev.length - 1 ? { ...msg, displayingText: msg.displayingText + char } : msg));
        let baseDelay = Math.random() * 35 + 20;
        if (char === ' ') baseDelay += (Math.random() * 50);
        if (char === ',' || char === '،') baseDelay += (Math.random() * 150 + 100);
        if (char === '.' || char === '?' || char === '!') baseDelay += (Math.random() * 250 + 200);
        await sleep(baseDelay);
    }

    // NEW: Progressive Disclosure & User-Driven: Only nudge once per session, randomize and do not repeat
    if (from === 'bot' && topicToSet) {
      if (!window.__nudgedPrompts) window.__nudgedPrompts = [];
      inactivityTimerRef.current = setTimeout(async () => {
        setIsTyping(true);
        // Filter out prompts already used this session
        if (!window.__nudgedPrompts) window.__nudgedPrompts = [];
        const unusedPrompts = profileData.re_engagement_prompts.filter(p => !window.__nudgedPrompts!.includes(p));
        if (unusedPrompts.length === 0) {
          setIsTyping(false);
          return; // No more nudges this session
        }
        const prompt = unusedPrompts[Math.floor(Math.random() * unusedPrompts.length)];
        if (!window.__nudgedPrompts) window.__nudgedPrompts = [];
        window.__nudgedPrompts.push(prompt);
        await displayHumanizedMessage(prompt, 'bot', topicToSet);
        setIsTyping(false);
      }, 20000); // 20 seconds
    }
  };

  const getBotResponse = (userInput: string, currentTopic: string | null): BotResponse => {
    const lowercasedInput = userInput.toLowerCase().trim();
    
    // --- Priority 1: Handle contextual follow-ups from a direct question ---
    const isAffirmative = profileData.intents.affirmative.keywords.some(k => lowercasedInput.includes(k));
    if (isAffirmative && currentTopic) {
      const fact = profileData.fact_snippets.find(f => f.topic === currentTopic);
      if (fact) {
        return { text: fact.text, topicToSet: null };
      }
    }

    // --- Priority 2: Handle "empty" acknowledgements when there's NO topic ---
    if (!currentTopic) {
        const isAcknowledgement = profileData.intents.acknowledgement.keywords.some(k => lowercasedInput === k);
        const isVagueAffirmative = (lowercasedInput === 'yes' || lowercasedInput === 'yeah');

        if (isAcknowledgement || isVagueAffirmative) {
            const responses = profileData.intents.acknowledgement.response as string[];
            const response = responses[Math.floor(Math.random() * responses.length)];
            return { text: response, topicToSet: null };
        }
    }

    // --- Priority 3: Check for specific company names (Entity Recognition) ---
    for (const exp of profileData.work_experience) {
        if (lowercasedInput.includes(exp.company.toLowerCase())) {
            const responseText = `At ${exp.company}, Nate worked as a ${exp.role}. ${exp.description}`;
            return { text: responseText, topicToSet: null };
        }
    }

    // --- Priority 4: Check for general intents that ask a question ---
    const listCompanies = (): string => {
        const companies = profileData.work_experience.map(exp => exp.company);
        const lastCompany = companies.pop();
        return companies.length > 0 ? `${companies.join(', ')}, and ${lastCompany}` : lastCompany || "some great places";
    };

    if (lowercasedInput.includes("work") || lowercasedInput.includes("experience") || lowercasedInput.includes("job")) {
        const responseText = `Nate has a solid background working at places like ${listCompanies()}. Are you curious about a specific one?`;
        return { text: responseText, topicToSet: 'experience' };
    }

    // --- Priority 5: Handle other simple intents like greetings ---
    for (const [intentName, intent] of Object.entries(profileData.intents)) {
      if (['affirmative', 'acknowledgement'].includes(intentName)) continue;
      if (intent.keywords.some(keyword => fuzzyMatch(lowercasedInput, keyword.toLowerCase()))) {
        const responses = Array.isArray(intent.response) ? intent.response : [intent.response];
        return { text: responses[Math.floor(Math.random() * responses.length)], topicToSet: null };
      }
    }

    // --- Fuzzy matching helper ---
  function fuzzyMatch(input: string, keyword: string): boolean {
    // If the keyword is very short, use includes
    if (keyword.length <= 4) return input.includes(keyword);
    // Allow one missing/extra/incorrect char for typos
    const distance = levenshtein(input.replace(/\s+/g, ''), keyword.replace(/\s+/g, ''));
    if (distance <= 1) return true;
    // Also match if input includes keyword ignoring spaces
    if (input.replace(/\s+/g, '').includes(keyword.replace(/\s+/g, ''))) return true;
    // Also match if input includes keyword as a substring
    if (input.includes(keyword)) return true;
    return false;
  }

  // --- Simple Levenshtein distance implementation ---
  function levenshtein(a: string, b: string): number {
    const dp = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1];
        else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[a.length][b.length];
  }

  // --- Priority 6: Fallback if nothing else matches ---
    const fallbackResponse = profileData.fallbacks[Math.floor(Math.random() * profileData.fallbacks.length)];
    return { text: fallbackResponse, topicToSet: 'experience' };
  };

  useEffect(() => {
    if (introDisplayed.current) return;
    introDisplayed.current = true;
    
    // Progressive Disclosure: Only send a single greeting, no immediate follow-up
    const startConversation = async () => {
      setIsTyping(true);
      await sleep(1000);
      await displayHumanizedMessage(profileData.bot.lumo_intro, 'bot', null);
      setIsTyping(false);
    };
    startConversation();
  }, []);

  // NEW: Effect for cleaning up the timer when the component unmounts
  useEffect(() => {
    return () => {
      clearInactivityTimer();
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    clearInactivityTimer(); // Clear timer on submit
    
    const userMsg: Message = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    
    try {
      await sleep(500);
      const botResponse = getBotResponse(currentInput, lastTopic);
      await displayHumanizedMessage(botResponse.text, 'bot', botResponse.topicToSet);
    } catch (err) {
      console.error("Error:", err);
      const fallback = "Hmm, I'm having trouble thinking right now. Could you try again?";
      await displayHumanizedMessage(fallback, 'bot', null);
    } finally {
      setIsTyping(false);
    }
  };

  // NEW: Separate input change handler to clear timer on type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearInactivityTimer();
    setInput(e.target.value);
  };

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping) { inputRef.current?.focus(); }
  }, [isTyping]);

  return (
    <div className="chatbox-container">
      <div ref={outputRef} className="chatbox-output">
        {messages.map((msg, i) => (
          <div key={i} className={`chatbox-message ${msg.from === 'user' ? 'chatbox-message-user' : 'chatbox-message-bot'}`}>
            {msg.from === 'bot' && (
              <div className="chatbox-avatar">
                <img src="/lumo_avatar.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover"/>
              </div>
            )}
            <div className="chatbox-message-content">
              {msg.displayingText !== undefined ? msg.displayingText : msg.text}
              {msg.from === 'bot' && msg.displayingText && msg.displayingText.length < msg.text.length && (
                <span className="animate-pulse">_</span>
              )}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length -1]?.from === 'user' && (
          <div className="chatbox-message chatbox-message-bot">
            <div className="chatbox-avatar">
              <img src="/lumo_avatar.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover"/>
            </div>
            <div className="chatbox-typing-indicator">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
      </div>
      <div className="chatbox-input-container" style={{
        background: 'transparent',
        borderTop: '1px solid var(--border)',
        padding: '0.75rem 1rem',
      }}>
        <form onSubmit={handleFormSubmit} className="chatbox-input-wrapper" style={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {/* Use the new handleInputChange function here */}
          <input 
            ref={inputRef} 
            type="text" 
            value={input} 
            onChange={handleInputChange} 
            disabled={isTyping} 
            className="chatbox-input" 
            placeholder="Ask me about Nate's skills, experience, or projects..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--foreground)',
              width: '100%',
              padding: '0.5rem 0',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
            }}
          />
        </form>
      </div>
    </div>
  );
}

export default ChatBox;