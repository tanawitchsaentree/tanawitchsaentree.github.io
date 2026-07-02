'use client'
/* Injected once — hides all scrollbars inside .profita-screen */
export function ProfitaScreenStyles() {
  return (
    <style>{`
      .profita-screen,
      .profita-screen *,
      .profita-screen [style*="overflow"] {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      .profita-screen ::-webkit-scrollbar,
      .profita-screen::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `}</style>
  )
}
