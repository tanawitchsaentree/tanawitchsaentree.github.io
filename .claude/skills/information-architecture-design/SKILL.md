---
name: information-architecture-design
description: Designs or audits the information architecture of complex data-heavy systems — organizing, labeling, navigating, and making searchable large volumes of structured content (patient records in a HIS/EMR, enterprise intranets, product catalogs, knowledge bases, admin dashboards with hundreds of fields). Trigger whenever the user is structuring data with many fields/categories, designing navigation or search for a data-heavy system, building a taxonomy or controlled vocabulary, organizing an EMR/HIS, or asks how to make information findable without overwhelming users. Grounded in Rosenfeld & Morville's "Information Architecture" (the Polar Bear Book), layered with current AI-augmented search practice and healthcare interoperability standards (FHIR/SNOMED CT/LOINC) where relevant.
---

# Information Architecture Design

## When this applies
Any system where users must find a specific item inside a large, growing pool of content: patient charts, admin dashboards, enterprise wikis, product catalogs, document repositories, multi-department data platforms.

## Step 0 — Map Context, Content, Users before touching any screen
- **Context**: organizational goals, constraints, and workflows the system must fit into.
- **Content**: what data exists — volume, structure, ownership, update frequency, source systems.
- **Users**: the distinct groups and their tasks. A nurse's mental model of a chart is not a coder's, and neither is IT's.

Skipping this and jumping straight to wireframes is the most common IA failure — the structure ends up reflecting whoever built it, not whoever uses it.

## Step 1 — Design the seven building blocks
| Component | Design question | Failure mode if skipped |
|---|---|---|
| Organization Systems | Hierarchy **and** facets, or hierarchy only? | Users can browse but can't filter, or vice versa |
| Labeling Systems | Is every field/category name standardized system-wide? | Same concept called three different things → invisible duplicates |
| Navigation Systems | Global / local / contextual links all explicitly defined? | Users get lost with no path back to a related item |
| Search Systems | Separate search zones per content type? | One search box returns noise for every query |
| Controlled Vocabulary | Preferred term + synonyms + broader/narrower mapped? | Search misses valid results typed in a different term |
| Metadata | Every content unit tagged with the fields facets need? | Filters silently fail because the metadata isn't there |
| IA Process | Content inventory + card sort done with real users? | Structure reflects the builder's logic, not the user's |

Full technique detail (organization schemes, navigation types, search zones, thesaurus construction, metadata types) is in `references/building-blocks.md` — read it when doing the actual design work, not just the audit.

## Step 2 — Layer in current practice
Classic IA still governs structure; AI augments it but does not replace it:
- Semantic/vector search improves recall on fuzzy queries but still needs the taxonomy underneath for filtering and browsing — complementary, not a substitute.
- AI can draft metadata tags, categories, or a first-pass taxonomy — every AI-generated term is a **draft** requiring human governance review before it enters the controlled vocabulary.
- Define ownership of category definitions and a drift-detection process before scaling any AI-assisted tagging.

Governance detail and the standards to align to (ANSI/NISO Z39.19, W3C OWL/RDF, Dublin Core) are in `references/ai-augmented-ia.md`.

## Step 3 — Domain playbook: healthcare / HIS / EMR
If the system holds patient records: map local field names to FHIR resources, and use SNOMED CT for diagnoses/findings/procedures and LOINC for lab observations rather than inventing local codes — this is now the dominant real-world controlled-vocabulary layer for clinical data. Full mapping approach and safety-critical labeling rules are in `references/healthcare-ia-playbook.md`.

## Output format
- **Auditing an existing system**: table of Component → Status (✅/⚠️/❌) → Fix, using Step 1's row set.
- **Designing new**: walk Steps 0–3 in order and produce a content inventory, a taxonomy sketch, and a navigation/search plan *before* any wireframe.

## Guardrail
Never use real patient- or customer-identifiable data for inventories, card sorting, or examples — synthetic data only. Treat any AI-generated taxonomy, sitemap, or tag set as an input to human review, never as a final deliverable.
