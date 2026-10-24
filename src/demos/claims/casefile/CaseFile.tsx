'use client'

import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { CLAIM, COPY, SECTION_DETAILS, fmtLoss, fmtMoney, type EdgeCase } from './data'
import { claimsWaiting, closeReason, deriveTabs, isSolid, requestPending, type Decision, type FileState, type Tab } from './state'
import { CloseGate } from './moments/CloseGate'
import { DateStepper } from './moments/DateStepper'
import { EdgeCasePicker } from './moments/EdgeCasePicker'
import { PaymentSlider } from './moments/PaymentSlider'
import s from './casefile.module.css'

// Fixed geometry (mirrors casefile.module.css). Tabs are sized from their mono labels,
// so positions are computed, never measured.
const GEO = { paperW: 400, stampBottom: 84, tabTop: 14, tabGap: 4, tabBase: 34, tabPerChar: 7.3 }
const TETHER_X = GEO.paperW - 12
/** Each attachment adds a sheet under the file: [dx, dy, rotate°]. */
const SHEETS: [number, number, number][] = [[3, 4, 0.6], [-3, 7, -0.5], [4, 10, 0.4], [-2, 13, -0.6], [3, 16, 0.5], [-4, 19, -0.4]]

function layoutTabs(tabs: Tab[]) {
  let y = GEO.tabTop
  return tabs.map(t => {
    const h = Math.round(GEO.tabBase + t.label.length * GEO.tabPerChar)
    const slot = { y, h }
    y += h + GEO.tabGap
    return slot
  })
}

// Sets `inert` on the hidden face so its controls can't be tabbed to or announced.
function useInert(ref: RefObject<HTMLElement>, inert: boolean) {
  useEffect(() => {
    if (ref.current) (ref.current as HTMLElement & { inert: boolean }).inert = inert
  }, [ref, inert])
}

export type FileActions = {
  pickEdge: (e: EdgeCase) => void
  stepDate: (d: number) => void
  setAmount: (v: number) => void
  raiseReserve: () => void
  flip: (next: boolean) => void
  decide: (kind: NonNullable<Decision>['kind'], reason: string) => void
  closeStep: (n: number) => void
  reset: () => void
}

const GLYPH = { ok: '✓', warn: '!', danger: '✕' } as const
/** Slips on moments with the dog-ear leave its corner clear. */
const DOG_EAR_ROOM = { marginBottom: 52 }

export function CaseFile({ state, actions, dogEarRef, backHeadingRef }: {
  state: FileState
  actions: FileActions
  dogEarRef: RefObject<HTMLButtonElement>
  backHeadingRef: RefObject<HTMLHeadingElement>
}) {
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  useInert(frontRef, state.flipped)
  useInert(backRef, !state.flipped)

  const tabs = deriveTabs(state)
  const slots = layoutTabs(tabs)
  const requestIdx = tabs.findIndex(t => t.id === 'request')
  const showTether = requestIdx >= 0 && requestPending(state) && !state.flipped
  const tetherY = requestIdx >= 0 ? slots[requestIdx].y + slots[requestIdx].h / 2 : 0
  const closed = state.closeStep === 3
  const started = state.active >= 1
  const m = state.active

  return (
    <div className={s.stage}>
      <div className={`${s.flipper} ${state.flipped ? s.isFlipped : ''}`}>
        {/* ── Front: the handler's case file ── */}
        <div ref={frontRef} className={`${s.face} ${s.front}`} aria-hidden={state.flipped}>
          <div className={`${s.fileBody} ${closed ? s.shudder : ''}`}>
            {tabs.map((t, i) => {
              const [dx, dy, r] = SHEETS[i % SHEETS.length]
              return <div key={`sheet-${t.id}`} className={s.sheet} aria-hidden="true" style={{ transform: `translate(${dx}px, ${dy}px) rotate(${r}deg)` }} />
            })}

            {tabs.map((t, i) => (
              <div key={t.id} className={s.tab} aria-hidden="true" style={{ transform: `translateY(${slots[i].y}px)`, height: slots[i].h }}>
                <div className={`${s.tabInner} ${i % 2 ? s.tabB : s.tabA}`}>
                  <span className={s.tabGlyph}>{t.mark ? GLYPH[t.mark] : ''}</span>
                  <span className={s.tabLabel}>{t.label}</span>
                  {t.mark && <span className={`${s.tabLip} ${s[`mark-${t.mark}`]}`} />}
                </div>
              </div>
            ))}

            <div className={`${s.paper} ${started && !isSolid(state) ? s.skeleton : ''}`}>
              <div className={s.head}>
                <div className={s.fileEyebrow}>Claim file{started && !isSolid(state) ? ' · skeleton' : ''}</div>
                <div className={s.fileId}>{CLAIM.id}</div>
                <div className={s.fileTitle}>{CLAIM.line} · {CLAIM.client}</div>
              </div>
              <dl className={s.fields}>
                <dt>Loss date</dt><dd>{started ? fmtLoss(state.dateShift) : '—'}</dd>
                <dt>Policy</dt>
                <dd>
                  {!started ? '—'
                    : state.edge === 'expired' && m < 2 ? <span className={s.struck}>{CLAIM.expiredPolicy}</span>
                    : isSolid(state) ? CLAIM.policy : 'Not linked yet'}
                </dd>
                <dt>Cause</dt><dd>{!started ? '—' : state.edge === 'noCause' ? 'Other Event (default)' : CLAIM.cause}</dd>
                <dt>Location</dt><dd>{!started ? '—' : state.edge === 'location' ? `${CLAIM.location} (as typed)` : CLAIM.location}</dd>
              </dl>

              <Slip state={state} actions={actions} />

              {m >= 6 && (
                <button ref={dogEarRef} type="button" className={s.dogEar} aria-pressed={state.flipped} onClick={() => actions.flip(true)}>
                  <span className={s.dogEarLabel}>Approver side</span>
                </button>
              )}
            </div>

            {/* The stamp. Same place from the first frame to the last; re-stamped once at closing. */}
            <div className={s.stampBox} role="img" aria-label={`Status: ${closed ? 'Closed' : 'Open'}`}>
              <div className={`${s.stamp} ${closed ? s.stampFaint : ''}`} aria-hidden="true">OPEN</div>
              {closed && <div className={`${s.stamp} ${s.stampNew}`} aria-hidden="true">CLOSED</div>}
            </div>
            {closed && <div className={s.stampReason}>reason: {closeReason(state)}</div>}

            {showTether && (
              <>
                <span aria-hidden="true" className={`${s.tether} ${s.tetherV}`} style={{ left: TETHER_X, top: GEO.stampBottom, height: tetherY - GEO.stampBottom }} />
                <span aria-hidden="true" className={`${s.tether} ${s.tetherH}`} style={{ left: TETHER_X, top: tetherY, width: GEO.paperW - TETHER_X }} />
              </>
            )}

            {/* Front cover: closed in the hero, hinges open as the first moment begins. */}
            <div className={`${s.cover} ${started ? s.coverOpen : ''}`} aria-hidden={started}>
              <div className={s.fileEyebrow}>Claim file · Marine cargo</div>
              <div className={s.coverLabel}>
                <div className={s.fileEyebrow}>Case no.</div>
                <div className={s.coverNo}>{CLAIM.id}</div>
                <div className={s.fileTitle} style={{ fontWeight: 500 }}>{CLAIM.client}</div>
              </div>
              <CoffeeRing />
            </div>
          </div>
        </div>

        {/* ── Back: the approver's side of the same file ── */}
        <div ref={backRef} className={`${s.face} ${s.back}`} aria-hidden={!state.flipped}>
          <div className={s.paper}>
            <div className={s.fileEyebrow}>Approver view</div>
            <h3 ref={backHeadingRef} tabIndex={-1} className={s.fileTitle} style={{ margin: '4px 0 0' }}>Waiting for your approval</h3>
            <div className={s.queueCounts}>
              <span>Reserves 2</span><span>Payments 1</span><span>Claims {claimsWaiting(state)}</span>
            </div>
            <ApproverRequest state={state} onDecide={actions.decide} />
            <button type="button" className={s.dogEar} onClick={() => actions.flip(false)}>
              <span className={s.dogEarLabel}>Handler side</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The slip for the active moment. It carries that moment's one interaction. */
function Slip({ state, actions }: { state: FileState; actions: FileActions }) {
  const m = state.active
  if (m === 1) {
    const linked = state.linked && state.edge !== 'expired'
    return (
      <div key="m1" className={s.slip}>
        <div className={s.slipTitle}>Skeleton · link a policy</div>
        <EdgeCasePicker value={state.edge} onPick={actions.pickEdge} />
        <div className={`${s.result} ${s.slipFoot}`}>
          {state.edge === 'expired' ? <><Dot mark="danger" />✕ {CLAIM.expiredPolicy} expired before the loss date. Pick another.</>
            : !linked ? <span className={s.muted}>Searching policies for {CLAIM.client}…</span>
            : state.edge === 'noCause' ? <><Dot mark="ok" />✓ Linked. Cause set to Other Event, change it any time.</>
            : state.edge === 'location' ? <><Dot mark="ok" />✓ Linked. Location kept as typed; changing it is opt-in.</>
            : <><Dot mark="ok" />✓ {CLAIM.policy} linked.</>}
        </div>
      </div>
    )
  }
  if (m === 2) {
    return (
      <div key="m2" className={s.slip}>
        <div className={s.slipTitle}>Sections</div>
        <div className={s.sections}>
          {SECTION_DETAILS.map(x => (
            <div key={x.name} className={s.section}>
              <div className={s.sectionName}>{x.name}</div>
              <div className={s.kv}><span className={s.slipTitle}>Covers</span>{x.what}</div>
              <div className={s.kv}><span className={s.slipTitle}>Damages</span>{x.damage}</div>
              <div className={s.kv}><span className={s.slipTitle}>Closing</span>Its own rules</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (m === 3) {
    return (
      <div key="m3" className={s.slip}>
        <div className={s.slipTitle}>Change summary</div>
        <div className={s.diff}>
          <span className={s.diffHead}>Field</span><span className={s.diffHead}>Original</span><span className={s.diffHead}>Updated</span>
          <span>Loss date</span><span>{fmtLoss(0)}</span><span>{fmtLoss(state.dateShift)}</span>
        </div>
        <DateStepper shift={state.dateShift} onStep={actions.stepDate} />
        <div className={`${s.result} ${s.slipFoot}`}>
          {state.dateShift === 0 ? <span className={s.muted}>No changes to review.</span>
            : <><Dot mark="warn" />! {COPY.dateSection} was built on the old date: review needed.</>}
        </div>
      </div>
    )
  }
  if (m === 4) {
    const over = state.amount > state.reserve
    return (
      <div key="m4" className={s.slip}>
        <div className={s.slipTitle}>Payment sheet</div>
        <div><Dot mark="ok" />✓ Payee: {CLAIM.payee}, details registered</div>
        <PaymentSlider amount={state.amount} reserve={state.reserve} onAmount={actions.setAmount} />
        <div className={s.trackWrap}>
          <div className={s.track}><div className={s.fill} style={{ transform: `scaleX(${Math.min(state.amount, state.reserve) / state.reserve})` }} /></div>
          {over && <span className={s.cap} aria-hidden="true" />}
        </div>
        <div className={`${s.row} ${s.between} ${s.mono}`} style={{ fontSize: '.8125rem' }}>
          <span>Paying {fmtMoney(state.amount)}</span><span>Reserve {fmtMoney(state.reserve)}</span>
        </div>
        <div className={`${s.result} ${s.slipFoot} ${s.row} ${s.between}`}>
          {over ? (
            <>
              <span><Dot mark="danger" />✕ Stopped at the reserve · {fmtMoney(state.amount - state.reserve)} over</span>
              <button type="button" className={s.paperBtn} onClick={actions.raiseReserve}>Go to reserves</button>
            </>
          ) : <span><Dot mark="ok" />✓ Fits the remaining reserve</span>}
        </div>
      </div>
    )
  }
  if (m === 5 || m === 6) {
    if (!state.request) return <div key="m5-empty" className={s.slip}><span className={s.muted}>No requests on this claim.</span></div>
    return (
      <div key="m56" className={s.slip} style={m === 6 ? DOG_EAR_ROOM : undefined}>
        <div className={s.slipTitle}>Approval request · pinned to the claim</div>
        <div style={{ fontWeight: 600 }}>Rejection · Coverage</div>
        <div className={s.muted}>“{CLAIM.handlerReason}”</div>
        <div className={`${s.mono} ${s.muted}`} style={{ fontSize: '.75rem' }}>Raised by the handler · today</div>
        <div className={`${s.result} ${s.slipFoot}`}>
          {state.decision?.kind === 'approved' ? <><Dot mark="ok" />✓ Approved: “{state.decision.reason}”</>
            : state.decision ? <>Declined: “{state.decision.reason}”</>
            : <><Dot mark="warn" />! Waiting for approval. The claim stays open.</>}
        </div>
      </div>
    )
  }
  if (m === 7) {
    return (
      <div key="m7" className={s.slip} style={DOG_EAR_ROOM}>
        <div className={s.slipTitle}>Closing gate</div>
        <CloseGate step={state.closeStep} blocked={requestPending(state)} reason={closeReason(state)} onStep={actions.closeStep} onReset={actions.reset} />
      </div>
    )
  }
  return null
}

function Dot({ mark }: { mark: 'ok' | 'warn' | 'danger' }) {
  return <span aria-hidden="true" className={`${s.markDot} ${s[`mark-${mark}`]}`} />
}

/** A single static coffee ring on the cover. */
function CoffeeRing() {
  return (
    <svg className={s.stain} width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="none" stroke="var(--cf-stain)" strokeOpacity=".32" strokeWidth="7" strokeDasharray="120 6 60 10 90 4" />
      <circle cx="61" cy="59" r="40" fill="none" stroke="var(--cf-stain)" strokeOpacity=".16" strokeWidth="2" />
    </svg>
  )
}

function ApproverRequest({ state, onDecide }: { state: FileState; onDecide: FileActions['decide'] }) {
  const [kind, setKind] = useState<NonNullable<Decision>['kind'] | null>(null)
  const [reason, setReason] = useState('')
  const id = useId()
  if (state.decision) {
    return (
      <div className={s.slip} style={{ marginBottom: 52 }}>
        <div className={s.slipTitle}>Claim rejection · Coverage</div>
        <div>{state.decision.kind === 'approved' ? '✓ Approved' : 'Declined'} · “{state.decision.reason}”</div>
        <div className={`${s.muted} ${s.slipFoot}`}>Written to the claim’s history. Turn the corner to see the claim.</div>
      </div>
    )
  }
  if (!state.request) return <div className={s.slip} style={{ marginBottom: 52 }}>No claim requests waiting.</div>
  const ok = !!kind && reason.trim().length > 0
  return (
    <form className={s.slip} style={{ marginBottom: 52 }} onSubmit={e => { e.preventDefault(); if (ok && kind) onDecide(kind, reason.trim()) }}>
      <div className={s.slipTitle}>Claims · 1 waiting</div>
      <div>
        <div style={{ fontWeight: 600 }}>Claim rejection · Coverage</div>
        <div className={s.muted}>“{CLAIM.handlerReason}”</div>
        <div className={`${s.mono} ${s.muted}`} style={{ fontSize: '.75rem', marginTop: 4 }}>{CLAIM.id} · from the handler</div>
      </div>
      <fieldset className={`${s.fieldset} ${s.decide}`}>
        <legend className={s.srOnly}>Decision</legend>
        <div className={s.row} style={{ gap: 16 }}>
          {(['approved', 'declined'] as const).map(k => (
            <label key={k} className={s.choice}>
              <input type="radio" name={`${id}-decision`} checked={kind === k} onChange={() => setKind(k)} />
              {k === 'approved' ? 'Approve' : 'Decline'}
            </label>
          ))}
        </div>
        <label htmlFor={`${id}-reason`} className={s.slipTitle}>Reason (required)</label>
        <textarea id={`${id}-reason`} rows={2} required value={reason} onChange={e => setReason(e.target.value)} />
        <div><button type="submit" className={s.paperBtn} disabled={!ok}>Confirm</button></div>
      </fieldset>
    </form>
  )
}
