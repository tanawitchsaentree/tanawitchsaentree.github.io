'use client'
/**
 * ProfitaPhoneScreen — self-contained phone shell, no dynamic island.
 * Shell width = SW + 2×PAD. Screen fills top-to-bottom with borderRadius:44.
 * Float + parallax done by parent via CSS custom property --float-y (optional).
 */
import React from 'react'
import { SC, SW, SH } from './screens/_screenTokens'
import { FeedScreen }           from './screens/FeedScreen'
import { RoboScreen }           from './screens/RoboScreen'
import { PortfolioScreen }      from './screens/PortfolioScreen'
import { FundScreen }           from './screens/FundScreen'
import { FundDetailScreen }     from './screens/FundDetailScreen'
import { BuyAmountScreen }      from './screens/BuyAmountScreen'
import { ConfirmScreen }        from './screens/ConfirmScreen'
import { OrderSuccessScreen }   from './screens/OrderSuccessScreen'
import { SwitchFundScreen }     from './screens/SwitchFundScreen'
import { SavingsAccountScreen } from './screens/SavingsAccountScreen'
import { BuyAccountScreen }     from './screens/BuyAccountScreen'

export type ScreenName =
  | 'feed' | 'robo' | 'portfolio'
  | 'fund' | 'funddetail' | 'buyamount' | 'confirm'
  | 'ordersuccess' | 'switchfund' | 'savings' | 'buyaccount'

const PAD = 10
export const PROFITA_PHONE_W = SW + PAD * 2   // 320
export const PROFITA_PHONE_H = SH + PAD * 2   // 670

const SCREEN_MAP: Record<ScreenName, React.ComponentType> = {
  feed:         FeedScreen,
  robo:         RoboScreen,
  portfolio:    PortfolioScreen,
  fund:         FundScreen,
  funddetail:   FundDetailScreen,
  buyamount:    BuyAmountScreen,
  confirm:      ConfirmScreen,
  ordersuccess: OrderSuccessScreen,
  switchfund:   SwitchFundScreen,
  savings:      SavingsAccountScreen,
  buyaccount:   BuyAccountScreen,
}

export function ProfitaPhoneScreen({ screen }: { screen: ScreenName }) {
  const Screen = SCREEN_MAP[screen]

  return (
    <div style={{
      position:     'relative',
      width:        PROFITA_PHONE_W,
      height:       PROFITA_PHONE_H,
      borderRadius: 48,
      padding:      PAD,
      background:   'linear-gradient(160deg,#2c3035 0%,#0e0f10 45%,#000 70%,#1c1e21 100%)',
      boxShadow:    `
        0 0 0 1.5px #3c4044,
        0 0 0 4px #111314,
        inset 0 0 0 1px rgba(255,255,255,.08),
        0 40px 80px -20px rgba(8,18,38,.6),
        0 16px 32px -16px rgba(8,18,38,.4)
      `,
      flexShrink:   0,
    }}>
      {/* Shadow blob */}
      <div style={{ position:'absolute', left:'12%', right:'12%', bottom:-32, height:44, background:'rgba(8,18,38,.28)', filter:'blur(28px)', borderRadius:'50%', zIndex:-1 }} />

      {/* Side buttons */}
      <div style={{ position:'absolute', left:-3, top:108, width:3, height:26, background:'linear-gradient(180deg,#38393c,#18191b)', borderRadius:'2px 0 0 2px' }} />
      <div style={{ position:'absolute', left:-3, top:152, width:3, height:48, background:'linear-gradient(180deg,#38393c,#18191b)', borderRadius:'2px 0 0 2px' }} />
      <div style={{ position:'absolute', left:-3, top:212, width:3, height:48, background:'linear-gradient(180deg,#38393c,#18191b)', borderRadius:'2px 0 0 2px' }} />
      <div style={{ position:'absolute', right:-3, top:176, width:3, height:68, background:'linear-gradient(180deg,#38393c,#18191b)', borderRadius:'0 2px 2px 0' }} />

      {/* Screen inner */}
      <div className="profita-screen" style={{
        position:     'relative',
        width:        '100%',
        height:       '100%',
        borderRadius: 38,
        overflow:     'hidden',
        background:   SC.paper,
      }}>
        <Screen />
      </div>

      {/* Glass sheen */}
      <div style={{
        position:      'absolute',
        inset:         0,
        pointerEvents: 'none',
        background:    'linear-gradient(130deg, rgba(255,255,255,.06) 0%, transparent 55%)',
        borderRadius:  'inherit',
        zIndex:        10,
      }} />
    </div>
  )
}
