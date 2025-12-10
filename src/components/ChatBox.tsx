import { useState, useEffect, useRef } from 'react';
// We change the import slightly to explicitly assign the type later
import jsonData from './profile_data.json';
import '../index.css';

// --- A complete and accurate interface for our JSON data ---
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

interface ProfileData {
  bot: { name: string; persona: string; lumo_intro: string; };
  memory: { user_name: null; last_topic: null; };
  work_experience: WorkExperience[];
  conversation_starters: ConversationStarter[];
  fact_snippets: Array<{ topic: string; text: string; }>;
  fallbacks: string[];
  intents: { [key: string]: { keywords: string[]; response: string[] | string; }; };
}

interface Message {
  from: 'user' | 'bot';
  text: string;
  displayingText?: string;
}

// Explicitly type the imported JSON data
const profileData: ProfileData = jsonData;

let introDisplayed = false;
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));


function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastTopic, setLastTopic] = useState<string | null>(null);

  const displayHumanizedMessage = async (text: string, from: 'user' | 'bot' = 'bot', topicToSet: string | null = null) => {
    if (from === 'bot' && topicToSet) {
      setLastTopic(topicToSet);
    }
    const newMsg: Message = { from, text, displayingText: '' };
    setMessages(prev => [...prev, newMsg]);
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
  };

  const getBotResponse = (userInput: string, currentTopic: string | null): string => {
    const lowercasedInput = userInput.toLowerCase().trim();
    const isAffirmative = profileData.intents.affirmative.keywords.some(k => lowercasedInput.includes(k));

    if (isAffirmative && currentTopic) {
      setLastTopic(null);
      const fact = profileData.fact_snippets.find(f => f.topic === currentTopic);
      if (fact) return fact.text;
      if (currentTopic === 'experience') {
        const companies = profileData.work_experience.map(exp => exp.company).join(', ');
        return `Nate has worked at places like ${companies}. Want to know more about a specific one?`;
      }
    }

    for (const [intentName, intent] of Object.entries(profileData.intents)) {
      if (intentName === 'affirmative') continue;
      if (intent.keywords.some(keyword => lowercasedInput.includes(keyword.toLowerCase()))) {
        const responses = Array.isArray(intent.response) ? intent.response : [intent.response];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    return profileData.fallbacks[Math.floor(Math.random() * profileData.fallbacks.length)];
  };

  useEffect(() => {
    if (introDisplayed) return;
    introDisplayed = true;
    const startConversation = async () => {
      setIsTyping(true);
      await sleep(1000);
      const starter = profileData.conversation_starters[Math.floor(Math.random() * profileData.conversation_starters.length)];
      await displayHumanizedMessage(profileData.bot.lumo_intro);
      await sleep(1200);
      const followUp = Array.isArray(starter.follow_up) ? starter.follow_up[Math.floor(Math.random() * starter.follow_up.length)] : starter.follow_up;
      await displayHumanizedMessage(followUp, 'bot', starter.topic);
      setIsTyping(false);
    };
    startConversation();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    try {
      await sleep(500);
      const botResponse = getBotResponse(currentInput, lastTopic);
      await displayHumanizedMessage(botResponse);
    } catch (err) {
      console.error("Error:", err);
      const fallback = "Hmm, I'm having trouble thinking right now. Could you try again?";
      await displayHumanizedMessage(fallback);
    } finally {
      setIsTyping(false);
    }
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
                <img src="/lumo_favicon.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover" />
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
        {isTyping && messages[messages.length - 1]?.from === 'user' && (
          <div className="chatbox-message chatbox-message-bot">
            <div className="chatbox-avatar">
              <img src="/lumo_favicon.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div className="chatbox-typing-indicator">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
      </div>
      <div className="chatbox-input-container">
        <form onSubmit={handleFormSubmit} className="chatbox-input-wrapper">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} className="chatbox-input" placeholder="Ask me about Nate's skills, experience, or projects..." />
        </form>
      </div>
    </div>
  );
}

export default ChatBox;