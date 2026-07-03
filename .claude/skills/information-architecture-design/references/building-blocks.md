# IA Building Blocks — Detailed Technique

Read this when actually doing design work (not just a quick audit). Each section gives the sub-decisions the summary table glosses over.

## 1. Organization Systems
**Schemes** (how items are grouped):
- Exact schemes (alphabetical, chronological, geographical) — low ambiguity, good when users know exactly what they're looking for.
- Ambiguous schemes (topic, task, audience, metaphor) — higher value but require user research to get right; this is where most systems get it wrong by guessing.
- Hybrid schemes almost always beat a single pure scheme in real systems — expect to combine at least two.

**Structures** (how groups relate to each other):
- Hierarchy — the default; works when one clear parent-child logic exists (most systems need this as the backbone).
- Database/relational model (facets) — layer on top of hierarchy when items have multiple independent attributes (date, type, status, owner) that users need to filter by simultaneously.
- Hypertext — non-linear associative links; use to connect related items that don't share a hierarchy position (e.g., a lab result linked to the medication that may explain it).

Design rule: pick one primary hierarchy for orientation, then add facets for filtering. Don't try to make the hierarchy itself carry every possible cut of the data.

## 2. Labeling Systems
- **Textual labels** (menu items, headings, field names) must be consistent system-wide — the single most common IA failure is the same concept carrying two different names in two different modules.
- **Iconic labels** need a text fallback until an icon's meaning is proven understood without one.
- **Indexing/tagging labels** should draw from the controlled vocabulary (below), not be typed freely per-record.
- Contextual link labels should describe the destination, not the mechanism ("View lab history" not "Click here").

## 3. Navigation Systems
- **Global navigation**: present everywhere, gets users from any point to any major section.
- **Local navigation**: options within the current section only.
- **Contextual navigation**: links embedded in content connecting related items across sections — this is what lets a user jump from an abnormal result to its likely cause without a full search.
- **Supplemental navigation**: sitemaps, indexes, guides, wizards — needed once the system is too large for global+local alone to keep people oriented.

## 4. Search Systems
Not every system needs search — for a small, well-organized structure, browsing alone can be better and cheaper to build. When search is needed:
- **Search zones**: define subsets of content searched together (e.g., "this patient's labs only" vs "this patient's entire record") — a single index over everything produces noisy results.
- **Retrieval approach**: exact/pattern matching for known-item lookup (drug names, IDs); concept-based/semantic retrieval for fuzzy or exploratory queries. Most real systems need both (hybrid retrieval).
- **Best bets / pinned results**: for high-stakes or high-frequency queries, hand-curate the top result rather than trusting ranking alone.
- Presentation: show why a result matched (matched term, snippet, metadata) so users can judge relevance without opening every item.

## 5. Controlled Vocabulary / Thesaurus
Three relationship types to define deliberately (this is what separates a real controlled vocabulary from a list of tags):
- **Equivalence**: preferred term + synonym ring (e.g., "myocardial infarction" ⇄ "heart attack" ⇄ local abbreviations all resolve to one preferred term).
- **Hierarchical**: broader/narrower terms (lets a search for the broader term surface narrower matches too).
- **Associative**: related-but-not-hierarchical terms (surfaces useful neighbors a strict hierarchy would miss).

Construction should follow a recognized standard (ANSI/NISO Z39.19 for monolingual controlled vocabularies) rather than being invented ad hoc per project — this is what keeps the vocabulary maintainable as it grows past a few dozen terms.

## 6. Metadata
Types to assign deliberately, not as an afterthought:
- **Descriptive**: what the content is (title, subject, author/source).
- **Administrative**: rights, provenance, version, retention.
- **Structural**: how content units relate/sequence (e.g., which encounter a lab result belongs to).

Every facet or filter the UI will ever offer depends on metadata existing on the content *before* the UI is built — retrofitting metadata after launch is far more expensive than defining it during the content inventory.

## 7. IA Process
Minimum sequence for a system of real complexity:
1. Content inventory — catalog what actually exists, not what the spec says should exist.
2. User research (interviews, contextual inquiry) — capture real tasks and vocabulary.
3. Card sorting with real users — derive groupings from their mental model, not the design team's.
4. Draft organization/labeling/navigation/search systems from steps 1–3.
5. Tree testing / first-click testing on the draft structure before full visual design.
6. Document the structure (blueprints, controlled vocabulary, metadata schema) so it survives team turnover.

Skipping step 3 and going straight from inventory to wireframe is the most common shortcut that produces a technically-organized but practically unfindable system.
