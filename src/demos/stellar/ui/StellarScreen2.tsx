'use client'

import { useRef, useEffect } from 'react'
import { StellarPhone, useBotFinger } from './StellarPhone'

const CSS = `
.s2-app{position:absolute;inset:0;display:flex;flex-direction:column;background:#fff;font-family:'DM Sans',sans-serif}

/* header */
.s2-head{display:flex;align-items:center;gap:10px;padding:16px 16px 12px;border-bottom:1px solid rgba(22,33,15,.06);flex-shrink:0}
.s2-back{color:#4a5a42;display:grid;place-content:center;cursor:pointer;background:none;border:0;padding:0}
.s2-chef-avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#5fd14a,#14A800);display:grid;place-content:center;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(20,168,0,.35)}
.s2-who{flex:1;min-width:0}
.s2-who .nm{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:15px;color:#16210f;line-height:1.1}
.s2-who .st{font-size:10.5px;color:#14A800;display:flex;align-items:center;gap:4px}
.s2-who .st::before{content:"";width:6px;height:6px;border-radius:50%;background:#14A800;display:block}
.s2-head-acts{display:flex;gap:14px;color:#4a5a42}

/* messages */
.s2-msgs{flex:1;overflow-y:auto;padding:16px 14px 6px;display:flex;flex-direction:column;gap:11px;scrollbar-width:none}
.s2-msgs::-webkit-scrollbar{display:none}
.s2-msg{max-width:82%;padding:10px 13px;border-radius:17px;font-size:12.5px;line-height:1.5;opacity:0;transform:translateY(8px);animation:s2in .32s cubic-bezier(.16,1,.3,1) forwards;word-wrap:break-word}
@keyframes s2in{to{opacity:1;transform:none}}
.s2-msg.ai{align-self:flex-start;background:#f7faf5;color:#16210f;border:1px solid rgba(22,33,15,.06);border-bottom-left-radius:5px}
.s2-msg.user{align-self:flex-end;background:#14A800;color:#fff;border-bottom-right-radius:5px}

/* photo bubble */
.s2-photo{align-self:flex-end;width:160px;border-radius:17px;border-bottom-right-radius:5px;overflow:hidden;opacity:0;transform:translateY(8px) scale(.96);animation:s2in .4s cubic-bezier(.16,1,.3,1) forwards;box-shadow:0 8px 20px rgba(22,33,15,.16);position:relative}
.s2-photo-img{height:118px;display:grid;place-content:center;color:rgba(255,255,255,.92);background:radial-gradient(120% 100% at 40% 25%,#e0a94a,#9c5a1e 70%,#6e3d12)}
.s2-photo-cap{position:absolute;left:8px;bottom:8px;font-size:9px;font-family:'Space Mono',monospace;color:rgba(255,255,255,.85);background:rgba(0,0,0,.35);padding:2px 6px;border-radius:6px}

/* typing indicator */
.s2-typing{align-self:flex-start;background:#f7faf5;border:1px solid rgba(22,33,15,.06);border-radius:17px;border-bottom-left-radius:5px;padding:12px 15px;display:flex;gap:4px}
.s2-typing i{width:6px;height:6px;border-radius:50%;background:#8a9882;animation:s2dot 1.1s infinite;list-style:none}
.s2-typing i:nth-child(2){animation-delay:.18s}
.s2-typing i:nth-child(3){animation-delay:.36s}
@keyframes s2dot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}

/* analysis block */
.s2-analysis{align-self:flex-start;width:86%;background:#fff;border:1px solid rgba(22,33,15,.10);border-radius:16px;border-bottom-left-radius:5px;padding:12px 13px;box-shadow:0 6px 16px rgba(22,33,15,.07);opacity:0;transform:translateY(8px);animation:s2in .35s cubic-bezier(.16,1,.3,1) forwards}
.s2-analysis .tag{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;font-family:'Space Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#2b6e34;background:#d6f3cf;padding:3px 8px;border-radius:999px;margin-bottom:8px}
.s2-analysis .id{font-weight:600;font-size:12.5px;color:#16210f;margin-bottom:8px}
.s2-analysis .id b{color:#2b6e34}
.s2-uses{list-style:none;padding:0;margin:0;display:grid;gap:6px}
.s2-uses li{font-size:11.5px;color:#4a5a42;padding-left:16px;position:relative}
.s2-uses li::before{content:"";position:absolute;left:0;top:.5em;width:5px;height:5px;border-radius:50%;background:#5fd14a;display:block}

/* suggestion card */
.s2-sugg{align-self:flex-start;width:86%;background:#fff;border:1px solid rgba(22,33,15,.10);border-radius:16px;overflow:hidden;box-shadow:0 8px 20px rgba(22,33,15,.1);opacity:0;transform:translateY(8px);animation:s2in .35s cubic-bezier(.16,1,.3,1) forwards}
.s2-sugg-pic{height:84px;background:radial-gradient(120% 120% at 40% 30%,#8fc24a,#3f8e2a);position:relative}
.s2-sugg-badge{position:absolute;top:8px;left:8px;font-size:9px;font-family:'Space Mono',monospace;color:#fff;background:rgba(0,0,0,.32);padding:2px 7px;border-radius:6px}
.s2-sugg-body{padding:11px 13px}
.s2-sugg-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:13.5px;color:#16210f}
.s2-sugg-meta{display:flex;gap:12px;font-size:10.5px;color:#8a9882;margin:4px 0 10px;font-family:'DM Sans',sans-serif}
.s2-sugg-go{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:#14A800;color:#fff;border:0;border-radius:10px;padding:10px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:transform .15s}
.s2-sugg-go:active{transform:scale(.97)}

/* input bar */
.s2-input{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 14px 16px;border-top:1px solid rgba(22,33,15,.06);background:#fff}
.s2-input-icon{color:#4a5a42;display:grid;place-content:center;cursor:pointer;background:transparent;border:0;padding:0;border-radius:50%;width:32px;height:32px;transition:background .15s,color .15s;flex-shrink:0}
.s2-input-icon.cam{color:#14A800}
.s2-input-field{flex:1;display:flex;align-items:center;background:#f4f8f1;border:1px solid rgba(22,33,15,.10);border-radius:999px;padding:9px 14px;font-size:12.5px;color:#8a9882;font-family:'DM Sans',sans-serif}
.s2-send-btn{width:34px;height:34px;border-radius:50%;background:#14A800;color:#fff;display:grid;place-content:center;flex-shrink:0;border:0;cursor:pointer;box-shadow:0 4px 12px rgba(20,168,0,.35);transition:transform .15s}
.s2-send-btn:active{transform:scale(.9)}

/* bot */
.sbot-finger{opacity:0;transition:opacity 300ms}
.sbot-finger.sbot-show{opacity:1}
.sbot-ripple{opacity:0}
.sbot-go{animation:sbot-rip .55s cubic-bezier(.16,1,.3,1)}
@keyframes sbot-rip{0%{opacity:.6;transform:translate(var(--rx),var(--ry)) scale(.4)}100%{opacity:0;transform:translate(var(--rx),var(--ry)) scale(2.4)}}
@media(prefers-reduced-motion:reduce){.sbot-finger,.sbot-ripple{display:none}}
`

export function StellarScreen2() {
  const screenRef = useRef<HTMLDivElement>(null)
  const msgsRef   = useRef<HTMLDivElement>(null)
  const camRef    = useRef<HTMLButtonElement>(null)
  const sendRef   = useRef<HTMLButtonElement>(null)

  const { fingerEl, rippleEl, bot } = useBotFinger(screenRef)

  useEffect(() => {
    const screen = screenRef.current
    if (!screen) return
    const sc = screen
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    function scrollDown() {
      if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }

    function addAi(html: string) {
      if (!msgsRef.current) return
      const d = document.createElement('div')
      d.className = 's2-msg ai'
      d.innerHTML = html
      msgsRef.current.appendChild(d)
      scrollDown()
    }

    function addUser(text: string) {
      if (!msgsRef.current) return
      const d = document.createElement('div')
      d.className = 's2-msg user'
      d.textContent = text
      msgsRef.current.appendChild(d)
      scrollDown()
    }

    function addPhoto() {
      if (!msgsRef.current) return
      const d = document.createElement('div')
      d.className = 's2-photo'
      d.innerHTML = `
        <div class="s2-photo-img">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v3.5L7.6 8.2A2 2 0 0 0 7 9.6V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9.6a2 2 0 0 0-.6-1.4L14 5.5V2"/>
            <path d="M9 2h6M8.5 13h7"/>
          </svg>
        </div>
        <span class="s2-photo-cap">IMG_0421.jpg</span>`
      msgsRef.current.appendChild(d)
      scrollDown()
    }

    function addTyping() {
      if (!msgsRef.current) return null
      const d = document.createElement('div')
      d.className = 's2-typing'
      d.innerHTML = '<i></i><i></i><i></i>'
      msgsRef.current.appendChild(d)
      scrollDown()
      return d
    }

    function addAnalysis() {
      if (!msgsRef.current) return
      const d = document.createElement('div')
      d.className = 's2-analysis'
      d.innerHTML = `
        <span class="tag">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          identified
        </span>
        <div class="id">That is a bottle of <b>Marukan Ponzu</b> — citrus soy. Great for:</div>
        <ul class="s2-uses">
          <li>Marinade for chicken or salmon</li>
          <li>Dipping sauce for dumplings</li>
          <li>Stir-fry finisher</li>
          <li>Bright salad dressing</li>
        </ul>`
      msgsRef.current.appendChild(d)
      scrollDown()
    }

    function addSuggestion(): HTMLButtonElement | null {
      if (!msgsRef.current) return null
      const d = document.createElement('div')
      d.className = 's2-sugg'
      d.innerHTML = `
        <div class="s2-sugg-pic"><span class="s2-sugg-badge">from your photo</span></div>
        <div class="s2-sugg-body">
          <div class="s2-sugg-name">Ponzu Glazed Salmon Bowl</div>
          <div class="s2-sugg-meta"><span>8 Ingredients</span><span>25 mins</span></div>
          <button class="s2-sugg-go">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            See recipe
          </button>
        </div>`
      msgsRef.current.appendChild(d)
      scrollDown()
      return d.querySelector<HTMLButtonElement>('.s2-sugg-go')
    }

    async function loop() {
      while (!cancelled) {
        if (msgsRef.current) msgsRef.current.innerHTML = ''

        addAi('Hey! Snap whatever you have and I will find you something to cook.')
        await wait(reduced ? 1600 : 1200)

        if (reduced) {
          addPhoto()
          await wait(900)
          addUser('What can I make with this?')
          await wait(900)
          const tp = addTyping(); await wait(1200); tp?.remove()
          addAnalysis()
          await wait(900)
          addSuggestion()
          await wait(4500)
          continue
        }

        bot.current.show()
        await wait(500)

        /* 1. tap camera → photo sent */
        const cam = camRef.current
        if (cam) await bot.current.tap(cam, () => addPhoto())
        await wait(700)

        /* 2. user message */
        addUser('What can I make with this?')
        await wait(800)

        /* 3. tap send */
        const send = sendRef.current
        if (send) await bot.current.tap(send, () => {})

        /* 4. AI analysis */
        const tp = addTyping(); await wait(1300); tp?.remove()
        addAnalysis()
        await wait(1000)

        /* 5. suggestion card */
        const goBtn = addSuggestion()
        await wait(900)

        /* 6. tap See recipe */
        if (goBtn) await bot.current.tap(goBtn, () => {})
        await wait(1400)

        bot.current.hide()
        await wait(900)
      }
    }

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { io.disconnect(); setTimeout(loop, 700) }
    }, { threshold: 0.4 })
    io.observe(sc)
    return () => { cancelled = true; io.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <StellarPhone>
        <div ref={screenRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div className="s2-app">

            {/* header */}
            <div className="s2-head">
              <button className="s2-back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span className="s2-chef-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>
              </span>
              <div className="s2-who">
                <div className="nm">Chef</div>
                <div className="st">online</div>
              </div>
              <div className="s2-head-acts">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </div>
            </div>

            {/* messages */}
            <div ref={msgsRef} className="s2-msgs" />

            {/* input bar */}
            <div className="s2-input">
              <button ref={camRef} className="s2-input-icon cam" aria-label="Camera">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>
              </button>
              <button className="s2-input-icon" aria-label="Gallery">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>
              </button>
              <div className="s2-input-field">Aa</div>
              <button ref={sendRef} className="s2-send-btn" aria-label="Send">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
              </button>
            </div>
          </div>

          {/* bot overlay */}
          {rippleEl}
          {fingerEl}
        </div>
      </StellarPhone>
    </>
  )
}
