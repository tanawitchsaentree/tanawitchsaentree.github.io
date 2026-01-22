import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { LumoAI } from '../utils/LumoAI';
import { UIController } from '../utils/UIController';
import { useTheme } from 'next-themes';
import { RetroButton } from './ui/RetroButton';
import '../index.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  displayingText?: string;
  suggestions?: { label: string; payload: string; icon?: string }[];
  suggestionsUsed?: boolean; // Track if suggestions have been clicked
  media?: {
    type: 'image' | 'video';
    url: string;
    alt: string;
    caption?: string;
  };
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const ChatBox: React.FC = () => {
  const { setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const lumoAI = useMemo(() => new LumoAI(), []);
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

  // Initial Greeting - Championship AI Style
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startChat = async () => {
      setIsTyping(true);
      await sleep(500);

      // Get smart greeting from LumoAI
      const greeting = lumoAI.selectGreeting();

      // Add easter egg if applicable
      const easterEgg = lumoAI.addEasterEgg();
      const greetingText = easterEgg ? `${easterEgg} \n${greeting.message} ` : greeting.message;

      await displayHumanizedMessage(greetingText, 'bot', greeting.suggestions);

      // Optional follow-up message


      setIsTyping(false);
    };

    startChat();
  }, [displayHumanizedMessage, lumoAI]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Hide all suggestion buttons by marking messages as actioned
    setMessages(prev => prev.map(msg =>
      msg.suggestions ? { ...msg, suggestionsUsed: true } : msg
    ));

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
      // Get response from LumoAI engine - Championship intelligence!
      const aiResponse = await lumoAI.generateResponse(text);

      // Execute commands (Magic Layer - Cortex Module 2)
      if (aiResponse.command) {
        console.log('[🧠 Cortex] Executing command:', aiResponse.command);
        switch (aiResponse.command.type) {
          case 'scroll':
            UIController.scrollTo(aiResponse.command.value);
            break;
          case 'download':
            UIController.downloadCV();
            break;
          case 'theme':
            UIController.dispatchThemeChange('toggle');
            break;
        }
      }

      // Display Message + Media
      await displayHumanizedMessage(aiResponse.text, 'bot', aiResponse.suggestions);

      // If media exists, we need to append it or handle it. 
      // Current displayHumanizedMessage only takes text.
      // We need to update displayHumanizedMessage signature OR update state directly.
      if (aiResponse.media) {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          updated[updated.length - 1] = { ...lastMsg, media: aiResponse.media };
          return updated;
        });
      }

      // Track topic for conversation context
      lumoAI.trackTopic(text);
    } catch (err) {
      console.error("AI Error:", err);
      await displayHumanizedMessage("My brain froze! 🥶 Can you say that again?");
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, lumoAI, displayHumanizedMessage]);

  // IDLE TIMER LOGIC (Charm Module)
  useEffect(() => {
    const IDLE_TIMEOUT = 30000; // 30 seconds
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Only nudge if not typing and last message wasn't a nudge (simple check)
        if (!isTyping && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.sender === 'bot') { // Don't interrupt user
            // Trigger Nudge
            const nudge = lumoAI.getProactiveNudge();
            if (nudge.text) {
              displayHumanizedMessage(nudge.text, 'bot', nudge.suggestions);
            }
          }
        }
      }, IDLE_TIMEOUT);
    };

    // Listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer(); // Start

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [messages, isTyping, lumoAI, displayHumanizedMessage]);

  // Handle email copy to clipboard
  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  // Rich Text Rendering Engine
  const renderRichText = (text: string) => {
    // 1. Handle Bullet Points (Split by newline)
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Check for bullet point
      const isBullet = line.trim().startsWith('- ');
      const content = isBullet ? line.trim().substring(2) : line;

      // 2. Parse Inline Styles (Bold, Link, Email)
      // Regex explanation:
      // (\*\*[^*]+\*\*) -> Bold: **text**
      // (\[.*?\]\(.*?\)) -> Link: [text](url)
      // ([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+) -> Email
      const parts = content.split(/(\*\*[^*]+\*\*|\[.*?\]\(.*?\)|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g);

      const renderedParts = parts.map((part, partIdx) => {
        // Handle Bold
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} className="font-bold text-[var(--foreground)]">{part.substring(2, part.length - 2)}</strong>;
        }

        // Handle Link
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const [label, url] = part.match(/\[(.*?)\]\((.*?)\)/)?.slice(1) || [];
          if (label && url) {
            return (
              <a
                key={partIdx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline hover:text-blue-500 transition-colors"
              >
                {label}
                <ExternalLink size={12} strokeWidth={3} />
              </a>
            );
          }
        }

        // Handle Email
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/;
        if (emailRegex.test(part)) {
          return (
            <span key={partIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <strong className="text-[var(--foreground)]">{part}</strong>
              <button
                onClick={() => handleCopyEmail(part)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  verticalAlign: 'middle',
                  opacity: copiedEmail ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                  color: 'inherit'
                }}
                title={copiedEmail ? "Copied!" : "Copy email"}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = copiedEmail ? '1' : '0.5'}
              >
                {copiedEmail ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </span>
          );
        }

        return part;
      });

      // Return wrapped line
      if (isBullet) {
        return (
          <div key={lineIdx} className="flex gap-2 mb-1 ml-1">
            <span className="text-[var(--muted-foreground)]">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      // Normal line (preserve newlines if not last)
      return (
        <React.Fragment key={lineIdx}>
          {renderedParts}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend(input);
  };



  // Theme listener for Cortex Control
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      if (e.detail.mode === 'toggle') {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
      } else {
        setTheme(e.detail.mode);
      }
    };
    window.addEventListener('lumo-theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('lumo-theme-change', handleThemeChange as EventListener);
  }, [setTheme]);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="chatbox-container">
      <div ref={outputRef} className="chatbox-output" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        <div style={{ flexGrow: 1, minHeight: 0 }} />
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`chatbox-message ${msg.sender === 'user' ? 'chatbox-message-user' : 'chatbox-message-bot'} `}>
            {msg.sender === 'bot' && (
              <div className="chatbox-avatar">
                <img src="/lumo_favicon.svg" alt="Lumo Avatar" className="w-8 h-8 rounded-full object-cover" />
              </div>
            )}
            <div className="chatbox-message-content">
              <div
                className={`max-w-[85%] rounded-[20px] px-5 py-3 shadow-sm ${msg.sender === 'user'
                  ? 'bg-[var(--foreground)] text-[var(--background)] rounded-br-[4px]'
                  : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-bl-[4px]'
                  }`}
              >
                {/* Media Rendering (Charm Module) */}
                {msg.media && msg.media.type === 'image' && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-[var(--border)]">
                    <img
                      src={msg.media.url}
                      alt={msg.media.alt}
                      className="w-full h-auto object-cover max-h-[200px]"
                      loading="lazy"
                    />
                    {msg.media.caption && (
                      <p className="text-[var(--muted-foreground)] text-xs p-2 bg-[var(--background)] m-0 border-t border-[var(--border)]">
                        {msg.media.caption}
                      </p>
                    )}
                  </div>
                )}

                <div className={`text-sm leading-relaxed ${isTyping && idx === messages.length - 1 && msg.sender === 'bot' ? 'typing-effect' : ''}`}>
                  {renderRichText(msg.displayingText || msg.text)}
                </div>
              </div>

              {/* Suggestions Rendering - Show only when typing is complete AND not used */}
              {msg.sender === 'bot' &&
                msg.suggestions &&
                msg.suggestions.length > 0 &&
                !msg.suggestionsUsed &&
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
            <div className="max-w-[80%] p-3 rounded-2xl bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-tl-none border border-[var(--border)]" style={{ maxWidth: '420px' }}>
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
              style={{ fontSize: '14px' }}
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