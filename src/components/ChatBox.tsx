import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Copy, Check, ExternalLink, Send } from 'lucide-react';
import type { ChatEngine, BotResponse, ConversationTurn } from '../utils/ChatEngine';
import { RuleBasedEngine } from '../utils/RuleBasedEngine';
import { UIController } from '../utils/UIController';
import { useTheme } from 'next-themes';
import { RetroButton } from './ui/RetroButton';
import '../index.css';

// ─── To switch to Gemini when ready, replace the engine factory below: ─────────
// import { GeminiEngine } from '../utils/GeminiEngine';
// const createEngine = (): ChatEngine => {
//   const key = import.meta.env.VITE_GEMINI_KEY;
//   return key ? new GeminiEngine(key) : new RuleBasedEngine();
// };
const createEngine = (): ChatEngine => new RuleBasedEngine();
// ────────────────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    displayingText?: string;
    suggestions?: { label: string; payload: string; icon?: string }[];
    suggestionsUsed?: boolean;
    pending?: boolean;
    media?: {
        type: 'image' | 'video';
        url: string;
        alt: string;
        caption?: string;
    };
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const ChatBox: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [thought, setThought] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);

    // Conversation history for engine context (max 10 turns)
    const conversationHistory = useRef<ConversationTurn[]>([]);

    // Pending message queue — typed while bot is responding
    const pendingQueue = useRef<{ id: string; text: string }[]>([]);

    const engine = useMemo(() => createEngine(), []);

    // ─── Typing Effect (batched — avoids 300 setState calls) ────────────────────
    const displayMessage = useCallback(async (
        text: string,
        from: 'user' | 'bot' = 'bot',
        suggestions?: { label: string; payload: string }[]
    ) => {
        const id = Date.now().toString();

        setMessages(prev => [...prev, {
            id,
            sender: from,
            text,
            displayingText: from === 'user' ? text : '',
            timestamp: new Date(),
            suggestions
        }]);

        if (from === 'user') return;

        // Batch chars: update every ~4 chars or at punctuation
        const baseDelay = text.length > 150 ? 8 : 15;
        let cursor = 0;

        while (cursor < text.length) {
            // Collect chars until next natural pause
            let end = Math.min(cursor + 4, text.length);
            while (end < text.length && !['.', '?', '!', '\n'].includes(text[end - 1])) {
                end++;
                if (end - cursor >= 8) break;
            }

            const chunk = text.slice(cursor, end);
            cursor = end;
            const isPause = ['.', '?', '!'].includes(chunk[chunk.length - 1]);

            setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.id === id) {
                    updated[updated.length - 1] = {
                        ...last,
                        displayingText: (last.displayingText ?? '') + chunk
                    };
                }
                return updated;
            });

            await sleep(isPause ? baseDelay + 120 : baseDelay);
        }

        // Ensure final state is exact
        setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.id === id) {
                updated[updated.length - 1] = { ...last, displayingText: text };
            }
            return updated;
        });
    }, []);

    // ─── Initial Greeting ────────────────────────────────────────────────────────
    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const start = async () => {
            setIsTyping(true);
            await sleep(400);
            const greeting = engine.getGreeting();
            await displayMessage(greeting.text, 'bot', greeting.suggestions);
            setIsTyping(false);
        };

        start();
    }, [engine, displayMessage]);

    // ─── Engine Response (extracted so queue can reuse it) ───────────────────────
    const processEngineResponse = useCallback(async (text: string) => {
        setIsTyping(true);

        // Show thought during the sleep window
        const thoughtText = engine.getThought?.(text) ?? '';
        setThought(thoughtText);

        conversationHistory.current = [
            ...conversationHistory.current.slice(-9),
            { role: 'user', content: text }
        ];

        await sleep(500 + Math.random() * 400);
        setThought('');

        try {
            const aiResponse: BotResponse = await engine.chat(text, conversationHistory.current);

            if (aiResponse.command) {
                switch (aiResponse.command.type) {
                    case 'scroll': UIController.scrollTo(aiResponse.command.value ?? ''); break;
                    case 'download': UIController.downloadCV(); break;
                    case 'theme': UIController.dispatchThemeChange('toggle'); break;
                }
            }

            await displayMessage(aiResponse.text, 'bot', aiResponse.suggestions);

            conversationHistory.current = [
                ...conversationHistory.current.slice(-9),
                { role: 'assistant', content: aiResponse.text }
            ];

            if (aiResponse.media) {
                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = { ...last, media: aiResponse.media };
                    return updated;
                });
            }
        } catch (err) {
            console.error('Engine error:', err);
            await displayMessage("Something went wrong. Try again?");
        } finally {
            setIsTyping(false);
        }
    }, [engine, displayMessage]);

    // ─── Send Message ────────────────────────────────────────────────────────────
    const handleSend = useCallback(async (text: string) => {
        if (!text.trim()) return;

        setMessages(prev => prev.map(msg =>
            msg.suggestions ? { ...msg, suggestionsUsed: true } : msg
        ));

        // If bot is mid-response, queue the message — show it immediately as pending
        if (isTyping) {
            const pendingId = Date.now().toString();
            setMessages(prev => [...prev, {
                id: pendingId,
                sender: 'user',
                text,
                displayingText: text,
                timestamp: new Date(),
                pending: true,
            }]);
            pendingQueue.current.push({ id: pendingId, text });
            setInput('');
            return;
        }

        await displayMessage(text, 'user');
        setInput('');
        await processEngineResponse(text);
    }, [isTyping, displayMessage, processEngineResponse]);

    // ─── Process Queue when bot finishes ─────────────────────────────────────────
    const prevIsTyping = useRef(false);
    useEffect(() => {
        if (prevIsTyping.current && !isTyping && pendingQueue.current.length > 0) {
            const next = pendingQueue.current.shift()!;
            // Resolve pending state on the message
            setMessages(prev => prev.map(msg =>
                msg.id === next.id ? { ...msg, pending: false } : msg
            ));
            processEngineResponse(next.text);
        }
        prevIsTyping.current = isTyping;
    }, [isTyping, processEngineResponse]);

    // ─── IDLE Nudge (listeners attached once, refs for state) ───────────────────
    const isTypingRef = useRef(isTyping);
    const messagesLengthRef = useRef(messages.length);
    const lastSenderRef = useRef<'user' | 'bot' | null>(null);

    useEffect(() => { isTypingRef.current = isTyping; }, [isTyping]);
    useEffect(() => {
        messagesLengthRef.current = messages.length;
        lastSenderRef.current = messages[messages.length - 1]?.sender ?? null;
    }, [messages]);

    useEffect(() => {
        const IDLE_MS = 30_000;
        let timer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (!isTypingRef.current && messagesLengthRef.current > 0 && lastSenderRef.current === 'bot') {
                    const nudge = engine.getProactiveNudge();
                    if (nudge.text) displayMessage(nudge.text, 'bot', nudge.suggestions);
                }
            }, IDLE_MS);
        };

        window.addEventListener('mousemove', resetTimer, { passive: true });
        window.addEventListener('keydown', resetTimer, { passive: true });
        window.addEventListener('touchstart', resetTimer, { passive: true });
        resetTimer();

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
        };
    }, []); // ← empty deps: attach once, refs handle the rest

    // ─── Theme command listener ───────────────────────────────────────────────────
    useEffect(() => {
        const handleThemeChange = (e: CustomEvent) => {
            if (e.detail.mode === 'toggle') {
                setTheme(theme === 'dark' ? 'light' : 'dark');
            } else {
                setTheme(e.detail.mode);
            }
        };
        window.addEventListener('lumo-theme-change', handleThemeChange as EventListener);
        return () => window.removeEventListener('lumo-theme-change', handleThemeChange as EventListener);
    }, [setTheme, theme]);

    // ─── Auto-scroll ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (outputRef.current && isExpanded) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [messages, isTyping, isExpanded]);

    // ─── Click outside to collapse ───────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node) && isExpanded) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    // ─── Email copy ───────────────────────────────────────────────────────────────
    const handleCopyEmail = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    };

    // ─── Rich text renderer ───────────────────────────────────────────────────────
    const renderRichText = (text: string) => {
        const lines = text.split('\n');

        return lines.map((line, lineIdx) => {
            const isBullet = line.trim().startsWith('- ');
            const content = isBullet ? line.trim().substring(2) : line;

            const parts = content.split(/(\*\*[^*]+\*\*|\[.*?\]\(.*?\)|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g);

            const renderedParts = parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIdx} className="font-bold text-[var(--foreground)]">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                    const [label, url] = part.match(/\[(.*?)\]\((.*?)\)/)?.slice(1) || [];
                    if (label && url) {
                        return (
                            <a key={partIdx} href={url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline hover:text-blue-500 transition-colors">
                                {label}<ExternalLink size={12} strokeWidth={3} />
                            </a>
                        );
                    }
                }
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/;
                if (emailRegex.test(part)) {
                    return (
                        <span key={partIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                            <strong className="text-[var(--foreground)]">{part}</strong>
                            <button
                                onClick={() => handleCopyEmail(part)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', opacity: copiedEmail ? 1 : 0.5, transition: 'opacity 0.2s', color: 'inherit' }}
                                title={copiedEmail ? "Copied!" : "Copy email"}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = copiedEmail ? '1' : '0.5'}
                            >
                                {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </span>
                    );
                }
                return part;
            });

            if (isBullet) {
                return (
                    <div key={lineIdx} className="flex gap-2 mb-1 ml-1">
                        <span className="text-[var(--muted-foreground)]">•</span>
                        <span>{renderedParts}</span>
                    </div>
                );
            }
            return (
                <React.Fragment key={lineIdx}>
                    {renderedParts}
                    {lineIdx < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSend(input);
    };

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <div ref={containerRef} className={`chat-overlay-wrapper ${isExpanded ? 'expanded' : 'minimized'}`}>
            {isExpanded && (
                <button
                    onClick={e => { e.stopPropagation(); setIsExpanded(false); }}
                    className="chat-close-button"
                    aria-label="Close chat"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}

            <div
                className={`chat-overlay-box ${isExpanded ? 'expanded' : 'minimized'}`}
                onClick={() => !isExpanded && setIsExpanded(true)}
            >
                <div ref={outputRef} className="chatbox-output" style={{ display: isExpanded ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                    <div style={{ flexGrow: 1, minHeight: 0 }} />
                    {messages.map((msg, idx) => (
                        <div key={msg.id} className={`chatbox-message ${msg.sender === 'user' ? 'chatbox-message-user' : 'chatbox-message-bot'}`}>
                            {msg.sender === 'bot' && (
                                <div className="chatbox-avatar">
                                    <img src="/lumo_favicon.svg" alt="Lumo" className="w-8 h-8 rounded-full object-cover" />
                                </div>
                            )}
                            <div className="chatbox-message-content">
                                <div className={`max-w-[85%] rounded-[20px] px-5 py-3 shadow-sm transition-opacity ${msg.sender === 'user'
                                    ? 'bg-[var(--foreground)] text-[var(--background)] rounded-br-[4px]'
                                    : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-bl-[4px]'
                                    } ${msg.pending ? 'opacity-50' : 'opacity-100'}`}>
                                    {msg.media?.type === 'image' && (
                                        <div className="mb-3 rounded-lg overflow-hidden border border-[var(--border)]">
                                            <img src={msg.media.url} alt={msg.media.alt} className="w-full h-auto object-cover max-h-[200px]" loading="lazy" />
                                            {msg.media.caption && (
                                                <p className="text-[var(--muted-foreground)] text-xs p-2 bg-[var(--background)] m-0 border-t border-[var(--border)]">{msg.media.caption}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className={`text-sm leading-relaxed ${isTyping && idx === messages.length - 1 && msg.sender === 'bot' ? 'typing-effect' : ''}`}>
                                        {renderRichText(msg.displayingText || msg.text)}
                                    </div>
                                </div>

                                {msg.pending && (
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'var(--muted-foreground)',
                                        textAlign: 'right',
                                        marginTop: '4px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        gap: '3px',
                                    }}>
                                        <span className="animate-pulse">●</span>
                                        <span style={{ opacity: 0.6 }}>waiting</span>
                                    </div>
                                )}

                                {msg.sender === 'bot' &&
                                    msg.suggestions?.length &&
                                    !msg.suggestionsUsed &&
                                    msg.displayingText === msg.text && (
                                        <div className="suggestion-buttons animate-fade-in-up">
                                            {msg.suggestions.map((s, i) => (
                                                <RetroButton key={i} onClick={() => handleSend(s.payload)} title={s.label}>
                                                    {s.label}
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
                                <img src="/lumo_favicon.svg" alt="Lumo" className="w-8 h-8 rounded-full object-cover" />
                            </div>
                            <div className="max-w-[80%] p-3 rounded-2xl bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-tl-none border border-[var(--border)]">
                                {thought ? (
                                    <span style={{
                                        fontSize: '13px',
                                        fontStyle: 'italic',
                                        opacity: 0.75,
                                        letterSpacing: '0.01em',
                                    }}>
                                        {thought}
                                    </span>
                                ) : (
                                    <span className="animate-pulse">...</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleFormSubmit} className="chatbox-input-form" onClick={e => e.stopPropagation()}>
                    <div className="chatbox-input-container">
                        <div className="chatbox-input-wrapper">
                            <input
                                type="text"
                                className="chatbox-input"
                                style={{ fontSize: '14px' }}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onFocus={() => !isExpanded && setIsExpanded(true)}
                                placeholder="Ask Lumo..."
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                                    padding: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: input.trim() && !isTyping ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    opacity: input.trim() && !isTyping ? 1 : 0.4,
                                    transition: 'opacity 0.2s',
                                    flexShrink: 0,
                                }}
                                aria-label="Send message"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
