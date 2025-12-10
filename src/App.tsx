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
      className="xray-toggle"
      aria-label="Toggle X-ray mode"
      style={{
        opacity: active ? 1 : 0.8,
        position: 'fixed',
        top: '2rem',
        right: '6rem',
        zIndex: 99999,
        backgroundColor: active ? 'rgba(255, 0, 255, 0.2)' : 'var(--background)',
        border: '2px solid red', /* TEMPORARY DEBUG BORDER */
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        cursor: 'pointer'
      }}
    >
      <Ruler className="w-5 h-5" />
      {/* Fallback if icon fails */}
      {!active && <span style={{ fontSize: '10px', position: 'absolute', bottom: '-15px', background: 'white', color: 'black' }}>X-RAY</span>}
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

      <main className="main-content flex flex-col lg:flex-row gap-8">
        {/* Profile Content comes first on small screens */}
        <section className="profile-section order-1 lg:order-none w-full lg:w-1/2">
          <div className="profile-container">
            <Index />
          </div>
        </section>

        {/* Chat Interface appears below on small, side by side on large */}
        <section className="chat-section order-2 lg:order-none w-full lg:w-1/2">
          <div className="chat-container">
            <ChatBox />
          </div>
        </section>
      </main>
    </div>
  );
}
