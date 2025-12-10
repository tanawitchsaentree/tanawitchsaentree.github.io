# Button Patterns

## Primary Pattern: RetroButton

### Overview
Hard-edge button with shadow for retro/brutalist aesthetic. Transparent background with visible border and offset shadow.

### Component
- **Name:** `RetroButton`
- **Path:** `src/components/ui/RetroButton.tsx`
- **Schema:** See [ui-schema.json](../ui-schema.json) → `components.RetroButton`

---

## Styling

### Tokens Used
```json
{
  "padding": "var(--space-2) var(--space-3)",
  "fontSize": "var(--text-sm)",
  "fontFamily": "var(--font-mono)",
  "border": "2px solid var(--foreground)",
  "background": "transparent",
  "shadow": "4px 4px 0px 0px var(--foreground)"
}
```

### States
- **Default:** 4px shadow, no transform
- **Hover:** Lift (-1px x, -1px y), 5px shadow
- **Active/Press:** Push down (+2px x, +2px y), 1px shadow
- **Disabled:** 50% opacity, no interaction

---

## Spacing Rules

### Single Button
No special spacing requirements

### Button Groups
- **Container Class:** `.suggestion-buttons`
- **Gap:** `var(--space-8)` (32px)
- **Why?** 
  - 4px shadow offset requires clearance
  - Visual breathing room
  - Prevents shadow overlap

### Example
```tsx
<div className="suggestion-buttons">
  <RetroButton>Option 1</RetroButton>
  <RetroButton>Option 2</RetroButton>
  <RetroButton>Option 3</RetroButton>
</div>
```

CSS:
```css
.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);  /* 32px */
  margin-top: var(--space-3);
}
```

---

## DO/DON'T

### ❌ DON'T
- Don't use hardcoded `16px` gap
- Don't use standard HTML `<button>` tags
- Don't center button groups without context
- Don't use filled backgrounds (breaks retro aesthetic)

### ✅ DO
- Use `.suggestion-buttons` for grouping
- Use `RetroButton` component
- Keep shadow offset (4px) in mind for spacing
- Maintain transparent background

---

## Variants

### Current
- `primary` (default) - Transparent background, foreground border/shadow

### Future (Not Implemented)
- `secondary` - Alternative styling
- `ghost` - Minimal styling
- `filled` - Solid background (if needed)

---

## Implementation

### Import
```tsx
import { RetroButton } from '@/components/ui/RetroButton';
```

### Basic Usage
```tsx
<RetroButton onClick={handleClick}>
  Click Me
</RetroButton>
```

### With Props
```tsx
<RetroButton 
  onClick={handleClick}
  disabled={isLoading}
  variant="primary"
>
  Submit
</RetroButton>
```

### In a Group
```tsx
<div className="suggestion-buttons">
  {options.map((option) => (
    <RetroButton key={option.id} onClick={() => handleSelect(option)}>
      {option.label}
    </RetroButton>
  ))}
</div>
```

---

## Schema Reference
```json
{
  "components": {
    "RetroButton": {
      "type": "button",
      "path": "src/components/ui/RetroButton.tsx",
      "tokens": { "..." },
      "spacing": {
        "group": {
          "gap": "var(--space-8)",
          "reason": "Accounts for 4px shadow offset + visual breathing room"
        }
      }
    }
  }
}
```

---

## Related Patterns
- [ChatBox Pattern](chatbox.md) - Primary usage context
- [Layout Pattern](layout.md) - Overall positioning

---

## Testing Checklist
- [ ] Shadow appears correctly (4px offset)
- [ ] Hover state lifts button
- [ ] Active state presses button down
- [ ] Disabled state shows reduced opacity
- [ ] Gap between buttons is 32px in groups
- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] Tested in twilight theme
