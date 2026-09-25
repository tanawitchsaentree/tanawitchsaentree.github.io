# Project visual system

All project shells use the native system sans stack, 14px body text, 28–38px main headings and 20–24px section headings. Shared content width is approximately 1040px, with 24px mobile gutters and 32–40px section spacing.

Palette: #f5f5f3 canvas, #252a2c primary text, #596166 secondary text, #d9ddda borders, #536e60 muted green accents. Product demonstrations retain their functional colours, while all text uses the same font family. Manabi notes use the same palette.

Sources: src/styles/projects.css, the compact-story and Profita CSS modules, and public/demos/project-type.css for standalone iframe content.

Preview: localhost:3000 serves the production export. Desktop screenshots reviewed for Profita, Claims, Stellar, Invitrace and Allianz. Browser review caught an extra Allianz gate wrapper affecting header spacing; selectors now account for it. Mobile viewport override was blocked by automatic approval review, so no mobile screenshot verification is claimed.
