# Input Patterns

## Overview
Hover and focus states for input fields following design system tokens.

---

## Chatbox Input Pattern

### Component
- **Context:** ChatBox component input field
- **Class:** `.chatbox-input`
- **File:** `src/index.css`

### Styling

#### Base State
```css
.chatbox-input {
  background: transparent;
  border: none;
  outline: none;
  padding: var(--space-2) 0;
  transition: all 0.2s ease;
}
```

#### Hover & Focus States
```css
.chatbox-input:hover,
.chatbox-input:focus {
  background: var(--muted);
  border-radius: var(--radius);
  padding: var(--space-2) var(--space-3);
}
```

### Tokens Used
| Token | Value | Usage |
|-------|-------|-------|
| `--muted` | Light grey | Hover/focus background |
| `--radius` | 10px | Corner radius |
| `--space-2` | 8px | Vertical padding |
| `--space-3` | 12px | Horizontal padding (hover) |

### Interaction States
- **Default:** Transparent background, no radius, minimal padding
- **Hover:** Light grey background, rounded corners, increased horizontal padding
- **Focus:** Same as hover (maintains visual feedback while typing)
- **Transition:** 0.2s ease for smooth state changes

---

## Design Rationale

### Why Muted Background?
- Subtle visual feedback without being distracting
- Works across all themes (light, dark, twilight)
- Follows existing muted color token usage

### Why Increase Padding on Hover?
- Creates visual breathing room
- Makes the interactive area more obvious
- Smooth transition prevents jarring layout shift

### Why 10px Radius?
- Uses design system default `--radius` token
- Softer than chatbox container (12px) but still cohesive
- Matches other subtle UI elements

---

## DO/DON'T

### ❌ DON'T
- Don't use hardcoded colors like `#ececf0`
- Don't use instant transitions (always include timing)
- Don't change font size or weight on hover
- Don't add borders (keep minimal aesthetic)

### ✅ DO
- Use `var(--muted)` for hover background
- Use `var(--radius)` for corner radius
- Include `transition: all 0.2s ease` on base state
- Maintain same styling for hover AND focus

---

## Related Patterns
- [Button Patterns](buttons.md) - Hover state reference
- [ChatBox Pattern](chatbox.md) - Component context
- [Design Tokens](../tokens.md) - Token reference

---

## Testing Checklist
- [ ] Hover shows light grey background smoothly
- [ ] Focus maintains same styling as hover
- [ ] 10px corner radius is visible
- [ ] Transition is smooth (0.2s)
- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] Tested in twilight theme
- [ ] Typing still functions normally
