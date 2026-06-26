'use client'

import { useRef, useEffect } from 'react'
import { StellarPhone, useBotFinger } from './StellarPhone'

/* ── data ─────────────────────────────────────────────────── */
const DATA: Record<string, [string, number, number][]> = {
  'For you':  [['Classic Cheeseburger',10,12],['Avocado Toast & Poached Eggs',5,10],['Grilled Chicken Fajitas',20,38],['Baked Salmon & Asparagus',12,38]],
  'Dinner':   [['One-Pot Tomato Pasta',9,25],['Baked Salmon & Asparagus',12,38],['Steak Tacos',11,30],['Veggie Stir-Fry',8,18]],
  'Snacks':   [['Hummus & Veggie Plate',6,8],['Trail Mix Bowl',5,5],['Cheese & Crackers',4,5]],
  'Dessert':  [['Choc Mug Cake',6,5],['Berry Yogurt Parfait',5,8],['Banana Bread Slice',8,15]],
  'Chicken':  [['Lemon Garlic Chicken',9,30],['Grilled Chicken Fajitas',20,38],['Chicken Noodle Soup',10,25]],
  'Breakfast':[['Avocado Toast & Poached Eggs',5,10],['Veggie Omelette',7,12],['Overnight Oats',6,5]],
}
const TABS = ['For you','Dinner','Snacks','Dessert','Chicken','Breakfast']

const CSS = `
.s1-scroll{position:absolute;inset:0;overflow-y:auto;border-radius:44px;scrollbar-width:none;background:#fff}
.s1-scroll::-webkit-scrollbar{display:none}

/* hero */
.s1-hero{position:relative;height:330px;overflow:hidden;
  background:linear-gradient(180deg,rgba(20,30,12,.10) 0%,rgba(20,30,12,.02) 30%,rgba(12,20,6,.80) 100%),
    radial-gradient(120% 90% at 50% 30%,#7faa3f,#3f6e1e 55%,#244310);
  display:flex;flex-direction:column;justify-content:flex-end;padding:14px 18px 18px}
.s1-veil{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(180deg,rgba(10,16,6,.32) 0%,rgba(10,16,6,0) 32%,rgba(10,16,6,.78) 100%)}
.s1-hero>*{position:relative;z-index:2}
.s1-statusbar{position:absolute;top:0;left:0;right:0;z-index:4;display:flex;justify-content:space-between;align-items:center;padding:13px 22px 0;font-size:11.5px;font-weight:700;color:#fff;font-family:'DM Sans',sans-serif}
.s1-statusbar .sig{display:flex;gap:4px;align-items:center}
.s1-greet{position:absolute;top:42px;left:18px;right:18px;display:flex;align-items:center;gap:10px;z-index:3}
.s1-chef-ico{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#5fd14a,#14A800);display:grid;place-content:center;box-shadow:0 4px 12px rgba(20,168,0,.4);color:#fff;flex-shrink:0}
.s1-greet-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.5)}
.s1-greet-icons{margin-left:auto;display:flex;gap:14px;color:#fff;opacity:.96}
.s1-hero h3{color:#fff;font-size:21px;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;text-shadow:0 1px 10px rgba(0,0,0,.5);margin:0}
.s1-hero-meta{display:flex;gap:16px;margin-top:6px;font-size:11.5px;color:rgba(255,255,255,.92);align-items:center}
.s1-hero-meta span{display:inline-flex;align-items:center;gap:5px}
.s1-dots{position:absolute;right:18px;bottom:80px;z-index:2;display:flex;gap:4px;align-items:center}
.s1-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.45);list-style:none}
.s1-dots i.on{width:16px;border-radius:3px;background:#fff}

/* body */
.s1-body{padding:0 16px 90px}
.s1-search{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(22,33,15,.10);border-radius:16px;padding:13px 15px;margin:16px 0 14px;box-shadow:0 8px 22px rgba(22,33,15,.1)}
.s1-search svg{color:#14A800;flex:none}
.s1-search-input{border:0;outline:0;flex:1;font-family:'DM Sans',sans-serif;font-size:12.5px;color:#16210f;background:transparent}
.s1-search-input::placeholder{color:#8a9882}

.s1-tabs-row{display:flex;gap:16px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none}
.s1-tabs-row::-webkit-scrollbar{display:none}
.s1-tab-btn{font-size:13px;font-weight:600;color:#4a5a42;white-space:nowrap;cursor:pointer;padding-bottom:4px;border:0;border-bottom:2px solid transparent;background:none;font-family:'DM Sans',sans-serif;transition:color .15s}
.s1-tab-btn.on{color:#14A800;font-weight:700;border-bottom-color:#14A800}

.s1-thumbs-row{display:flex;gap:9px;overflow-x:auto;padding-bottom:16px;scrollbar-width:none}
.s1-thumbs-row::-webkit-scrollbar{display:none}
.s1-thumb{flex:0 0 64px;height:54px;border-radius:14px;display:grid;place-content:center;cursor:pointer;background:#fff;border:1px solid rgba(22,33,15,.10);transition:transform .15s,background .15s,border-color .15s}
.s1-thumb svg{width:24px;height:24px;color:#14A800}
.s1-thumb.on{background:#14A800;border-color:#14A800}
.s1-thumb.on svg{color:#fff}

.s1-section-head{display:flex;align-items:center;justify-content:space-between;margin:6px 0 12px}
.s1-section-head .t{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:17px;color:#16210f}
.s1-chatbtn{display:inline-flex;align-items:center;gap:5px;background:#14A800;color:#fff;font-size:12px;font-weight:700;padding:6px 12px;border-radius:9px;border:0;font-family:'DM Sans',sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(20,168,0,.28);transition:transform .15s}
.s1-chatbtn:active{transform:scale(.94)}

.s1-prompts{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:22px}
.s1-prompt{background:#fff;border:1px solid rgba(22,33,15,.10);border-radius:14px;padding:13px;text-align:left;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;position:relative;min-height:78px;display:flex;align-items:flex-start;box-shadow:0 2px 8px rgba(22,33,15,.04);font-family:'DM Sans',sans-serif}
.s1-prompt span{font-size:12px;color:#16210f;line-height:1.35;max-width:80%;font-weight:500}
.s1-prompt .em{position:absolute;right:11px;top:11px;font-size:13px}

.s1-meal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.s1-meal-head .t{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:17px;color:#16210f}
.s1-view-plan{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:#2b6e34;font-weight:600;cursor:pointer;background:none;border:0;font-family:'DM Sans',sans-serif}
.s1-group-label{font-size:11px;color:#8a9882;margin:4px 0 8px;font-weight:600;font-family:'DM Sans',sans-serif}
.s1-count-badge{display:none;font-family:'Space Mono',monospace;font-weight:400;font-size:.62rem;letter-spacing:.04em;color:#2b6e34;background:#d6f3cf;padding:.16em .5em;border-radius:999px;margin-left:.5em}
.s1-count-badge.show{display:inline-block}

.s1-recipe{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid rgba(22,33,15,.10);border-radius:14px;padding:12px 13px;margin-bottom:9px;transition:transform .15s,box-shadow .15s,border-color .15s;box-shadow:0 2px 8px rgba(22,33,15,.04)}
.s1-recipe.added{border-color:#5fd14a;background:#eef9ea}
.s1-recipe-info{flex:1;min-width:0}
.s1-recipe-name{font-weight:700;font-size:13px;color:#16210f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'DM Sans',sans-serif}
.s1-recipe-meta{display:flex;gap:12px;font-size:11px;color:#8a9882;margin-top:3px;font-family:'DM Sans',sans-serif}
.s1-add-btn{width:30px;height:30px;border-radius:50%;background:#eef9ea;border:1px solid #d6f3cf;color:#14A800;font-size:17px;display:grid;place-content:center;cursor:pointer;flex-shrink:0;transition:transform .15s,background .15s;font-family:inherit}
.s1-add-btn.added{background:#14A800;border-color:#14A800;color:#fff}

.s1-recipes-list{opacity:0;transform:translateY(8px);transition:opacity .35s cubic-bezier(.16,1,.3,1),transform .35s cubic-bezier(.16,1,.3,1)}
.s1-recipes-list.in{opacity:1;transform:none}

.s1-addmore{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:#16210f;margin-top:6px;cursor:pointer;font-family:'DM Sans',sans-serif;background:none;border:0}
.s1-addmore-ic{width:24px;height:24px;border-radius:7px;background:#14A800;color:#fff;display:grid;place-content:center;font-size:15px}

/* bottom bar */
.s1-bottom-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:14px;padding:12px 18px 16px;background:linear-gradient(180deg,transparent,#fff 38%);z-index:10}
.s1-filter-btn{width:42px;height:42px;display:grid;place-content:center;color:#4a5a42;cursor:pointer;background:transparent;border:0;border-radius:50%;padding:0;transition:background .15s;flex-shrink:0}
.s1-new-recipes-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(180deg,#5fd14a,#14A800);color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:15px;padding:15px;border-radius:999px;border:0;cursor:pointer;box-shadow:0 8px 22px rgba(20,168,0,.4);transition:transform .15s}

/* chat sheet */
.s1-chatsheet{position:absolute;left:0;right:0;bottom:0;height:74%;z-index:40;background:#fff;border-radius:26px 26px 0 0;box-shadow:0 -16px 40px rgba(22,33,15,.18);transform:translateY(102%);transition:transform .5s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;overflow:hidden}
.s1-chatsheet.open{transform:translateY(0)}
.s1-sheet-grab{width:38px;height:4px;border-radius:99px;background:rgba(22,33,15,.10);margin:10px auto 4px;flex-shrink:0}
.s1-sheet-head{display:flex;align-items:center;gap:9px;padding:6px 18px 12px;border-bottom:1px solid rgba(22,33,15,.06);flex-shrink:0}
.s1-sheet-chef{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#5fd14a,#14A800);display:grid;place-content:center;color:#fff;flex-shrink:0}
.s1-sheet-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:14px;color:#16210f}
.s1-sheet-body{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:none}
.s1-sheet-body::-webkit-scrollbar{display:none}
.s1-msg{max-width:80%;padding:9px 13px;border-radius:16px;font-size:12.5px;line-height:1.45;opacity:0;transform:translateY(8px);animation:s1msgin .3s cubic-bezier(.16,1,.3,1) forwards;font-family:'DM Sans',sans-serif}
@keyframes s1msgin{to{opacity:1;transform:none}}
.s1-msg.user{align-self:flex-end;background:#14A800;color:#fff;border-bottom-right-radius:5px}
.s1-msg.ai{align-self:flex-start;background:#f7faf5;color:#16210f;border:1px solid rgba(22,33,15,.06);border-bottom-left-radius:5px}
.s1-typing{align-self:flex-start;background:#f7faf5;border:1px solid rgba(22,33,15,.06);border-radius:16px;border-bottom-left-radius:5px;padding:11px 14px;display:flex;gap:4px}
.s1-typing i{width:6px;height:6px;border-radius:50%;background:#8a9882;animation:s1dot 1.1s infinite;list-style:none}
.s1-typing i:nth-child(2){animation-delay:.18s}
.s1-typing i:nth-child(3){animation-delay:.36s}
@keyframes s1dot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
.s1-sugg{align-self:flex-start;width:88%;background:#fff;border:1px solid rgba(22,33,15,.10);border-radius:14px;overflow:hidden;box-shadow:0 6px 16px rgba(22,33,15,.08);opacity:0;transform:translateY(8px);animation:s1msgin .35s cubic-bezier(.16,1,.3,1) forwards}
.s1-sugg-pic{height:74px;background:radial-gradient(120% 120% at 40% 30%,#8fc24a,#3f8e2a)}
.s1-sugg-body{padding:10px 12px}
.s1-sugg-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:13px;color:#16210f}
.s1-sugg-meta{display:flex;gap:12px;font-size:10.5px;color:#8a9882;margin:3px 0 9px;font-family:'DM Sans',sans-serif}
.s1-sugg-go{display:block;width:100%;text-align:center;background:#14A800;color:#fff;border:0;border-radius:9px;padding:9px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer}

/* toast */
.s1-toast{position:absolute;left:50%;bottom:84px;transform:translate(-50%,16px);z-index:60;display:flex;align-items:center;gap:7px;background:#16210f;color:#fff;padding:10px 15px;border-radius:999px;font-size:12px;font-weight:600;box-shadow:0 10px 26px rgba(22,33,15,.3);opacity:0;pointer-events:none;transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.34,1.56,.64,1);font-family:'DM Sans',sans-serif}
.s1-toast svg{color:#5fd14a}
.s1-toast.show{opacity:1;transform:translate(-50%,0)}

/* bot styles */
.sbot-finger{opacity:0;transition:opacity 300ms}
.sbot-finger.sbot-show{opacity:1}
.sbot-ripple{opacity:0}
.sbot-go{animation:sbot-rip .55s cubic-bezier(.16,1,.3,1)}
@keyframes sbot-rip{0%{opacity:.6;transform:translate(var(--rx),var(--ry)) scale(.4)}100%{opacity:0;transform:translate(var(--rx),var(--ry)) scale(2.4)}}
@media(prefers-reduced-motion:reduce){.sbot-finger,.sbot-ripple{display:none}}
`

const ICON_PLUS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`
const ICON_CHECK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`

export function StellarScreen1() {
  const screenRef  = useRef<HTMLDivElement>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)
  const chatRef    = useRef<HTMLDivElement>(null)
  const msgsRef    = useRef<HTMLDivElement>(null)
  const recipesRef = useRef<HTMLDivElement>(null)
  const countRef   = useRef<HTMLSpanElement>(null)
  const toastRef   = useRef<HTMLDivElement>(null)
  const toastTxtRef= useRef<HTMLSpanElement>(null)

  const { fingerEl, rippleEl, bot } = useBotFinger(screenRef)

  /* ── render recipes helper ───────────────────────────────── */
  function renderRecipes(tab: string) {
    const list = DATA[tab] ?? DATA['For you']
    if (!recipesRef.current) return
    recipesRef.current.innerHTML = list.map(([nm, ing, min]) =>
      `<div class="s1-recipe">
        <div class="s1-recipe-info">
          <div class="s1-recipe-name">${nm}</div>
          <div class="s1-recipe-meta"><span>${ing} Ingredients</span><span>${min} mins</span></div>
        </div>
        <button class="s1-add-btn" aria-label="add">${ICON_PLUS}</button>
      </div>`
    ).join('')
    recipesRef.current.querySelectorAll<HTMLButtonElement>('.s1-add-btn').forEach(btn => {
      btn.addEventListener('click', () => addRecipe(btn))
    })
    recipesRef.current.classList.remove('in')
    void recipesRef.current.offsetWidth
    requestAnimationFrame(() => requestAnimationFrame(() => recipesRef.current?.classList.add('in')))
  }

  function addRecipe(btn: HTMLButtonElement) {
    if (btn.classList.contains('added')) return
    btn.classList.add('added')
    btn.innerHTML = ICON_CHECK
    btn.closest('.s1-recipe')?.classList.add('added')
    const added = document.querySelectorAll('.s1-add-btn.added').length
    if (countRef.current) {
      countRef.current.textContent = `${added} added`
      countRef.current.classList.add('show')
    }
    showToast('Added to today')
  }

  let toastTimer: ReturnType<typeof setTimeout>
  function showToast(text: string) {
    if (!toastRef.current || !toastTxtRef.current) return
    toastTxtRef.current.textContent = text
    toastRef.current.classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastRef.current?.classList.remove('show'), 1500)
  }

  /* ── bot loop ────────────────────────────────────────────── */
  useEffect(() => {
    const screen = screenRef.current
    if (!screen) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const sc = screen

    async function runChat(promptText: string): Promise<HTMLButtonElement | null> {
      const msgs = msgsRef.current
      const chat = chatRef.current
      if (!msgs || !chat) return null
      msgs.innerHTML = ''
      chat.classList.add('open')
      await wait(450)
      const u = document.createElement('div')
      u.className = 's1-msg user'
      u.textContent = promptText
      msgs.appendChild(u)
      msgs.scrollTop = msgs.scrollHeight
      await wait(700)
      const tp = document.createElement('div')
      tp.className = 's1-typing'
      tp.innerHTML = '<i></i><i></i><i></i>'
      msgs.appendChild(tp)
      msgs.scrollTop = msgs.scrollHeight
      await wait(1100)
      tp.remove()
      const ai = document.createElement('div')
      ai.className = 's1-msg ai'
      ai.textContent = 'Sunny day — perfect for something quick. Try this:'
      msgs.appendChild(ai)
      msgs.scrollTop = msgs.scrollHeight
      await wait(500)
      const sugg = document.createElement('div')
      sugg.className = 's1-sugg'
      sugg.innerHTML = `
        <div class="s1-sugg-pic"></div>
        <div class="s1-sugg-body">
          <div class="s1-sugg-name">Grilled Chicken & Veggie Skewers</div>
          <div class="s1-sugg-meta"><span>10 Ingredients</span><span>20 mins</span></div>
          <button class="s1-sugg-go">I'll go with this!</button>
        </div>`
      msgs.appendChild(sugg)
      msgs.scrollTop = msgs.scrollHeight
      return sugg.querySelector<HTMLButtonElement>('.s1-sugg-go')
    }

    async function loop() {
      while (!cancelled) {
        /* reset */
        if (countRef.current) { countRef.current.classList.remove('show'); countRef.current.textContent = '' }
        chatRef.current?.classList.remove('open')
        const scroll = scrollRef.current
        if (!scroll) { await wait(500); continue }

        /* set first tab */
        const tabBtns = sc.querySelectorAll<HTMLButtonElement>('.s1-tab-btn')
        tabBtns.forEach((t, i) => t.classList.toggle('on', i === 0))
        renderRecipes('For you')
        await bot.current.smoothScroll(scroll, 0)
        await wait(reduced ? 3000 : 800)
        if (reduced) { await wait(4000); continue }

        bot.current.show()
        await wait(500)

        /* 1. browse tabs */
        if (tabBtns[1]) await bot.current.tap(tabBtns[1], () => { tabBtns.forEach((t,i) => t.classList.toggle('on', i===1)); renderRecipes('Dinner') })
        await wait(250)
        if (tabBtns[4]) await bot.current.tap(tabBtns[4], () => { tabBtns.forEach((t,i) => t.classList.toggle('on', i===4)); renderRecipes('Chicken') })
        await wait(250)
        if (tabBtns[0]) await bot.current.tap(tabBtns[0], () => { tabBtns.forEach((t,i) => t.classList.toggle('on', i===0)); renderRecipes('For you') })
        await wait(300)

        /* 2. tap a prompt → chat opens */
        const prompts = sc.querySelectorAll<HTMLButtonElement>('.s1-prompt')
        let goBtn: HTMLButtonElement | null = null
        if (prompts[0]) {
          await bot.current.tap(prompts[0], async () => { goBtn = await runChat('Want to impress your friends?') })
        }
        await wait(900)
        if (goBtn) await bot.current.tap(goBtn, () => {})
        await wait(500)
        chatRef.current?.classList.remove('open')
        await wait(500)

        /* 3. scroll to recipes */
        await bot.current.smoothScroll(scroll, scroll.scrollHeight)
        await wait(500)

        /* 4. add 2 recipes */
        const addBtns = sc.querySelectorAll<HTMLButtonElement>('.s1-add-btn')
        if (addBtns[0]) await bot.current.tap(addBtns[0])
        await wait(350)
        const addBtns2 = sc.querySelectorAll<HTMLButtonElement>('.s1-add-btn')
        if (addBtns2[2]) await bot.current.tap(addBtns2[2])
        await wait(700)

        /* 5. back to top */
        await bot.current.smoothScroll(scroll, 0)
        bot.current.hide()
        await wait(1100)
      }
    }

    renderRecipes('For you')
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { io.disconnect(); setTimeout(loop, 700) }
    }, { threshold: 0.4 })
    io.observe(screen)
    return () => { cancelled = true; io.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <StellarPhone>
        <div ref={screenRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={scrollRef} className="s1-scroll">

            {/* hero */}
            <div className="s1-hero">
              <div className="s1-veil" />
              {/* status bar */}
              <div className="s1-statusbar">
                <span>9:41</span>
                <span className="sig">
                  <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 9.5 1 4.2a10 10 0 0 1 14 0L8 9.5Z" stroke="#fff" strokeWidth="1.3" fill="rgba(255,255,255,.25)"/></svg>
                  <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="1" y="1.2" width="18" height="8.6" rx="2.5" stroke="#fff" strokeOpacity=".6" strokeWidth="1"/><rect x="2.6" y="2.8" width="13" height="5.4" rx="1.2" fill="#fff"/><rect x="20" y="3.8" width="1.5" height="3.4" rx=".7" fill="#fff" fillOpacity=".6"/></svg>
                </span>
              </div>
              {/* greeting */}
              <div className="s1-greet">
                <div className="s1-chef-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>
                </div>
                <div className="s1-greet-name">&ldquo;Good morning!&rdquo;</div>
                <div className="s1-greet-icons">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>
                </div>
              </div>
              <h3>Japanese curry rice</h3>
              <div className="s1-hero-meta">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v9m0 0v11M19 2a4 4 0 0 0-4 4v6h4m0-10v20"/></svg>
                  20 Ingredients
                </span>
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  38 mins
                </span>
              </div>
              <div className="s1-dots"><i className="on" /><i /><i /></div>
            </div>

            {/* body */}
            <div className="s1-body">
              {/* search */}
              <div className="s1-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                <input className="s1-search-input" placeholder="Explore recipes, techniques and more..." readOnly />
              </div>

              {/* tabs */}
              <div className="s1-tabs-row">
                {TABS.map((t, i) => (
                  <button key={t} className={`s1-tab-btn${i === 0 ? ' on' : ''}`}>{t}</button>
                ))}
              </div>

              {/* thumbs */}
              <div className="s1-thumbs-row">
                {[
                  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 11h.01M11 15h.01M16 16h.01M2 16l20 6-6-20A20 20 0 0 0 2 16"/><path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"/></svg>,
                  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h18M12 11v8M7 11a5 5 0 0 1 10 0M8.5 6.5l.5-1M12 5.5V4.5M15.5 6.5l-.5-1"/></svg>,
                  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9ZM11.38 3.46a2 2 0 0 1 1.24 0c.4.13.85.5 1.13 1.04M7.5 5.5c.3-.8 1-1.5 1.8-1.7"/></svg>,
                  <svg key="d" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a7 7 0 0 0-7 7c0 2 1 3.5 2.5 5l1 1.5h7l1-1.5C19 13.5 20 12 20 10a7 7 0 0 0-8-7Z"/><path d="M9 18.5h6M10 21h4"/></svg>,
                  <svg key="e" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7a5 5 0 0 0 0 10M9 9.5h.01M9 14.5h.01"/></svg>,
                ].map((icon, i) => (
                  <div key={i} className={`s1-thumb${i === 0 ? ' on' : ''}`}>{icon}</div>
                ))}
              </div>

              {/* how can I help */}
              <div className="s1-section-head">
                <span className="t">How can I help you today?</span>
                <button className="s1-chatbtn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                  Chat
                </button>
              </div>
              <div className="s1-prompts">
                {['Want to impress your friends?','Need a meal idea that\'s healthy & tasty?','Want to try something new?','Need a dinner idea?'].map(p => (
                  <button key={p} className="s1-prompt">
                    <span>{p}</span>
                    <span className="em">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14A800" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>
                    </span>
                  </button>
                ))}
              </div>

              {/* today's recipes */}
              <div className="s1-meal-head">
                <span className="t">
                  Today&apos;s Recipes
                  <span ref={countRef} className="s1-count-badge" />
                </span>
                <button className="s1-view-plan">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                  View Meal Plan
                </button>
              </div>
              <div className="s1-group-label">For you</div>
              <div ref={recipesRef} className="s1-recipes-list" />
              <button className="s1-addmore">
                <span className="s1-addmore-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
                Add more recipe
              </button>
            </div>
          </div>

          {/* bottom bar */}
          <div className="s1-bottom-bar">
            <button className="s1-filter-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
            </button>
            <button className="s1-new-recipes-btn">
              New Recipes
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
          </div>

          {/* chat sheet */}
          <div ref={chatRef} className="s1-chatsheet">
            <div className="s1-sheet-grab" />
            <div className="s1-sheet-head">
              <span className="s1-sheet-chef">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>
              </span>
              <span className="s1-sheet-title">Dinner Ideas! Let&apos;s roll</span>
            </div>
            <div ref={msgsRef} className="s1-sheet-body" />
          </div>

          {/* toast */}
          <div ref={toastRef} className="s1-toast">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span ref={toastTxtRef}>Added to today</span>
          </div>

          {/* bot overlay */}
          {rippleEl}
          {fingerEl}
        </div>
      </StellarPhone>
    </>
  )
}
