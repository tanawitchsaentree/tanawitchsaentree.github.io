# Design System Rules

## 🚫 ABSOLUTE RULES (Never Break)

### 1. No Hardcoded Values
- ❌ **WRONG:** `padding: 16px`
- ✅ **RIGHT:** `padding: var(--space-4)`

### 2. Theme-First Development
All CSS must work in **3 themes**: `light`, `dark`, `twilight`
- Test every change in all themes
- Colors auto-swap based on theme

### 3. Token Hierarchy
```
Design Tokens → Component Schemas → Section Patterns → Implementation
```

### 4. Component Reuse
- Check [`ui-schema.json`](docs/design-system/ui-schema.json) before creating new components
- Use existing patterns from [`patterns/`](docs/design-system/patterns/)

### 5. Documentation Updates
When adding something new:
- New token → Update [`tokens.md`](docs/design-system/tokens.md)
- New component → Update [`ui-schema.json`](docs/design-system/ui-schema.json)
- New pattern → Create/update pattern file in [`patterns/`](docs/design-system/patterns/)

### 6. Composition Over Configuration
For flexible, context-aware UI:
- Use compound components for complex components (Modal.Header, Modal.Body, etc.)
- Accept `children` prop for maximum flexibility
- Provide sub-components for common patterns
- Document composition structure in [`ui-schema.json`](docs/design-system/ui-schema.json)
- See [Composition Pattern](docs/design-system/patterns/composition.md) for details

---

## 📚 Quick Reference

| Resource | Purpose |
|----------|---------|
| [Design Tokens](docs/design-system/tokens.md) | All CSS variables (spacing, colors, typography) |
| [UI Schema](docs/design-system/ui-schema.json) | Component definitions (AI-parseable) |
| [Composition Pattern](docs/design-system/patterns/composition.md) | Compound components & context-aware UI |
| [ChatBox Pattern](docs/design-system/patterns/chatbox.md) | ChatBox section rules |
| [Button Pattern](docs/design-system/patterns/buttons.md) | Button usage & spacing |
| [Layout Pattern](docs/design-system/patterns/layout.md) | Grid & container rules |
| [Typography Pattern](docs/design-system/patterns/typography.md) | Font sizes & families |

---

## 🤖 For AI Assistants

### Before Making ANY CSS Change:

1. **Read** relevant pattern file from `patterns/`
2. **Check** `ui-schema.json` for existing components
3. **Use** tokens from `tokens.md`
4. **Test** in all 3 themes (light, dark, twilight)
5. **Update** documentation if adding new patterns

### Example Workflow:

**User Request:** "Add a button to the chatbox"

**AI Actions:**
```
Step 1: Read docs/design-system/patterns/chatbox.md
Step 2: Parse docs/design-system/ui-schema.json → RetroButton component
Step 3: Apply tokens automatically from schema
Step 4: Follow spacing rules (gap: var(--space-8))
Step 5: Implement using pattern guidelines
Step 6: Test in all themes
```

### Validation Checklist:
- [ ] Used design tokens (no hardcoded values)
- [ ] Checked `ui-schema.json` for existing components
- [ ] Followed section pattern rules
- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] Tested in twilight theme
- [ ] Updated documentation if needed

---

## 🎨 Design Philosophy

**Token-Based:** Every visual property uses a CSS variable  
**Theme-Aware:** All colors swap automatically with themes  
**Modular:** Section patterns are isolated and reusable  
**AI-Friendly:** JSON schema is machine-readable

---

## 📁 File Structure

```
/
├── README.md                           ← You are here (Overall rules)
├── src/
│   ├── index.css                       ← Design tokens defined here
│   └── components/
│       └── ui/
│           └── RetroButton.tsx         ← Example component
└── docs/
    └── design-system/
        ├── tokens.md                   ← Token reference
        ├── ui-schema.json              ← Component schemas
        └── patterns/
            ├── chatbox.md              ← ChatBox rules
            ├── buttons.md              ← Button patterns
            ├── layout.md               ← Layout patterns
            └── typography.md           ← Typography patterns
```

---

## 🚀 Getting Started

1. **New to the project?** Read [`tokens.md`](docs/design-system/tokens.md) first
2. **Adding a component?** Check [`ui-schema.json`](docs/design-system/ui-schema.json)
3. **Working on a section?** Read the relevant pattern file
4. **Breaking a rule?** Don't. Seriously, don't.

---

**Remember:** This design system is a **contract**, not a suggestion.
