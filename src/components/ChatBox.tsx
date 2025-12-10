import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SmartBot } from '../utils/SmartBot';
import { RetroButton } from './ui/RetroButton';
import '../index.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  displayingText?: string;
  suggestions?: { label: string; payload: string }[];
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const smartBot = useMemo(() => new SmartBot(), []);
  const hasStarted = useRef(false);

  // Function to display text with typing effect
  const displayHumanizedMessage = useCallback(async (text: string, from: 'user' | 'bot' = 'bot', suggestions?: { label: string; payload: string }[]) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: from,
      text,
      displayingText: '',
      timestamp: new Date(),
      suggestions
    };

    setMessages(prev => [...prev, newMsg]);

    // Typing effect logic
    let currentText = '';
    // Typing speed: faster for long text
    let baseDelay = text.length > 100 ? 10 : 20;

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      // Update the last message's displayingText
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], displayingText: currentText };
        return updated;
      });

      const char = text[i];
      if (['.', '?', '!'].includes(char)) await sleep(baseDelay + 150);
      else await sleep(baseDelay);
    }

    // Finalize
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        displayingText: text
      };
      return updated;
    });
  }, []);

  // Initial Greeting
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startChat = async () => {
      setIsTyping(true);
      await sleep(500);

      const hour = new Date().getHours();
      let intro = "Good evening! 🌙";
      if (hour < 12) intro = "Good morning! ☀️";
      else if (hour < 18) intro = "Good afternoon! 🌤️";

      await displayHumanizedMessage(intro);

      await sleep(1000);
      await displayHumanizedMessage("Ask me about his Experience, Skills, or Contact Info! 🦴", 'bot', [
        { label: "Experience", payload: "Tell me about Nate's experience" },
        { label: "Skills", payload: "What are Nate's skills?" },
        { label: "Contact Info", payload: "How can I contact Nate?" }
      ]);

      setIsTyping(false);
    };

    startChat();
  }, [displayHumanizedMessage]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    await sleep(600 + Math.random() * 500);

    try {
      // Get response from SmartBot engine
      const botResponse = smartBot.process(text);
      await displayHumanizedMessage(botResponse.text, 'bot', botResponse.suggestions);
    } catch (err) {
      console.error("AI Error:", err);
      await displayHumanizedMessage("My brain froze! 🥶 Can you say that again?");
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, smartBot, displayHumanizedMessage]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend(input);
  };



  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="chatbox-container">
      <div ref={outputRef} className="chatbox-output">
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbox-message ${msg.sender === 'user' ? 'chatbox-message-user' : 'chatbox-message-bot'}`}>
            {msg.sender === 'bot' && (
              <div className="chatbox-avatar">
                <img src="/lumo_favicon.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover" />
              </div>
            )}
            <div className="chatbox-message-content">
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-none'
                  : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-tl-none border border-[var(--border)]'
                  }`}
              >
                {msg.displayingText !== undefined ? msg.displayingText : msg.text}
                {msg.sender === 'bot' && msg.displayingText && msg.displayingText.length < msg.text.length && (
                  <span className="animate-pulse">_</span>
                )}
              </div>

              {/* Suggestions Rendering - Show only when typing is complete */}
              {msg.sender === 'bot' &&
                msg.suggestions &&
                msg.suggestions.length > 0 &&
                (msg.displayingText === msg.text) && (
                  <div className="suggestion-buttons animate-fade-in-up">
                    {msg.suggestions.map((suggestion, idx) => (
                      <RetroButton
                        key={idx}
                        onClick={() => handleSend(suggestion.payload)}
                        title={suggestion.label}
                      >
                        {suggestion.label}
                      </RetroButton>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length - 1]?.sender === 'user' && (
          <div className="chatbox-message chatbox-message-bot">
            <div className="chatbox-avatar">
              <img src="/lumo_favicon.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div className="max-w-[80%] p-3 rounded-2xl bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-tl-none border border-[var(--border)]">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="chatbox-input-form">
        <div className="chatbox-input-container" style={{ borderTop: 'none', background: 'transparent' }}>
          <div className="chatbox-input-wrapper">
            <input
              type="text"
              className="chatbox-input"
              style={{ padding: '8px 0', fontSize: '14px' }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumo..."
              disabled={isTyping}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;