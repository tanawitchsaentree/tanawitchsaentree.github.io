import { useTheme } from 'next-themes';
import { Moon, Sun, Sunset } from 'lucide-react';
import Index from "./pages/index";
import ChatBox from "./components/ChatBox";
import { DynamicUIRenderer } from './components/DynamicUIRenderer';
import WorkGrid from './components/WorkGrid';
import './index.css';
import './App.css';

function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === 'light' ? 'dark' : resolvedTheme === 'dark' ? 'twilight' : 'light';

  return (
    <button
      onClick={() => setTheme(nextTheme)}
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
  );
}

export default function App() {
  return (
    <div className="app">
      <DynamicUIRenderer />
      <main className="main-content">
        {/* 1. Profile Section - Left */}
        <section className="profile-section">
          <div className="profile-container">
            <Index DarkModeToggle={DarkModeToggle} />
          </div>
        </section>

        {/* 2. Chat Section - Right */}
        <section className="chat-section" style={{ position: 'relative' }}>
          <div className="chat-container" style={{ width: '100%', height: '100%' }}>
            {/* Base Content: Work Grid */}
            <WorkGrid />

            {/* Overlay: Floating Chat */}
            <ChatBox />
          </div>
        </section>
      </main>
    </div>
  );
}
