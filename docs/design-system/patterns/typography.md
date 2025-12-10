# Typography Pattern

## Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Courier Prime', monospace` | Body text, paragraphs |
| `--font-mono` | `'Courier Prime', monospace` | UI elements, code, buttons |

**Note:** Both tokens use the same font for consistent monospace aesthetic.

---

## Size Scale

| Token | Value | Usage | Examples |
|-------|-------|-------|----------|
| `--text-sm` | `10px` | Metadata, small UI | Button labels, timestamps |
| `--text-base` | `12px` | Body text, labels | Paragraphs, chat messages, form labels |
| `--text-lg` | `16px` | Headings, emphasis | Name, email, section titles |

---

## Usage Rules

### Hierarchy
```
Heading (--text-lg) 16px
    ↓
Body (--text-base) 12px
    ↓
Metadata (--text-sm) 10px
```

### DO/DON'T

#### ❌ DON'T
- Don't use hardcoded font sizes (`font-size: 12px`)
- Don't use custom fonts outside the design system
- Don't create new size tokens without documenting
- Don't use px values directly

#### ✅ DO
- Use `var(--text-*)` tokens
- Maintain 3-tier hierarchy
- Use `var(--font-mono)` for UI elements
- Document any new size tokens

---

## Examples

### Headings
```css
.heading {
  font-size: var(--text-lg);
  font-family: var(--font-sans);
}
```

### Body Text
```css
.paragraph {
  font-size: var(--text-base);
  font-family: var(--font-sans);
  line-height: 1.5;
}
```

### Buttons
```css
.button {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  font-weight: bold;
  text-transform: uppercase;
}
```

### Metadata
```css
.timestamp {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}
```

---

## Component Examples

### RetroButton
```tsx
<RetroButton>
  {/* Uses --text-sm internally */}
  Click Me
</RetroButton>
```

### Chat Message
```tsx
<div style={{
  fontSize: 'var(--text-base)',  // 12px
  fontFamily: 'var(--font-sans)'
}}>
  Message content here
</div>
```

### Profile Name
```tsx
<h1 style={{
  fontSize: 'var(--text-lg)',  // 16px
  fontFamily: 'var(--font-sans)'
}}>
  Tanawitch Saentree
</h1>
```

---

## Line Height

### Standard
- Body text: `1.5`
- Headings: `1.2` - `1.3`
- UI elements: `1`

### Usage
```css
.body-text {
  line-height: 1.5;
}

.heading {
  line-height: 1.2;
}

.button-text {
  line-height: 1;
}
```

---

## Font Weights

Available weights for Courier Prime:
- `400` - Regular
- `700` - Bold

### Usage
```css
.normal {
  font-weight: 400;
}

.bold {
  font-weight: 700;
}
```

---

## Related Patterns
- [Button Pattern](buttons.md) - Uses `--text-sm` for labels
- [ChatBox Pattern](chatbox.md) - Uses `--text-base` for messages

---

## Testing Checklist
- [ ] All text uses design tokens
- [ ] Font sizes are consistent across components
- [ ] Line heights are appropriate
- [ ] Hierarchy is visually clear
- [ ] Tested in all themes
