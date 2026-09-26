# Demo audit and repair plan for Sol

> Superseded by `demo-showcase-repair-plan.md` following the owner's clarification that these are showcases, not apps visitors are expected to operate. Retain the observations below as audit history; do not implement its click-first requirements as the current direction.

Date: 26 September 2026
Repository: tanawitchsaentree.github.io
Base commit: 5c4cfe5 (main)

## Task and boundaries

Repair the existing portfolio demos using the findings below. The owner asked for an audit and a plan; this document is the handoff for implementation, not a claim that fixes are already made.

Preserve the current project heroes, concise narrative, fonts, shell colours, and placement of demos. Do not redesign the whole portfolio, restore deleted long case studies, invent impact metrics, or connect real banking/clinical systems. All actions remain local sample interactions.

There is an uncommitted, verified Manabi modal theme fix in `src/components/home/ManabiModal.module.css`. Preserve it. It restores homepage colours and rounds all four corners. Do not revert it or mix it into demo logic.

Current preview is a Python static server on port 3000 serving `out/`. Source changes only appear after `npm run build`. Do not run a Next dev server and a production build against the same `.next` directory simultaneously. No push or deploy is part of this repair plan unless the owner requests it.

## Evidence and limits

Manually exercised the seven mounted project demos on localhost in the default desktop browser viewport, and inspected their source. This is a focused interaction audit, not exhaustive device, keyboard, screen-reader, or production testing. Manabi is a notes modal linking to an external product, not an embedded app in this audit.

Distinguish confirmed user-visible problems from source findings and hypotheses. In particular, Invitrace's unresponsive controls were observed, but the cause has not been established. Do not invent an exception based on an empty browser error log. Claims intentionally includes an earlier flawed flow; preserve that teaching example and repair the revised flow's status handling.

## Priority and implementation order

1. Invitrace: restore the advertised theme controls; this is the central demonstration.
2. Profita: remove dead-end interactions and implement a coherent sample purchase.
3. Vitae and Stellareat: make the boundary between playback and user interaction explicit.
4. Tim Hortons: protect pending edits before checkout.
5. Allianz and Claims: reconcile completed actions with queue/status displays.
6. Check keyboard operation, accessible state, and visual fit across all repaired demos.

Keep fixes bounded and reviewable by project. Existing unused demo components are not evidence of the public route's behaviour; follow the mounted components listed below.

## 1. Invitrace — high priority

File: `public/demos/invitrace-ds.html` (embedded by the Invitrace route).

### Observed

- Clicking `Teaching` left the active theme on District, including the theme label, explanation and preview.
- Clicking `No admissions` left the default patient content present.
- Repeated Teaching click and screenshot confirmed the unchanged District state.
- The separate library example did respond: Detach one + Change the master produced one frozen instance and two updated instances. The entire page is not simply noninteractive.

### Investigation and repair

Reproduce on a freshly loaded build, both standalone and inside the actual project iframe. Inspect the `THE LAB v3` initialization, `applyClient`, `paintVars`, event bindings and DOM identifiers. Check whether auto-tour or other handlers overwrite user selection. The source contains a 4.6-second auto-tour that pauses on mouse hover, which is not sufficient for keyboard/touch ownership; this is a source-level risk, not the established cause of the failed clicks.

Make explicit user input take ownership of the preview until Reset or an explicit Play action. Verify all controls, not just Teaching: Specialty, colour swatches/custom colour, radius, contrast, empty/long-name cases, New hospital and authored theme rows. Ensure each colour swatch has a name; replace the clickable contrast `div` with a keyboard-operable switch/button and expose its state.

### Acceptance

- Teaching/Specialty update selected control, explanation, token values and phone consistently.
- User-selected values remain stable after more than one former auto-tour interval, including after pointer leaves the controls.
- No admissions shows an actual coherent empty state; Default restores it.
- Keyboard can select themes and toggle contrast. Swatches have meaningful accessible names.
- Linked/detached master demonstration continues to work.

## 2. Profita — high priority

Mounted route: `src/app/projects/profita/ProfitaClient.tsx`.
Screens: `src/demos/profita/screens/`; renderer: `ProfitaPhoneScreen.tsx`.

### Observed

- In Enter an amount, selected 50,000 while the displayed payment account contains 40,000. Next still looks active, and clicking it does nothing.
- Source confirms Next and Back in `BuyAmountScreen.tsx` have no handlers. `valid` only checks the minimum amount and does not set the native disabled attribute.
- The `000` keypad branch returns before the nine-digit guard, allowing it to bypass the length limit (source-confirmed; not stress-tested in the browser).
- Financial sample values are inconsistent: Robo Advisor shows 21,248 with +42.1 (+10%); portfolio totals/individual holdings also need a shared sample-data check.
- The current page explicitly says the screens are separate examples. This is not a broken real transaction, but active-looking controls still mislead visitors.

### Repair

Connect the four primary purchase screens with local React state: chosen fund, amount, account, review and sample receipt. Keep the existing surrounding gallery and walkthrough layout. Both external step selectors and in-phone navigation must reference the same state. Use explicit callbacks rather than direct DOM mutations. Preserve a clearly marked sample transaction.

For other decorative controls, either implement the small relevant behaviour or make their presentation honestly static. Do not leave dead buttons that promise navigation. Audit Search, Sort, Back, account Change/Confirm, fund switching and receipt actions in the mounted screens.

Validate minimum, available balance and digit limits before review. Use a coherent fixture for amounts, balances, dates and returns; do not imply actual investment results.

### Acceptance

- A valid sample amount carries into review and receipt; Back retains it.
- 50,000 against 40,000 shows an understandable error and cannot advance.
- Below-minimum amounts cannot advance; disabled states are semantic, not merely grey styling.
- All keypad branches obey the same upper length limit.
- Switching external steps does not silently reset an entered amount or selected account.
- Numerical fixtures agree; disconnected supporting screens are clearly presented as such.

## 3. Vitae — high priority

Mounted component: `src/demos/vitae/Reframe/VitaeAppScreen.tsx`.
Animation: `src/demos/vitae/Reframe/useFingerBot.ts`.

### Observed and source confirmation

- Trends did not open a trends view. Mark done and Show the 4 inputs are rendered as buttons without user click handlers.
- The screen changed from 82/On track today to 88/Ring closed as the automated finger sequence progressed, independently of a real user action.
- The bot changes selected tab styling but leaves the same content visible.
- No visible pause control was present. Inputs are collapsed with max-height rather than removed from accessibility reading, and the toggle does not expose expansion state.

### Repair

Use React state for done/inputs, and make the visible controls operate it. If playback remains, make it opt-in or clearly labelled with Play/Pause/Replay; manual interaction must stop playback. Avoid a bot and React writing conflicting state to the same DOM.

The mounted case demonstrates the daily score, not a trends product. Remove inert navigation from the interactive surface or explicitly make it static; do not invent a new trends feature just to fill a tab. Keep the existing sample-data qualification. Do not invent medical scoring validity.

### Acceptance

- Mark done changes once in direct response to input; reset/replay is available.
- Inputs open and close manually with correct accessible state; hidden content is not exposed as expanded.
- No selected Trends state while the Today content remains.
- Paused/manual state is stable; reduced-motion preference is respected.

## 4. Stellareat — high priority

Mounted components: `src/demos/stellar/ui/StellarScreen1.tsx`, `StellarScreen2.tsx`, `StellarScreen3.tsx` via `CompactStories.tsx`.

### Observed

- Three independent playback screens look like an app a visitor can use.
- Paused the ingredient demo and clicked Feed me with zero selected ingredients: no response or explanation.
- Ingredient choices/search presentation are generic elements in the accessibility tree; camera, send and several other controls look actionable.
- Existing playback pause buttons work. Keep that capability.

### Repair

Choose one clear primary mode: user-operable sample flow, with optional explicit playback. Keep three-screen placement. At minimum, ingredient selection, count and Feed me must work manually with deterministic recipe fixtures; zero ingredients must give an appropriate disabled state or message. Make limited scripted responses explicit. Do not add real AI services.

Audit the home search, suggestion chips, chat send, save/add and camera/gallery affordances. Implement the small advertised actions or remove their button semantics/interactive styling when they are only illustrative. User input must not be replaced by the animation loop.

### Acceptance

- Ingredient controls are keyboard-operable and expose selected state.
- Selection count matches selected ingredients; Feed me gives a fixture result.
- Pausing stops the automated sequence without preventing manual interaction.
- Each phone is clearly an independent example unless shared state is deliberately implemented.
- No invisible click targets or unnamed navigation buttons remain in the active demo flow.

## 5. Tim Hortons — high priority for pending edits

File: `public/demos/tims-pos.html`; wrapper `src/demos/tims/TimsiPadMockup.tsx`.

### Confirmed reproduction

1. Add medium Original Blend: subtotal 2.29, total 2.59.
2. Edit, choose Oat, Update order: subtotal 2.99, total 3.38.
3. Edit again and choose XL. Preview shows 3.59 before tax; saved order remains M/2.99.
4. Without Update order, click Pay 3.38.
5. The demo announces Sent to bar for the old total. Pending edits are not resolved before checkout.

`pay()` checks only for a nonempty cart and then uses the saved total; it does not inspect `editing`/pending preview. Ordinary update and price calculation worked in the tested path.

### Repair and acceptance

Require pending edits to be updated or discarded before payment, with a clear local action. Do not silently charge the old item or auto-commit an unfinished edit. Apply the same rule to a new custom item preview. Verify cancel/update/remove/undo and multi-item quantity calculations. Fix `1 items` to `1 item`. Keep payment entirely simulated.

## 6. Allianz — medium priority

Mounted through `src/components/allianz/SubCaseInteractive.tsx`:
`ConfidenceGate.tsx`, `PromptEditor.tsx`, `BatchDispatch.tsx`.

### Confirmed

After opening CLM-0082 and choosing Send to Claims · Complex, the expanded card reports reassigned, but its row still says decide and the footer still says 2 of 5 need review. Undo is available. The footer currently conflates original threshold classification with outstanding work.

Rule selection/apply and batch processing responded in the tested path. Do not report the transient Submitting state as a failure; it completed.

### Repair and acceptance

Derive outstanding counts and row actions from resolved state. If retaining the original threshold count, label it explicitly as the initial result and separately show unresolved work. Complete both low-confidence documents, collapse/reopen, undo each: row labels, routing and counts must agree at every step. Keep these three examples independent; no requirement to build a backend or merge them into one application.

## 7. Claims — medium priority

File: `src/demos/claims/ClaimsSkeleton.tsx`.

### Confirmed

Revised flow → Convert → Marine Cargo → Continue conversion shows Conversion complete while the surrounding header still says 1 skeleton awaiting conversion. Source hardcodes that header for the revised view.

The policy chooser remains visible briefly after submit; source closes it after 700 ms. This is a timed transition, not evidence that the dialog is permanently stuck. Prevent repeated submit during this interval.

### Repair and acceptance

Use an explicit conversion status. Success should show the resulting claim/policy context and zero pending conversions, or remove the pending counter. Reset returns to exactly one pending skeleton. Cancel must preserve the draft. Ineligible policies remain disabled with reasons. Earlier flow stays intentionally flawed and labelled as the comparison baseline.

## Verification and delivery

Run focused state/validation tests where they prevent the defects above (purchase amount limits, pending POS edits, resolved counts). Do not write snapshot tests of every style or tests that merely duplicate implementation.

Run the repository's type/build checks. Existing lint warnings in legacy demos are not permission to ignore new errors. Validate the mounted routes in browser, not just individual source files. Check desktop and narrow responsive layouts, focus order, Enter/Space operation and reduced motion without changing the demo placement. Avoid treating accessibility-tree text alone as proof something is visibly displayed; confirm screenshots when visibility matters.

Report per project: fixed items, checks actually performed, and any remaining intentionally static controls. Supply before/after evidence for Invitrace controls, Profita Next, POS pending edits and queue counters. No claims of complete accessibility compliance or production readiness.
