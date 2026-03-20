import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Sunset, User, LayoutGrid, MessageSquare } from 'lucide-react';
import { SmartTooltip } from './components/ui/SmartTooltip';
import Index from "./pages/index";
import ChatBox from "./components/ChatBox";
import { DynamicUIRenderer } from './components/DynamicUIRenderer';
import WorkGrid from './components/WorkGrid';
import ProjectModal, { KNOWN_PROJECT_IDS } from './components/ProjectModal';
import './index.css';
import './App.css';

function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === 'light' ? 'dark' : resolvedTheme === 'dark' ? 'twilight' : 'light';

  const handleToggle = () => {
    // View Transitions API: browser snapshots old state, applies change, animates between them
    // No overlay, no timing hacks, no flash — pure native browser animation
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => setTheme(nextTheme));
    } else {
      setTheme(nextTheme); // fallback for unsupported browsers
    }
  };

  const label = nextTheme === 'dark' ? 'Dark mode' : nextTheme === 'twilight' ? 'Twilight mode' : 'Light mode';
  return (
    <SmartTooltip content={label} delay={300}>
      <button
        onClick={handleToggle}
        className="dark-mode-toggle"
        aria-label={`Switch to ${nextTheme} mode`}
      >
        {nextTheme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : nextTheme === 'twilight' ? (
          <Sunset className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    </SmartTooltip>
  );
}

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'profile' | 'work' | 'chat'>('profile');
  const isFirstRender = useRef(true);

  // Open modal if URL matches a known project on load
  useEffect(() => {
    const id = window.location.pathname.slice(1).split('/')[0];
    if (id && KNOWN_PROJECT_IDS.includes(id)) setActiveProjectId(id);
  }, []);

  // Sync URL when activeProjectId changes
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const path = activeProjectId ? `/${activeProjectId}` : '/';
    window.history.pushState({ projectId: activeProjectId }, '', path);
  }, [activeProjectId]);

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => {
      const id = window.location.pathname.slice(1).split('/')[0];
      setActiveProjectId(id && KNOWN_PROJECT_IDS.includes(id) ? id : null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="app">
      <DynamicUIRenderer />
      <main className={`main-content mobile-tab-${mobileTab}`}>
        {/* 1. Profile Section - Left */}
        <section className="profile-section">
          <div className="profile-container">
            <Index DarkModeToggle={DarkModeToggle} />
          </div>
        </section>

        {/* 2. Chat Section - Right */}
        <section className="chat-section" style={{ position: 'relative' }}>
          <div className="chat-container" style={{ width: '100%', height: '100%' }}>
            <WorkGrid onOpenProject={setActiveProjectId} />
            <ChatBox mode={mobileTab === 'chat' ? 'fullscreen' : 'overlay'} />
          </div>
        </section>
      </main>

      {/* Mobile bottom nav — hidden on tablet+ via CSS */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${mobileTab === 'profile' ? 'active' : ''}`}
          onClick={() => setMobileTab('profile')}
          aria-label="Profile"
        >
          <User size={20} />
          <span>Profile</span>
        </button>
        <button
          className={`mobile-nav-btn ${mobileTab === 'work' ? 'active' : ''}`}
          onClick={() => setMobileTab('work')}
          aria-label="Work"
        >
          <LayoutGrid size={20} />
          <span>Work</span>
        </button>
        <button
          className={`mobile-nav-btn ${mobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setMobileTab('chat')}
          aria-label="Chat"
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </button>
      </nav>

      {/* Project Detail Modal */}
      <ProjectModal
        projectId={activeProjectId}
        onClose={() => setActiveProjectId(null)}
        onOpenProject={setActiveProjectId}
      />
    </div>
  );
}
