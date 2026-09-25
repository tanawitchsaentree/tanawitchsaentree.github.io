# Portfolio narrative rewrite

## Scope

Planning and copy direction, requested 25 September 2026. Rewrite one project at a time, starting with Profita. This document is an editorial plan, not evidence of project outcomes. Profita implementation completed in the local site. The draft below records the editorial direction; the current page is the canonical copy.

The existing screen implementations are the starting point for describing the interface. A reconstructed screen is not evidence that a feature shipped, that a user said something, or that a result was measured.

## Editorial approach

- Keep the portfolio in English. Use natural, connected sentences and familiar verbs.
- Give readers a quick answer to what the product does, what I worked on, and what the examples show.
- Put an explanation beside the relevant screen. Explain each point once.
- Use headings that help readers find information. Avoid slogans, dramatic revelations, invented dialogue, and universal lessons.
- Make the reading experience pleasant through clarity, reasonable length, and useful details. Do not manufacture delight, confidence, or success in the story.
- Describe observable behavior directly. Distinguish a design intention from a measured result.
- Preserve domain terms when they carry a specific meaning. Explain them where needed instead of claiming all jargon disappeared.
- Do not add generic apologies or repeated disclaimers. Place a short reconstruction note beside the first example and relevant qualifications beside the claim.
- Remove unsupported figures and outcomes from the public story. Track evidence questions privately.
- Keep research quotations only when a source supports the wording. Do not turn composites into verbatim quotations.
- Avoid mechanically applying the same problem / revelation / trade-off / victory template to every project.

## Project sequence and direction

| Order | Project | Story to develop | Boundary |
| --- | --- | --- | --- |
| 1 | Profita | Browsing funds, checking details, placing an order, and following a portfolio | Do not describe a goals-first onboarding flow that these screens do not show. |
| 2 | Allianz | Reviewing AI classifications, editing prompts, and handling unresolved documents | Establish the actual publish behavior before describing an approval process. |
| 3 | Invitrace | Reusing a hospital interface while allowing specific theme and layout differences | Separate UI adaptation from hospital onboarding; scope accessibility claims. |
| 4 | Stellar | Exploring meal ideas using ingredients and preferences | Clearly identify prototype status; separate stated interest from observed usage. |
| 5 | Claims | Using working prototypes to review claims workflows with a team | Define what was delivered and what engineering still needed to complete. |
| 6 | Tims | A former employee's POS concept for common orders and changes | Describe remembered scenarios as scenarios; do not imply recruited participants. |
| 7 | Vitae | Establish which product and screens belong together, then explain the score or nutrition workflow | Resolve the watch-score / food-tracking mismatch before writing a single narrative. |
| 8 | Manabi | Helping parents build a school shortlist and understand matching criteria | Explain data coverage and criteria without implying demonstrated adoption. |

## Profita: proposed reading path

Target: approximately 350–450 words of case-study prose, excluding screen UI and credits. This is an editorial budget, not a measured reduction yet.

1. Product, contribution, and year.
2. Three ways into the app: browse, Robo Advisor, portfolio.
3. A five-screen purchase example, with one short explanation per screen.
4. Related account and order screens.
5. Brief project credit and separately dated recognition.

Remove the standalone Problem and Tension essays, their hidden modals, the repeated decision cards, and the closing motivational reflection. Their supported context can fit into the introduction and screen captions.

Remove the standalone typography/color section from the main story: the presentation's fonts and palette do not establish the original product's design-system work. Do not describe them as such.

Keep the product screens. Avoid repeating the same screen in a hero collage, an animated decision collage, and the purchase walkthrough. The purchase walkthrough must be readable without a long forced-scroll sequence; select steps directly or display them in normal document flow.

### Draft: introduction

**Profita**

**Browsing and buying mutual funds**

I worked on Profita at Robowealth in 2020 as a Senior UX/UI Designer. The app brings fund browsing, Robo Advisor plans, and portfolio information together for LH Bank customers. This case study focuses on the screens for finding a fund, reviewing its details, and placing an order.

Role: Senior UX/UI Designer  
Company: Robowealth  
Client: LH Bank  
Year: 2020

Presentation note: Screens recreated for this portfolio, with sample data.

### Draft: app overview

**Finding your way around**

The app has separate areas for browsing funds, viewing Robo Advisor plans, and checking a portfolio. Customers can move between these from the bottom navigation.

- **Browse funds.** The home feed brings together fund highlights, recommendations, and an entry to Robo Advisor. The fund list provides categories for further browsing.
- **View plans.** Robo Advisor groups investments into plans, such as retirement or travel, and shows each plan's current value.
- **Check a portfolio.** The portfolio screen shows total value, gains and losses, and a breakdown of holdings.

### Draft: purchase walkthrough

**From browsing to an order**

This example follows a direct fund purchase. Each screen gives the customer another part of the information needed before confirming.

1. **Browse the home feed.** Fund cards show the fund name, category, and past return. Customers can open the fund list to see more options.
2. **Choose a fund.** Browse the list by category, then open a fund for more detail.
3. **Review the details.** Check performance, risk, fees, and trading information before choosing to buy.
4. **Enter an amount.** Set the purchase amount and check the account used to pay for it.
5. **Check the order.** Review the fund, amount, and payment details before confirming.

Implementation check: confirm each noun against the selected screen during editing. Do not introduce tooltips, comparisons, a monthly slider, projections, or personalized filtering unless they are actually present in that example.

### Draft: related screens

**Orders and accounts**

The supporting screens cover an order receipt, switching funds, viewing savings, and choosing a payment account.

- **Order received.** A receipt shows the submitted order and its processing status.
- **Switch funds.** Enter the amount to switch in baht or units.
- **Savings account.** View the balance and transaction history.
- **Payment account.** Choose the account for the purchase.

### Draft: closing credit

**Project notes**

My contribution was in 2020. Profita continued to develop after that. In 2023, LH Bank received Highly Commended for Best App for Customer Experience at the Retail Banker International Asia Trailblazer Awards.

Link: Award organizer's report, page 14.

Do not present the later recognition as evidence of a particular 2020 design decision's effect.

## Profita: screen text pass

Audit all visible labels, empty states, tooltips, captions, accessible names, navigation, metadata, and project-card summaries. Useful existing domain labels can remain; rewriting every label for novelty would reduce clarity.

Priority fixes:

- Replace the conflicting receipt message `completed successfully. (pending)` with `Order received` and `Pending processing` if the example represents a submitted order awaiting processing. Check the receipt's other labels for the same status.
- Standardize `Robo Advisor`, `Senior UX/UI Designer`, currency notation, account terminology, capitalization, and punctuation.
- Use full navigation labels where the screen has room; check fit before replacing abbreviations.
- Check trading cutoff times across the fund details and confirmation. Do not invent an authoritative time to resolve a mismatch.
- Correct grammar and spacing without altering financial meaning or historical product facts.
- Remove references to a five-minute result, zero jargon, emotional safety, every edge case covered, and any unsupported research scene.
- Sync homepage summary and route metadata with the new story.
- Retire obsolete alternative narrative files or clearly mark them as non-public drafts so a future edit does not restore contradictory copy.

## Review before completing this project

- Trace every case-study claim to a visible example or a supplied factual source.
- Compare the final text with each selected screen, including disclosure and status wording.
- Verify that hidden panels no longer contain the old narrative.
- Count case-study prose separately from UI labels to confirm the reading budget.
- Check desktop and mobile wrapping, spacing, and walkthrough navigation when browser access permits. Record any blocked checks explicitly.
- Run the repository build and relevant static checks after implementation.

Move to Allianz only after the Profita rewrite is coherent as a whole. Do not propagate a fresh template across all projects before reviewing the first result.

## Profita implementation notes

The active route now uses a compact page with selectable purchase examples. The old ProfitaHero/Problem/Tension/Decisions/Flow/System/ScreenGallery/Reflection components and content/universes/profita essays are legacy material, not used by the route. Do not reintroduce their claims or treat them as research evidence. Current text lives in src/app/projects/profita/ProfitaClient.tsx.

The examples retain sample fund data and are explicitly described as separate recreated screens with edited interface text. The receipt now distinguishes an order received from one processed. The conflicting cutoff in the confirmation example was replaced with a prompt to check the fund cutoff rather than inventing a historical deadline.

## Opening paragraphs: contribution and usefulness

User direction: the first passage must show what I contributed and what it lets the team, company, or customer do. Write this as a connected account, not a resume bullet or numerical impact claim. Show scope through decisions and collaboration. Do not imply adoption or measured benefit for a concept.

Applied to all eight project openings, including the access screens for Allianz and Invitrace, all Invitrace audience variants, and the homepage summaries. Profita now starts with the purchase flow as a shared product-team artifact. Tims remains explicitly a personal concept. The remaining projects still need their full narrative rewrites in the sequence above.

## Allianz implementation

The page now follows three operator/configurator tasks. The contribution and design rationale are visible beside each example rather than hidden in an accordion. Removed the repeated principles essay and the diagram vault from this reading path; the old diagram assets remain in the repository, outside this page.

Rewrote all three active MDX sources. The prompt description now matches the sample's apply-on-submit behavior without claiming it proves the production approval process. Removed invented reviewer dialogue, approval outcomes, and operational impact assertions. The batch description now matches its actual aggregate view; it does not promise document-level actions that are absent from that example.

Unresolved factual question for a future evidence pass: establish the production approval workflow from a primary project record. The current public copy only describes the behavior of the recreation.

Validation: production build completed for all routes after the opening and Allianz changes. Exported text checks confirm the new openings and removal of the old Allianz claims from the rendered page. Visual/browser interaction checks remain unverified because browser access is restricted.

## Completed compact narrative pass

All eight public project stories have been rewritten or shortened. Allianz now has one short rationale per demo. Invitrace uses one reading path, retains its interactive theme and component examples, and no longer presents unsupported headline metrics or accessibility guarantees. Profita keeps its screen-based purchase story. Stellar shows its three ingredient/recipe examples without composite research quotations or claimed usage outcomes. Claims focuses on a working policy-selection example and distinguishes prototype review from production readiness. Tims keeps the terminal and frames remembered scenarios as a personal exercise. Vitae now uses the baseline-score example only; the unrelated food-tracking screens are no longer part of the route. Manabi's modal has been shortened to matching and published-data notes.

The compact route components are canonical public copy. Legacy narrative components remain unmounted for reference; their old assertions must not be restored. Shared layout styles keep body copy at a readable system-font size, while existing product examples retain their interface styling.

Validation includes production build, exported-text checks, standalone Invitrace JavaScript syntax, and presence of DOM elements referenced by its interactions. Visual rendering and live browser interaction remain unverified under the current browser restriction.

Final checks: all public route exports passed copy assertions; Invitrace script syntax and referenced elements passed; final production build passed with existing repository warnings. The existing localhost:3000 preview returned HTTP 200 and contains the latest shortened Allianz text.
