'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ChangeLog } from './ChangeLog'
import { ConsoleView } from './Console'
import { ContrastField } from './ContrastField'
import { DRIFT, HERO, MARKS, SAMPLE_COLOURS, SECTIONS, SWATCHES, TEXT, type RequestId } from './data'
import { COLUMNS, cell, flag, forkName, outlier, type ButtonProps, type Column, type Fork } from './drift'
import { IconLink, IconLock, IconPlus } from './Icons'
import { RAW, checkBrand, type Layout } from './model'
import { Disclosure, DoctorCodeBlock, EdgesBlock, GovernanceBlock, OnboardingBlock, Panel, RotBlock, Seg } from './Sections'
import type { Answer, FileLine, Store } from './useInvitrace'
import s from './invitrace.module.css'

// The X-ray and its table load only when the reader asks to trace the alert.
const XRay = dynamic(() => import('./XRay').then(m => m.XRay), { ssr: false })
const LineageTable = dynamic(() => import('./XRay').then(m => m.LineageTable), { ssr: false })

const ORDER: RequestId[] = ['copy', 'colour', 'alert', 'doctor', 'sort', 'small']
const fmt = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '')
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** One theme-file line: the sign and icon carry the meaning; struck lines keep their reason unstruck. */
function Line({ line, req, short }: { line: FileLine; req: RequestId; short?: boolean }) {
  const Icon = req === 'copy' ? IconLink : line.struck ? IconLock : IconPlus
  return (
    <span className={s.fLine} data-struck={line.struck || undefined}>
      {/* The hero's short form carries the icon; the file itself shows the sign as written. */}
      {short && <Icon size={13} />}
      <span className={s.fCode}>{short ? '' : `${line.sign} `}{line.key}{line.value ? `  ${line.value}` : ''}</span>
      {!short && line.note && <span className={s.fNote}>{line.note}</span>}
    </span>
  )
}

/** A chapter: margin mark (always visible), heading, the clinic's request, the prose, the demo. */
function Chapter({ id, mark, title, request, meta, body, children, bleed, after }: { id: string; mark: string; title: string; request?: string; meta?: ReactNode; body: ReactNode; children?: ReactNode; bleed?: ReactNode; after?: ReactNode }) {
  return (
    <section id={id} className={s.chapter} aria-labelledby={`${id}-h`}>
      <p className={s.mark}>{mark}</p>
      <div className={s.chapterMain}>
        <h2 id={`${id}-h`} className={s.h2}>{title}</h2>
        {request && (
          <div className={s.request}>
            <p className={s.reqLabel}>{HERO.requestLabel}{meta}</p>
            <p className={s.reqText}>{request}</p>
          </div>
        )}
        {body}
        {children}
      </div>
      {bleed && <div className={s.bleed}>{bleed}</div>}
      {after && <div className={s.chapterAfter}>{after}</div>}
    </section>
  )
}
const Body = ({ ps }: { ps: string[] }) => <>{ps.map(p => <p key={p} className={s.body}>{p}</p>)}</>
const reqText = (id: RequestId) => HERO.requests.find(r => r.id === id)!.text

// ── Hero: the clinic's request list with an answer column ──
function Hero({ st }: { st: Store }) {
  return (
    <header className={s.hero}>
      <p className={s.eyebrow}>{HERO.eyebrow}</p>
      <h1 className={s.h1}>{HERO.title}</h1>
      <p className={s.lead}>{HERO.intro}</p>
      <table className={s.reqTable}>
        <caption>{HERO.caption}</caption>
        <thead><tr><th scope="col">Request</th><th scope="col">Answer</th></tr></thead>
        <tbody>
          {HERO.requests.map(r => {
            const a = st.tried[r.id]
            return (
              <tr key={r.id}>
                <th scope="row"><a href={`#${r.anchor}`}>{r.text}</a></th>
                <td>
                  <a href={`#${r.anchor}`} className={s.answer} data-filled={a ? '' : undefined}>
                    {a ? <span key={a.lines.map(l => l.value).join()} className={s.answerFill}>{a.lines.map((l, i) => <Line key={i} line={l} req={r.id} short />)}</span>
                      : <span className={s.srOnly}>{HERO.notAnswered}</span>}
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className={s.sample}>{HERO.credit}</p>
    </header>
  )
}

// ── S1: three kinds of hospital ──
function S1({ st }: { st: Store }) {
  const t = SECTIONS.s1
  const [view, setView] = useState(st.hospital.id)
  return (
    <Chapter id="ix-s1" mark={MARKS.s1} title={t.title} body={<Body ps={t.body} />}>
      <Panel label="Hospitals on the platform">
        <Seg label="Hospital" value={view} options={st.hospitals.map(h => ({ id: h.id, label: h.name }))}
          onPick={id => { setView(id); const h = st.hospitals.find(x => x.id === id)!; st.actions.note(`Viewing ${h.name}`, `${h.name} on its own theme file.`, { tier: 'Theme' }) }} />
        <div key={view} className={s.slideIn}><ConsoleView st={st} region="full" hospitalId={view} /></div>
      </Panel>
    </Chapter>
  )
}

// ── S2: the old answer was a copy ──
const STEP = 420
function S2({ st }: { st: Store }) {
  const t = SECTIONS.s2
  const one = st.drift === 'one'
  const [ref, setRef] = useState<string>(() => st.hospital.primary)
  const [forkF, setForkF] = useState<Fork | null>(null)
  const passing = SWATCHES.filter(h => checkBrand(h).ok)
  const canon: ButtonProps = { pad: '0 16px', r: st.hospital.radius, bg: ref, weight: 600, label: 'Admit patient', h: parseInt(st.resolved.component['button.minHeight']) }
  const forks = forkF ? [...SAMPLE_COLOURS.drift, forkF] : SAMPLE_COLOURS.drift
  const [conv, setConv] = useState(0)
  useEffect(() => {
    if (st.drift !== 'one') { setConv(0); return }
    if (reduced()) { setConv(COLUMNS.length); return }
    let k = 0
    setConv(1)
    const id = window.setInterval(() => { k = Math.min(COLUMNS.length, k + 1); setConv(k + 1); if (k + 1 >= COLUMNS.length) window.clearInterval(id) }, STEP)
    return () => window.clearInterval(id)
  }, [st.drift])
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!forkF) return
    const el = wrap.current; if (!el) return
    requestAnimationFrame(() => el.scrollTo({ left: el.scrollWidth, behavior: reduced() ? 'auto' : 'smooth' }))
  }, [forkF])
  const done = (c: Column) => conv > COLUMNS.findIndex(x => x.id === c)
  const shown = (f: Fork): ButtonProps => ({
    pad: done('pad') ? canon.pad : f.pad, r: done('r') ? canon.r : f.r, bg: done('contrast') ? canon.bg : f.bg,
    weight: done('weight') ? canon.weight : f.weight, label: done('label') ? canon.label : f.label, h: done('h') ? canon.h : f.h,
  })
  const settled = one && conv >= COLUMNS.length
  const lean = one ? 1 - conv / COLUMNS.length : 1
  const addF = () => {
    const f: Fork = { pad: canon.pad, r: canon.r, bg: st.hospital.primary, rot: 0, x: 0, y: 0, weight: canon.weight, label: canon.label, h: canon.h }
    setForkF(f)
    st.actions.note('Copy made for the Specialty clinic', `Fork F hard-codes ${f.bg}. It won't follow the shared button.`, { tier: 'No shared tier' })
  }
  const stepRef = () => {
    const i = passing.indexOf(ref); const next = passing[(i + 1) % passing.length]
    setRef(next)
    st.actions.note(`Shared button colour set to ${next}`, 'The copies keep their old values.', { tier: 'Component', held: ['Every copy, values hard-coded'] })
  }
  return (
    <Chapter id="ix-s2" mark={st.tried.copy ? MARKS.s2after : MARKS.s2} title={t.title} request={reqText('copy')} body={<Body ps={t.body} />}>
      <Panel label="Copies of the Admit button">
        <div className={s.row}>
          <button type="button" className={st.drift === 'idle' ? s.btn : s.btnQuiet} onClick={st.actions.showDrift} aria-pressed={st.drift === 'drifted'}>Show the copies</button>
          <button type="button" className={s.btnQuiet} onClick={addF} disabled={st.drift === 'idle' || !!forkF || one}>See what a copy would do</button>
          <button type="button" className={s.btnQuiet} onClick={stepRef} disabled={st.drift === 'idle' || one}>Change the shared button colour</button>
          <button type="button" className={s.btnQuiet} onClick={() => st.actions.consolidate(forks, ref)} disabled={st.drift === 'idle'} aria-pressed={one}>Consolidate</button>
        </div>
        {st.drift !== 'idle' && (
          <div className={s.drift} data-one={settled || undefined}>
            {forks.map((f, i) => {
              const b = shown(f)
              return (
                <span key={i} className={s.driftItem} aria-hidden="true" data-f={i === 5 || undefined}>
                  <span className={s.driftBtn} style={{ padding: b.pad, borderRadius: b.r, background: b.bg, fontWeight: b.weight, height: b.h, transform: settled ? undefined : `translate(${f.x * lean}px, ${f.y * lean}px) rotate(${f.rot * lean}deg)` }}>{b.label}</span>
                  <span className={s.driftTag}>{forkName(i)}</span>
                </span>
              )
            })}
          </div>
        )}
        {st.drift !== 'idle' && (
          // A sideways-scrolling region must be reachable by keyboard (WCAG 2.1.1).
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          <div ref={wrap} className={s.tableWrap} data-sheet tabIndex={0} role="region" aria-label="Copy property sheet, scrolls sideways">
            <table className={s.matrix}>
              <caption>{DRIFT.caption}</caption>
              <thead><tr><th scope="col">Property</th>{forks.map((_, fi) => <th key={fi} scope="col" data-f={fi === 5 || undefined}>{fi === 5 ? t.forkF : forkName(fi)}</th>)}<th scope="col" data-ref>Reference</th></tr></thead>
              <tbody>
                {COLUMNS.map(c => {
                  const d = done(c.id)
                  return (
                    <tr key={c.id} data-conv={d || undefined}>
                      <th scope="row">{c.label}</th>
                      {forks.map((f, fi) => {
                        const v = cell(f, c.id), refV = cell(canon, c.id)
                        const out = c.id === 'contrast' ? f.bg !== canon.bg && !checkBrand(f.bg).ok : outlier(f, canon, c.id)
                        const fl = out ? flag(f, canon, c.id) : null
                        const fail = !d && c.id === 'contrast' && !checkBrand(f.bg).ok
                        return (
                          <td key={fi} data-out={(!d && out) || undefined} data-fail={fail || undefined} data-fixed={(d && out) || undefined} data-f={fi === 5 || undefined}>
                            {d && out
                              ? <><del className={s.mOld}>{v}</del> <ins className={s.mFix}>{refV}</ins></>
                              : <>{v}{fl && <sup className={s.mFlag}>{fl}<span className={s.srOnly}>{fl === 'H' ? ', above reference' : fl === 'L' ? ', below reference' : ', differs from reference'}</span></sup>}</>}
                          </td>
                        )
                      })}
                      <td data-ref>{cell(canon, c.id)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {st.drift !== 'idle' && <p className={s.sample}>{DRIFT.legend}</p>}
      </Panel>
      <Disclosure label={[t.staleTitle, t.staleTitle]} onToggle={o => { if (o) st.actions.note('Opened: how copies went stale', 'Detached and pasted copies stop receiving fixes.', { tier: 'Component' }) }}>
        <Body ps={t.stale} />
        <RotBlock st={st} />
      </Disclosure>
    </Chapter>
  )
}

// ── S3: where the line sits ──
function S3({ st }: { st: Store }) {
  const t = SECTIONS.s3
  return (
    <Chapter id="ix-s3" mark={MARKS.s3} title={t.title} body={<Body ps={t.body} />}>
      <div className={s.split}>
        <div><p className={s.panelLabel}>{t.themeHead}</p><ul className={s.plainList}>{t.themeItems.map(x => <li key={x}>{x}</li>)}</ul></div>
        <div><p className={s.panelLabel}>{t.lockedHead}</p><ul className={s.plainList}>{t.lockedItems.map(x => <li key={x}><IconLock size={13} /> {x}</li>)}</ul></div>
      </div>
      <Disclosure label={[t.moreTitle, t.moreTitle]} onToggle={o => { if (o) st.actions.note('Opened: locked and flexible settings', 'Settings per hospital type.', { tier: 'Component rules' }) }}>
        <Body ps={t.more} />
        <GovernanceBlock st={st} />
        <EdgesBlock st={st} />
        <ConsoleView st={st} region="table" label="Specialty clinic patient list" />
      </Disclosure>
    </Chapter>
  )
}

// ── S4: the brand colour ──
function S4({ st }: { st: Store }) {
  const t = SECTIONS.s4
  const sent = t.sent
  const [check, setCheck] = useState<ReturnType<typeof checkBrand> | null>(null)
  const a = st.tried.colour
  const sentHex = a?.meta?.sent ?? sent
  const applied = a?.meta?.applied
  const sentence = !applied || applied !== sentHex
    ? fmt(t.substitute, { sent: sentHex, r: checkBrand(sentHex).ratio.toFixed(1) })
    : fmt(t.asSent, { hex: applied, r: checkBrand(applied).ratio.toFixed(1) })
  return (
    <Chapter id="ix-s4" mark={MARKS.s4} title={t.title} request={reqText('colour')} meta={<span className={s.reqMeta}> · {t.sentLabel}: <span className={s.mono}>{sent}</span></span>}
      body={<><Body ps={t.body} /><p className={s.body}>{sentence}</p></>}>
      <Panel label="Brand colour for the clinic">
        <div className={s.row}>
          <button type="button" className={s.btn} onClick={() => setCheck(st.actions.setPrimary(sent))}>Apply {sent}</button>
        </div>
        {check && !check.ok && (
          <div className={s.notice} role="status">
            <p>{fmt(t.refused, { r: check.ratio.toFixed(2) })}</p>
            <button type="button" className={s.btnQuiet} onClick={() => { st.actions.setPrimary(check.nearest); setCheck(null) }}>
              <span className={s.dot} style={{ background: check.nearest }} aria-hidden="true" /> Use {check.nearest}
            </button>
          </div>
        )}
        <ContrastField st={st} start={sent} />
        <ConsoleView st={st} region="actions" label="Specialty clinic Admit button" />
      </Panel>
    </Chapter>
  )
}

// ── S5: the alert band, the page's one grid break ──
function S5({ st }: { st: Store }) {
  const t = SECTIONS.s5
  const [wipe, setWipe] = useState(0)
  const [trace, setTrace] = useState(false)
  const clinic = st.hospital.id
  const recolour = () => {
    if (reduced()) { st.actions.tryAlertColour(); return }
    setWipe(n => n + 1)
  }
  return (
    <Chapter id="ix-s5" mark={MARKS.s5} title={t.title} request={reqText('alert')} body={<Body ps={t.body} />}
      bleed={
        <div className={s.band} style={{ '--n': st.hospitals.length } as CSSProperties} role="group" aria-label="Critical alert in every hospital">
          {st.hospitals.map(h => (
            <div key={h.id} className={s.bandSlice} style={{ '--b': h.primary, '--c': RAW.critical } as CSSProperties}>
              <span className={s.bandStripe} aria-hidden="true" />
              <div className={s.bandAlert}>
                <span>{TEXT.ALERT}</span>
                {h.id === clinic && wipe > 0 && <span key={wipe} className={s.bandWipe} aria-hidden="true" onAnimationEnd={() => st.actions.tryAlertColour()} />}
              </div>
              <p className={s.bandMeta}><span>{h.name}</span><span>brand {h.primary}</span><span>alert {RAW.critical}</span></p>
            </div>
          ))}
        </div>
      }
      after={<>
        <div className={s.row}>
          <button type="button" className={s.btnQuiet} onClick={recolour}>Recolour the clinic&rsquo;s alert</button>
          <button type="button" className={s.btnQuiet} aria-expanded={trace} onClick={() => { if (!trace) { setTrace(true); st.actions.pickLineage('alert.background') } }}>Trace the alert</button>
        </div>
        {trace && (
          <>
            <div className={s.row}><button type="button" className={s.btnQuiet} onClick={() => st.actions.pickLineage('button.text')}>Trace button text</button></div>
            <XRay st={st} defaultOpen />
          </>
        )}
        <Disclosure label={['Show lineage table', 'Hide lineage table']} onToggle={o => { if (o) st.actions.note('Lineage table opened', 'Every console part, tier by tier.', { tier: 'Lineage' }) }}>
          <LineageTable st={st} />
        </Disclosure>
      </>} />
  )
}

// ── S6: the doctor card ──
function S6({ st }: { st: Store }) {
  const t = SECTIONS.s6
  const [district, setDistrict] = useState(false)
  const dist = st.hospitals.find(h => h.id === 'district')
  const opts: { id: Layout; label: string }[] = [{ id: 'row', label: 'Row' }, { id: 'column', label: 'Column with footer' }, { id: 'hero', label: 'HeroDoctorCard' }]
  const ans = st.tried.doctor
  const chosen: Layout = ans ? (ans.outcome === 'yes' ? 'hero' : (ans.lines[0].value as Layout)) : st.hospital.layout
  return (
    <Chapter id="ix-s6" mark={MARKS.s6} title={t.title} request={reqText('doctor')} body={<Body ps={t.body} />}>
      <Panel label="Doctor card">
        <Seg<Layout> label="Doctor card for the clinic" value={chosen} options={opts} onPick={v => st.actions.setLayout(v)} />
        <ConsoleView st={st} region="doctor" label="Specialty clinic doctor card" />
        <button type="button" className={s.btnQuiet} aria-pressed={district} onClick={() => { setDistrict(!district); st.actions.note(district ? 'District card hidden' : 'District card shown', 'The list card takes slot layouts.', { tier: 'Theme' }) }}>See it on the District hospital</button>
        {district && dist && (
          <>
            <Seg<Layout> label="Doctor card for the District hospital" value={dist.layout} options={opts.slice(0, 2)} onPick={v => st.actions.setLayout(v, dist.id)} />
            <ConsoleView st={st} region="doctor" hospitalId={dist.id} label="District hospital doctor card" />
          </>
        )}
      </Panel>
      <Disclosure label={['Show the component', 'Hide the component']} onToggle={o => { if (o) st.actions.note('Opened: the DoctorCard component', 'One component, slots for layout.', { tier: 'Component' }) }}>
        <DoctorCodeBlock st={st} />
      </Disclosure>
    </Chapter>
  )
}

// ── S7: sort and compact ──
function S7({ st }: { st: Store }) {
  const t = SECTIONS.s7
  const [asked, setAsked] = useState(false)
  return (
    <Chapter id="ix-s7" mark={MARKS.s7} title={t.title} request={reqText('sort')} body={<Body ps={t.body} />}>
      <Panel label="Clinic patient list">
        <ConsoleView st={st} region="table" label="Specialty clinic patient list" />
        <button type="button" className={s.btn} onClick={() => { st.actions.tryGov('sort'); st.actions.tryGov('density'); setAsked(true) }}>Ask again</button>
        {asked && <p className={s.cost}>{t.cost}</p>}
      </Panel>
    </Chapter>
  )
}

// ── S8: smaller buttons ──
function S8({ st }: { st: Store }) {
  const t = SECTIONS.s8
  const [tablet, setTablet] = useState(false)
  const teach = st.hospitals.find(h => h.id === 'teaching')
  return (
    <Chapter id="ix-s8" mark={MARKS.s8} title={t.title} request={reqText('small')} body={<Body ps={t.body} />}>
      <Panel label="Clinic buttons">
        <ConsoleView st={st} region="actions" label="Specialty clinic Admit button" />
        <button type="button" className={s.btnQuiet} onClick={() => st.actions.tryGov('touch')}>Try 36px</button>
      </Panel>
      <Disclosure label={[t.asideTitle, t.asideTitle]} onToggle={o => { if (o) st.actions.note('Opened: how teaching hospitals get 36px', 'Teaching screens need the desktop-only flag.', { tier: 'Environment' }) }}>
        <div className={s.aside2}>
          <p className={s.body}>{t.aside}</p>
          {teach && <ConsoleView st={st} region="actions" hospitalId={teach.id} label="Teaching hospital buttons" />}
          <div className={s.row}>
            <button type="button" className={s.btnQuiet} aria-pressed={!!teach && !!st.govs[teach.id]?.desktopFlag} onClick={() => teach && st.actions.toggleFlag(teach.id)}>Mark this screen desktop only</button>
            <button type="button" className={s.btnQuiet} onClick={() => teach && st.actions.tryGov('touch', teach.id)}>Use 36px targets</button>
            <button type="button" className={s.btnQuiet} aria-pressed={tablet} onClick={() => { setTablet(!tablet); st.actions.note(tablet ? 'Tablet view closed' : 'Teaching screen shown on a tablet', t.simulated, { tier: 'Environment', blocked: !tablet }) }}>Show this screen on a tablet</button>
          </div>
          {tablet && teach && (
            <div className={s.tablet} role="group" aria-label="Simulated tablet">
              <p className={s.panelLabel}>{t.simulated}</p>
              <ConsoleView st={st} region="actions" hospitalId={teach.id} label="Teaching screen on a tablet" />
            </div>
          )}
        </div>
      </Disclosure>
    </Chapter>
  )
}

// ── S9: not a request ──
function S9({ st }: { st: Store }) {
  const t = SECTIONS.s9
  const root = useRef<HTMLDivElement>(null)
  return (
    <Chapter id="ix-s9" mark={MARKS.s9} title={t.title} body={<Body ps={t.body} />}>
      <Panel label="District hospital patient list">
        <div className={s.row}>
          <button type="button" className={s.btnQuiet} aria-pressed={st.shortcut} onClick={st.actions.toggleShortcut}>{st.shortcut ? "Remove the hospital's shortcuts" : "Add a hospital's shortcuts"}</button>
          <button type="button" className={s.btnQuiet} onClick={() => st.actions.focusList(root.current)}>Move focus to the patient list</button>
        </div>
        <div ref={root}><ConsoleView st={st} region="table" hospitalId="district" shortcut={st.shortcut} label="District hospital patient list" /></div>
      </Panel>
    </Chapter>
  )
}

// ── S10: the theme file ──
function S10({ st }: { st: Store }) {
  const t = SECTIONS.s10
  const entries = useMemo(() => ORDER.flatMap(id => (st.tried[id] ? [[id, st.tried[id]] as [RequestId, Answer]] : [])), [st.tried])
  const passed = !!st.tried.colour && checkBrand(st.hospital.primary).ok
  return (
    <Chapter id="ix-s10" mark={MARKS.s10} title={t.title} body={<Body ps={t.body} />}>
      <p className={s.review} data-ok={passed || undefined}>{passed ? t.passed : t.waiting}</p>
      <figure className={s.file}>
        <figcaption className={s.fileHead}>{t.file}</figcaption>
        {entries.length === 0
          ? <p className={s.fileEmpty}>{t.empty}</p>
          : <ol className={s.fileLines}>{entries.flatMap(([id, a]) => a.lines.map((l, i) => <li key={`${id}-${i}`}><Line line={l} req={id} /></li>))}</ol>}
      </figure>
      <Disclosure label={['Show full change log', 'Hide full change log']} onToggle={o => { if (o) st.actions.note('Change log opened', 'Every entry on this page.', { tier: 'Log' }) }}>
        <button type="button" className={s.btnQuiet} onClick={st.actions.clearLog} disabled={st.log.length === 0}>Clear log</button>
        <ChangeLog log={st.log} id="ix-log" onRecord={st.actions.openRecord} />
      </Disclosure>
      <Disclosure label={['Add another hospital', 'Hide']} onToggle={o => { if (o) st.actions.note('Opened: add another hospital', 'A new hospital is a reviewed theme file.', { tier: 'Onboarding' }) }}>
        <OnboardingBlock st={st} />
      </Disclosure>
      <p className={s.limits}>{t.limits}</p>
    </Chapter>
  )
}

export function Story({ st }: { st: Store }) {
  return (
    <>
      <Hero st={st} />
      <S1 st={st} />
      <S2 st={st} />
      <S3 st={st} />
      <S4 st={st} />
      <S5 st={st} />
      <S6 st={st} />
      <S7 st={st} />
      <S8 st={st} />
      <S9 st={st} />
      <S10 st={st} />
    </>
  )
}
