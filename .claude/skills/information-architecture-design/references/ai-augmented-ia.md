# AI-Augmented IA — Current Practice (2026 layer)

The Polar Bear Book predates modern semantic search and LLM tooling. This file adds what's changed in practice without discarding the underlying framework — the building blocks still hold; AI changes how some of them get built and maintained.

## What actually changed
- **Semantic/vector search**: dense retrieval (transformer embeddings) maps queries and documents into a shared vector space, retrieving on conceptual similarity rather than exact keyword match. This meaningfully improves recall on fuzzy, exploratory, or badly-worded queries.
- **AI-assisted tagging/classification**: models can auto-suggest metadata tags and categories at a volume no human team could tag manually, and can do first-pass unsupervised clustering of untagged content for an initial taxonomy draft.
- **Knowledge graphs**: AI pipelines (entity recognition, relation extraction) can populate and maintain knowledge graphs at scale, making relationships between content items explicit and queryable.
- **Dynamic/personalized navigation**: recommendation engines now adjust navigation paths and featured content per user, which creates a real structural challenge — the "same" system can present multiple different structural realities to different users simultaneously.

## What did NOT change
- **Semantic search does not eliminate the need for taxonomy.** Vector search improves recall on ambiguous queries but doesn't replace the structured category relationships that faceted filtering and browsing depend on. Treat semantic search and taxonomy as complementary layers, not alternatives — this is a common and costly misconception.
- **AI-generated site maps, tags, or taxonomy drafts are inputs, not deliverables.** They carry no embedded user research, organizational context, or governance logic. Skipping card sorting/tree testing because "the model already generated a structure" reintroduces exactly the failure mode Step 0 of the main skill exists to prevent.
- **Generative outputs carry hallucination risk in classification contexts.** An LLM asked to label or categorize content is generating probabilistically, not retrieving verified facts — errors won't look like errors, they'll look like plausible labels.

## Governance checklist before scaling AI into IA work
1. **Scope definition** — decide which components (taxonomy, metadata, navigation, search) are candidates for AI augmentation vs. human-only authorship, based on content volume and update frequency.
2. **Standards alignment** — map any classification structure against recognized standards rather than ad hoc schemas: ANSI/NISO Z39.19 for controlled vocabularies, W3C OWL/RDF for ontologies, Dublin Core for general metadata.
3. **Training/reference data audit** — for any supervised classifier, check volume, recency, labeling consistency, and domain coverage before trusting its output.
4. **Tool classification** — be explicit about which type of tool produced a given artifact (supervised classifier vs. semantic search engine vs. generative LLM vs. knowledge-graph pipeline) since each has different failure modes and different levels of trust appropriate to its output.
5. **Governance protocol** — define who has authority over category definitions, how an AI-suggested term gets reviewed before promotion into the controlled vocabulary, and how classification drift gets detected and corrected over time.

## Practical rule of thumb
Use AI to draft (tags, clusters, a first taxonomy pass, a sitemap sketch) at whatever volume is useful. Use humans — ideally the actual end users, via card sorting and tree testing — to validate before anything becomes the system of record. The faster and cheaper AI makes the draft, the more this validation step matters, not less.
