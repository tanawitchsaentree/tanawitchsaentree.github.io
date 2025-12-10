# ChatBox Pattern

## Overview
The ChatBox is the main chat interface section, positioned on the right side of the layout (50% grid cell).

---

## Layout Rules

### Container
- **CSS Class:** `.chatbox-container`
- **Max Width:** `600px` (fixed, prevents expansion)
- **Alignment:** Left-aligned (`margin: 0`, not centered)
- **Positioning:** Within `.chat-section` which uses `justify-content: flex-start`

### Spacing
- **Left Padding (section):** `var(--space-8)` (32px)
- **Message Gap:** `var(--space-3)` (12px)
- **Suggestion Margin Top:** `var(--space-3)` (12px)

---

## Component Usage

### Suggestion Buttons
- **Component:** `RetroButton` (see [ui-schema.json](../ui-schema.json))
- **Container:** `.suggestion-buttons` class
- **Gap Between Buttons:** `var(--space-8)` (32px)
  - **Why?** Accounts for 4px shadow offset + visual breathing room

### Button Group Pattern
```tsx
<div className="suggestion-buttons">
  {suggestions.map((suggestion) => (
    <RetroButton key={suggestion.id} onClick={handler}>
      {suggestion.label}
    </RetroButton>
  ))}
</div>
```

---

## DO/DON'T

### ❌ DON'T
- Don't center the chatbox container (`margin: 0 auto`)
- Don't use hardcoded spacing between buttons
- Don't let chatbox expand beyond 600px
- Don't use standard HTML buttons for suggestions

### ✅ DO
- Left-align chatbox to match Lumo avatar position
- Use `.suggestion-buttons` class for button groups
- Maintain 600px max-width for consistency
- Use `RetroButton` component for all suggestion buttons

---

## Schema Reference
- **Component:** `RetroButton` in [ui-schema.json](../ui-schema.json)
- **Container:** `SuggestionGroup` in [ui-schema.json](../ui-schema.json)
- **Section:** `ChatBox` in [ui-schema.json](../ui-schema.json)

---

## Related Files
- `src/components/ChatBox.tsx` - Main component
- `src/components/ui/RetroButton.tsx` - Button component
- `src/index.css` - `.chatbox-container`, `.suggestion-buttons` styles

---

## Visual Structure
```
┌─────────────────────────────────┐
│ .chat-section                   │
│  padding-left: var(--space-8)   │
│                                 │
│  ┌──────────────────────────┐  │
│  │ .chatbox-container       │  │
│  │ max-width: 600px         │  │
│  │ margin: 0 (left-aligned) │  │
│  │                          │  │
│  │  [Bot Message]           │  │
│  │  gap: var(--space-3)     │  │
│  │                          │  │
│  │  .suggestion-buttons     │  │
│  │  ┌──────┐ ┌──────┐      │  │
│  │  │ Btn1 │ │ Btn2 │      │  │
│  │  └──────┘ └──────┘      │  │
│  │  gap: var(--space-8)     │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

---

## Testing Checklist
- [ ] Chatbox stays at 600px max-width
- [ ] Chatbox is left-aligned (not centered)
- [ ] Buttons use `.suggestion-buttons` class
- [ ] Gap between buttons is 32px
- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] Tested in twilight theme
