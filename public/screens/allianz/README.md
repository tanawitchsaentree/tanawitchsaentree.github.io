# Allianz Screenshot Anonymization Checklist

Drop real screens here. File names map to MDX content:

| File | Replaces |
|---|---|
| `doc-classification-1.png` | screen-doc-classification.svg (main) |
| `doc-classification-2.png` | optional iteration shot |
| `prompt-management-1.png` | screen-prompt-management.svg (main) |
| `prompt-management-2.png` | optional iteration shot |
| `fallback-states-1.png` | screen-fallback-states.svg (main) |
| `fallback-states-2.png` | optional iteration shot |

## Before placing any screen here, verify:

- [ ] No client names, claim numbers, or policy numbers visible
- [ ] All customer PII blurred or replaced (names, emails, phones, addresses)
- [ ] No internal employee names visible
- [ ] Amounts replaced with rounded examples (e.g. 50,000 EUR not 47,829.34)
- [ ] No internal URLs or system IDs visible
- [ ] No confidential watermarks
- [ ] Approved for portfolio use per Allianz IP policy

When files are ready, update the SCREENS map in:
`src/components/universe/SubCase.tsx` and `src/app/projects/allianz/page.tsx`
