# Stellareat — Case Study Brief

## Role
Product Designer, January-June 2024, Remote (Vermont team)

## What Stellareat is
AI-powered culinary platform. Users generate recipes, customize them, follow guided cooking with accessibility features, share results to community.

## Why this case belongs in Tanawitch's portfolio
- Demonstrates AI design skill (LLM-driven personalization)
- Counter-balances Allianz (B2B enterprise) and Invitrace (B2B healthcare) with B2C consumer
- Shows distributed team operations (remote design workflow at scale)
- Shows conversational UX work (AI chat for recipe customization)

## Portfolio positioning angle
NOT just "I designed an AI recipe app."
This case is about: AI that starts from where the user already is — not a blank search bar.

The interesting design decisions:
1. **Entry problem** — how do you let the AI understand a user's actual starting point (fridge, equipment, energy, mood) without making them fill out a form?
2. **Cook mode accessibility** — voice + large touch targets + simplified state during cooking
3. **Recipe ownership** — AI generates, user customizes, community rates. Whose recipe is it?

## Thesis (LOCKED)
Current working thesis, locked for Section 1:
> "Dietary preferences are not a settings page."

**NOTE — thesis may need to evolve.** The hero demo is now about *entry*, not customization.
See "Thesis alternatives" section below.

### Thesis alternatives (choose one before writing Section 1 final copy)

**A.** "The AI doesn't need you to know what you want. It starts with what you have."
— Strongest if Demo 1 leads. Positions AI as context-reader, not search engine.
Trade-off: slightly passive ("what you have" implies constraint rather than agency).

**B.** "A fridge full of ingredients is a question. This AI answers it."
— Most memorable. Specific, concrete, Niemann-wit energy.
Trade-off: sounds like a product tagline, not a design thesis. Works as hero text, not argument.

**C.** "Every entry point is a different user. The AI should know the difference."
— Best if you want to argue for the multi-mode design (nutrition-led, ingredient-led, mood-led).
Trade-off: slightly abstract. Requires the demos to do the explaining.

Current thesis "Dietary preferences are not a settings page" still works for the **customization** section (Demo 2 / Demo 3 territory). If we pick A or B as the hero thesis, keep the current thesis for the customization section.

## Key design decisions to surface in case study
1. **Entry without a search bar** — multiple AI entry modes, none of which look like a form
2. **Cook mode accessibility** — voice + large touch targets + simplified state during cooking
3. **Recipe ownership** — AI generates, user customizes, community rates. Whose recipe is it?
4. **Conversational UX standards** — when does AI talk back, when does it stay silent

## What this case study is NOT
- ❌ Not a product showcase ("look at all these screens")
- ❌ Not a "we used AI" brag
- ❌ Not a process recap (no journey maps, personas)
- ❌ NOT THE SAME UI AS THE ACTUAL APP — the case study UI must be a fresh design that conveys the concepts, not screenshots of the product
- ✅ It's about specific AI design decisions that transfer to other domains
- ✅ It has interactive demos that let visitor FEEL the design decisions

---

## Visual direction — LOCKED

### Palette — Warm Watercolor Paper
```
Background    #FFF8E7   warm watercolor paper
Surface       #FFFFFF   pure white (for glass panels)
Text primary  #1F1B16   warm dark
Text muted    #7A7060   medium warm
Accent 1      #D64545   tomato red
Accent 2      #E8B53A   mustard yellow
Accent 3      #87A96B   sage green
Accent 4      #6FA8DC   sky blue
Border        #E8DFC8   warm hairline
```
Multiple accents are allowed in Stellareat — food is sensory, the palette earns its color.
Never mix these into the main portfolio palette.

### Glass panel treatment (from pc_frosted_overlay pattern)
```css
backdrop-filter: blur(24px);
background: rgba(255, 255, 255, 0.7);
border: 1px solid rgba(255, 255, 255, 0.5);
border-radius: 20px;
```
Panels float over illustration backgrounds. Without a visual background, glass panels look broken.
Background behind every panel must be the watercolor illustration layer.

### This is the ONLY project with illustration + bright color
Copy to include in case study body:
> "This is the only project in this portfolio that uses bright color and illustration. Food is sensory.
> AI in cooking should feel inviting, not editorial. The aesthetic decision is the design decision."

### Illustration style — Christoph Niemann editorial watercolor
**Why Niemann:**
- Bold flat watercolor with conceptual wit
- Modern editorial sensibility (New Yorker, Sunday Sketches)
- "Minimal but smart" composition
- NOT cute baby-book illustration
- NOT realistic botanical
- NOT AI-generated-looking flat vector

**Illustration rules:**
- Each fridge item / kitchen tool = single object on transparent background
- Flat washes with watercolor texture visible
- Limited palette per object (3–4 colors max)
- One conceptual element per illustration when possible (Niemann signature)
- Hand-drawn outlines acceptable but optional
- ❌ NO faces on objects — do not anthropomorphize food
- ❌ NO sparkle / star / glow effects
- ❌ NO gradient meshes that look AI-generated

**Illustration sourcing:**
Cannot license Niemann originals (copyright). Options:
1. Commission a Niemann-style illustrator (ideal, out of scope for case study)
2. Use SVG watercolor techniques — CSS blur + filter stacking to approximate flat washes
3. AI-generate with extremely specific prompts (see prompts below)

**AI image generation prompts for Niemann-style illustration:**
These avoid generic-cute and target editorial watercolor specifically.

```
Prompt 1 — Chicken thigh:
"Single raw chicken thigh, watercolor editorial illustration, New Yorker magazine style,
flat bold color washes, warm terracotta and cream tones, minimal background,
no cartoon face, no sparkles, Christoph Niemann compositional simplicity,
white background, visible watercolor texture and paper grain"

Prompt 2 — Preserved lemon:
"Halved preserved lemon, editorial watercolor illustration, flat color wash technique,
bright yellow with brown-edged rind, minimal composition, one conceptual detail,
white background, New Yorker spot illustration energy, no decoration or borders"

Prompt 3 — Cast iron pan:
"Black cast iron skillet, overhead view, editorial watercolor,
flat dark grey washes, visible pan texture, minimal composition,
no sparkles, Christoph Niemann aesthetic, white background,
bold form reduction, one defining detail only"
```

### Typography — Stellareat exception
- Display: **PP Editorial New Italic** (regular weight, not ultralight) — feels handwritten cookbook
- Body: PP Neue Montreal (same as portfolio)
- Recipe ingredient text: Cormorant Garamond 300 italic — cookbook recipe tertiary serif
- ❌ Do NOT change portfolio-level font settings — this is per-case-study art direction only

---

## Interactive demo requirements — UPDATED STRUCTURE

### Demo 1 — "From your fridge, not from a search bar" ← HERO DEMO
**Position:** Visitor lands on this first. This IS the case study argument made interactive.

4-step entry flow, fully interactive:

**Step 1 — Fridge state**
User selects items they have. Watercolor illustrated items in a grid.
Tap/click to toggle selected. Selected items get a subtle glass card treatment, border accent.
Items: chicken, eggs, lemon, garlic, butter, spinach, onion, tomatoes, bell pepper, milk, cheese, leftover rice.
NOT a checklist. NOT a form. The items ARE the affordance.

**Step 2 — Kitchen equipment**
Same interaction pattern, different items.
Items: oven, stovetop, microwave, air fryer, cast iron, pot, wok.
Illustrated as tools — same Niemann watercolor style.

**Step 3 — Preferences**
Three visual card groups:
- Nutrition focus: High protein / Balanced / Low carb / No restriction
- Cuisine mood: Thai / Western / Asian fusion / Surprise me
- Meal type: Quick (15 min) / Hearty / Fancy / Leftover-friendly
NOT radio buttons. Cards with illustrated accent or typographic emphasis.

**Step 4 — AI reasoning + recipes**
Three recipe results. Above them: editorial paragraph, not a chat bubble.
Format: "You have [X, Y, Z]. Your oven can handle a roast. You picked high protein + Thai.
I made these three calls." Then 3 recipe cards.
User picks one to see detail.

**Step progress metaphor:**
NOT: 1 → 2 → 3 → 4 circles
USE: Breadcrumb text row — "Fridge → Equipment → Preferences → Recipes" with current step underlined

**Persistent CTA:** "Read full case study" link always visible, top-right corner of demo.

**Anti-patterns:**
- ❌ Cute round blobs with faces
- ❌ Generic fridge icon (must be watercolor illustration or SVG-approximated)
- ❌ Numbered circle steps
- ❌ "Generate Recipe!" buttons with sparkles
- ❌ Chat bubble AI summary

### Demo 2 — "Cook mode shift" ← DEMOTED TO SECOND DEMO
Full spec preserved. Brown Butter Roast Chicken Thighs, 7 steps.
Sub-step re-segmentation for Steps 2 and 4.
6-stage FLIP transition choreography.
Visual treatment: same Silt palette? OR adapt to Stellareat warm watercolor palette?
**Decision pending** — verify after Demo 1 is built.

#### Demo 2 — Cook Mode Shift transition spec (unchanged)

6 stages, total duration 1200ms forward / ~840ms reverse (30% faster).

**Stage 1 — 0–200ms**
Step counter `2 / 7` appears as small anchor label.
`opacity 0 → 1`, `cubic-bezier(0.65, 0, 0.35, 1)`

**Stage 2 — 200–600ms**
Ingredient list exits left.
`translateX(0 → -30px)` + `opacity 1 → 0`, `cubic-bezier(0.65, 0, 0.35, 1)`

**Stage 3 — 300–700ms** *(overlaps Stage 2)*
Method preview exits right.
`translateX(0 → +30px)` + `opacity 1 → 0`, `cubic-bezier(0.65, 0, 0.35, 1)`

**Stage 4 — 500–900ms**
Recipe header exits upward and shrinks.
`translateY(0 → -20px)` + `scale(1 → 0.95)` + `opacity 1 → 0`, `cubic-bezier(0.65, 0, 0.35, 1)`

**Stage 5 — 700–1100ms** ← THE moment
Active step text animates from list position to center stage via FLIP.
`font-size ~16px → clamp(48px, 8vw, 96px)`, easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

**Stage 6 — 1100–1200ms**
Step counter settles below step text.
`translateY(-8px → 0)` + `opacity 0 → 1`, `cubic-bezier(0.65, 0, 0.35, 1)`

**Sub-step re-segmentation:**
- Step 2 → 2.1 "Heat oil until it shimmers." / 2.2 "Lay chicken skin-side down." / 2.3 "Don't move it. 8 minutes."
- Step 4 → 4.1 "Flip chicken." / 4.2 "Add garlic, thyme, preserved lemon rind." / 4.3 "Spoon brown butter over the top."
- Steps 1, 3, 5, 6, 7 stay as single actions.
Counter format: "2.1 / 7" — denominator always total step count.

**Reduced motion:** Cross-fade only, 300ms, opacity transitions only. No audio cues.

### Demo 3 — "Community ownership" ← UNCHANGED
One AI recipe, multiple cooks made it differently.
User flips through cooks' modifications shown as diff against base recipe.
NOT a review list. NOT star ratings.

---

## Trade-offs surfacing (closing section)
- Transferable principles (3–5) from this work to other AI products
- What's still unresolved: community incentive design, low-vision testing gap, food safety responsibility

## Voice rules
Reference: .claude/skills/voice-guide.md
Banned: passionate, delightful, seamless, leveraged, empower, stakeholder, bridge, holistic, robust, scalable solution

---

## File structure
Content: `content/projects/stellareat.mdx`
Interactive demos: `src/demos/stellareat/`
Static mockup for review: `design-system/stellareat-mockup.html`
