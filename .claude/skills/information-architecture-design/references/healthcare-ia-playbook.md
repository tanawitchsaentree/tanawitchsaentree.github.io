# Healthcare IA Playbook — HIS/EMR

Applies the building blocks and the AI-governance layer specifically to systems holding clinical data. Use alongside, not instead of, the other two reference files.

## Don't invent local codes — map to the standards that already won
The "controlled vocabulary" building block has a concrete real-world answer in healthcare, and it's largely already decided:
- **FHIR (HL7 FHIR)** is now the dominant interoperability standard for structuring and exchanging clinical data — think of a FHIR Resource (Patient, Observation, Condition, MedicationRequest, DiagnosticReport, etc.) as the IA "content chunk" unit for a clinical system.
- **SNOMED CT** is the controlled vocabulary for diagnoses, clinical findings, and procedures.
- **LOINC** is the controlled vocabulary for lab tests and other clinical observations/measurements.
- **ICD-10** remains the standard for diagnosis coding used in billing/reporting alongside the above.

Practical implication for the organization-system design question: when a hospital has legacy systems each using their own local lab/drug names, the fix isn't a bigger local glossary — it's mapping every local term to its SNOMED CT / LOINC preferred term so search, filtering, and any future interoperability work all resolve to the same concept regardless of which department or legacy system originated the record.

## Organization system for a patient chart
- **Primary hierarchy**: Patient → Encounter/Visit → Content type (Labs / Meds / Imaging / Notes / Vitals). This is the backbone users orient by.
- **Facets layered on top** (non-negotiable for a system with "thousands of fields"): date range, ordering department, result status (pending/final/amended), abnormal-flag, content type. Facets are what let a clinician answer "show me everything abnormal from the last 48 hours" without scrolling the full hierarchy.
- Do not try to solve this with hierarchy alone — a deep enough hierarchy to represent every useful cut of patient data becomes unnavigable; that's precisely the "hierarchy-only" failure mode in the main skill's Step 1 table.

## Navigation
- **Global**: the chart's main tabs (Overview / Labs / Medications / Imaging / Notes).
- **Contextual**: this is the highest-value navigation type in a clinical system — a link from an abnormal lab result directly to a medication that could explain it, or from a diagnosis to the relevant recent procedures, saves exactly the lookup time that matters in urgent situations.
- **Supplemental**: a chart-wide search plus a timeline/summary view function as the "sitemap" and "guide" equivalents for a patient record.

## Search zones for a clinical system
At minimum, separate: (1) search within the current patient's record only, (2) search a specific content type only (e.g., labs only), (3) search across the patient's entire history. A single unscoped search box over a patient with years of records returns too much noise to be safe to rely on in time-pressured situations — this is a patient-safety issue, not just a UX preference.

## Labeling rules that are safety-critical here (not just style)
- One preferred display name per concept, enforced system-wide — never let "CBC," "Complete Blood Count," and a free-typed local variant coexist as separate-looking entries for the same test.
- Units and normal ranges must display with every lab value; never rely on the label alone to convey what a number means.
- Status labels (pending/final/amended/corrected) must be visually distinct — a corrected result silently looking identical to the original is a known source of clinical error.

## Guardrail specific to this domain
Never use real, identifiable patient data for content inventories, card sorting sessions, taxonomy examples, or test data of any kind — use synthetic patients throughout. This applies with extra force when any AI tool (including this one) is involved in the design process.
