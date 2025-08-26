import { useState, useEffect } from 'react';
import { useTheme } from './components/ThemeProvider';
import { Sun, Moon, Sunset } from 'lucide-react';
import Index from "./pages/index";
import ChatBox from "./components/ChatBox";
import './index.css';

function AnimatedThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const themeOrder = ['light', 'twilight', 'dark'] as const;
  const iconMap = { light: Sun, twilight: Sunset, dark: Moon };
  const currentIdx = themeOrder.indexOf(theme);
  const nextIdx = (currentIdx + 1) % 3;
  const CurrentIcon = iconMap[theme as keyof typeof iconMap];
  const NextIcon = iconMap[themeOrder[nextIdx] as keyof typeof iconMap];
  const nextTheme = themeOrder[nextIdx];
  let ariaLabel = '';
  if (theme === 'light') ariaLabel = 'Switch to twilight mode';
  else if (theme === 'twilight') ariaLabel = 'Switch to dark mode';
  else ariaLabel = 'Switch to light mode';

  // Add smooth transition for theme changes
  useEffect(() => {
    const html = document.documentElement;
    // Enhanced transition properties for smoother theme changes
    html.style.transition = `
      background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1)
    `;
    
    // Add a class during theme changes for additional control
    const handleThemeChange = () => {
      html.classList.add('theme-changing');
      setTimeout(() => html.classList.remove('theme-changing'), 800);
    };
    
    handleThemeChange();
    
    return () => {
      html.style.transition = '';
      html.classList.remove('theme-changing');
    };
  }, [theme]);
  
  // Handle button press effect
  const [isPressed, setIsPressed] = useState(false);
  const handleMouseDown = () => {
    setIsPressed(true);
    // Smoothly transition to pressed state
    const container = document.querySelector('.theme-toggle-container') as HTMLElement;
    if (container) {
      container.style.transform = 'scale(0.9)';
    }
  };
  
  const handleMouseUp = () => {
    setIsPressed(false);
    // Smoothly transition back to normal state
    const container = document.querySelector('.theme-toggle-container') as HTMLElement;
    if (container) {
      container.style.transform = 'scale(1)';
    }
  };

  return (
    <div
      className="theme-toggle-container"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
        transform: isPressed ? 'scale(0.9)' : 'scale(1)',
        opacity: hovered ? 1 : 0.9,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...{
        onMouseLeaveCapture: handleMouseUp
      } as React.HTMLAttributes<HTMLDivElement>}
    >
      <button
        aria-label={ariaLabel}
        onClick={() => setTheme(nextTheme)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          width: 24,
          height: 24,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          margin: 0,
          color: 'var(--foreground)',
          lineHeight: 0,
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered ? 'translateY(100%)' : 'translateY(0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CurrentIcon style={{
              width: 24,
              height: 24,
              stroke: 'currentColor',
              strokeWidth: 1.75,
              fill: 'none',
              flexShrink: 0,
            }} />
          </div>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered ? 'translateY(0)' : 'translateY(-100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <NextIcon style={{
              width: 24,
              height: 24,
              stroke: 'currentColor',
              strokeWidth: 1.75,
              fill: 'none',
              flexShrink: 0,
            }} />
          </div>
        </div>
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <AnimatedThemeToggle />
      
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
