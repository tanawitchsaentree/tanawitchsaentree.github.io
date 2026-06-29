import { C } from './tokens'

export function ClaimsHero() {
  return (
    <header style={{
      minHeight: '100svh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '5rem 0 3rem',
      position: 'relative',
    }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ fontFamily: C.font.mono, fontSize: '.78rem', color: C.color.txDim, display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '2rem' }}>
          <span style={{ color: C.color.live }}>#</span>
          an engineering record of one design role — read top to bottom
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(280px,55%,640px) 1fr', gap: 'clamp(1.6rem,4vw,3.4rem)', alignItems: 'center' }} className="claims-hero-grid">
          <div>
            <h1 style={{
              fontFamily: C.font.display, fontWeight: 700,
              fontSize: 'clamp(2.3rem,6vw,4.1rem)',
              lineHeight: 1.02, letterSpacing: '-.035em',
              color: C.color.txHi,
            }} className="claims-animate claims-d1">
              I stopped <span style={{ color: C.color.txDim, textDecoration: 'line-through', textDecorationColor: C.color.txDim }}>handing off</span> designs.{' '}
              I started <span style={{ color: C.color.live }}>handing over software.</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem,1.6vw,1.18rem)', color: C.color.tx, maxWidth: '48ch', marginTop: '1.6rem', lineHeight: 1.6 }} className="claims-animate claims-d2">
              I lead design on a commercial claims platform. The job changed shape: I still own the design — I just stopped shipping Figma and started shipping working software, verified against the acceptance criteria.
            </p>

            <div style={{ marginTop: '2.2rem', border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden', maxWidth: '30rem' }} className="claims-animate claims-d2">
              {[
                ['role',       'design systems lead'],
                ['deliverable','working software, not Figma'],
                ['method',     'audit → build → verify loop'],
                ['status',     '● shipping · phase 1'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '9.5rem 1fr', fontFamily: C.font.mono, fontSize: '.78rem', borderBottom: `1px solid ${C.color.line}` }}>
                  <span style={{ padding: '.55rem .9rem', color: C.color.txDim, background: C.color.inset, borderRight: `1px solid ${C.color.line}`, letterSpacing: '.04em' }}>{k}</span>
                  <span style={{ padding: '.55rem .9rem', color: k === 'status' ? C.color.live : C.color.txHi }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3.2rem', fontFamily: C.font.mono, fontSize: '.72rem', color: C.color.txDim, display: 'flex', alignItems: 'center', gap: '.6rem' }} className="claims-animate claims-d3">
              <span style={{ width: 34, height: 1, background: C.color.lineBri, display: 'block' }} />
              00 — 08 · scroll to read the record
            </div>
          </div>

          {/* Live proof panel */}
          <div style={{ background: C.color.panel, border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden', boxShadow: C.shadow.cardLg }} className="claims-animate claims-d3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.62rem .9rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset, fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim }}>
              <span style={{ display: 'flex', gap: '.34rem' }}>{['','',''].map((_,i) => <i key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: C.color.line2, display: 'block' }} />)}</span>
              <span style={{ color: C.color.txHi }}>edit-claim.component</span>
              <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid color-mix(in srgb,${C.color.live} 38%,transparent)`, color: C.color.live, background: C.alpha.liveSoft }}>● live</span>
            </div>
            <div style={{ padding: '.95rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <b style={{ fontFamily: C.font.display, fontWeight: 600, fontSize: '1.05rem', color: C.color.txHi }}>Edit claim</b>
                  <span style={{ fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid color-mix(in srgb,${C.color.info} 35%,transparent)`, color: C.color.info }}>reopened</span>
                </div>
                {[['loss_date','12 Mar 2026'],['cause','Escape of water'],['reserve','€ 1,240,000']].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem .7rem', background: C.color.inset, border: `1px solid ${C.color.line}`, borderRadius: 6, fontSize: '.86rem' }}>
                    <span style={{ color: C.color.txDim, fontFamily: C.font.mono, fontSize: '.74rem' }}>{l}</span>
                    <span style={{ color: C.color.txHi, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.2rem' }}>
                  <span style={{ flex: 1, textAlign: 'center', padding: '.55rem', borderRadius: 6, fontSize: '.82rem', fontWeight: 600, background: C.color.live, color: C.color.txOnLive, fontFamily: C.font.body }}>Save changes</span>
                  <span style={{ flex: 1, textAlign: 'center', padding: '.55rem', borderRadius: 6, fontSize: '.82rem', border: `1px solid ${C.color.line2}`, color: C.color.tx, fontFamily: C.font.body }}>Discard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
