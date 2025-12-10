import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Sunset, Ruler } from 'lucide-react';
import Index from "./pages/index";
import ChatBox from "./components/ChatBox";
import XRayOverlay from "./components/XRayOverlay";
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

function XRayToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`xray-toggle ${active ? 'active' : ''}`}
      aria-label="Toggle X-ray mode"
    >
      <Ruler className="w-5 h-5" />
    </button>
  );
}

export default function App() {
  const [xrayMode, setXrayMode] = useState(false);

  return (
    <div className="app">
      <DarkModeToggle />
      <XRayToggle active={xrayMode} onToggle={() => setXrayMode(!xrayMode)} />

      {xrayMode && <XRayOverlay />}

      <main className="main-content">
        {/* Profile Content */}
        <section className="profile-section">
          <div className="profile-container">
            <Index />
          </div>
        </section>

        {/* Chat Interface */}
        <section className="chat-section">
          <div className="chat-container">
            <ChatBox />
          </div>
        </section>
      </main>
    </div>
  );
}
