# Design Tokens Reference

All design tokens are defined in `src/index.css` within the `:root`, `.dark`, and `.twilight` selectors.

---

## Spacing Scale (8px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Micro spacing (tight gaps) |
| `--space-2` | `8px` | XS spacing (button padding) |
| `--space-3` | `12px` | Small spacing (message gaps) |
| `--space-4` | `16px` | Base spacing (standard padding) |
| `--space-5` | `20px` | Medium spacing |
| `--space-6` | `24px` | Large spacing (section padding) |
| `--space-8` | `32px` | XL spacing (button groups, layout gaps) |
| `--space-10` | `40px` | 2XL spacing |
| `--space-12` | `48px` | 3XL spacing |
| `--space-16` | `64px` | 4XL spacing |

### Usage Guidelines:
- **Micro elements:** `--space-1`, `--space-2`
- **Standard padding:** `--space-3`, `--space-4`
- **Section gaps:** `--space-6`, `--space-8`
- **Large spacing:** `--space-10`+

---

## Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--text-sm` | `10px` | Metadata, button text |
| `--text-base` | `12px` | Body text, labels |
| `--text-lg` | `16px` | Headings, name, email |

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Courier Prime', monospace` | Body text |
| `--font-mono` | `'Courier Prime', monospace` | Code, UI elements |

---

## Color Tokens

### Surface Colors
| Token | Light | Dark | Twilight | Usage |
|-------|-------|------|----------|-------|
| `--background` | `#FEFCFB` | `oklch(0.145 0 0)` | `#FFE8D6` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `#362B24` | Text color |

### Brand Colors
| Token | Light | Dark | Twilight | Usage |
|-------|-------|------|----------|-------|
| `--primary` | `#030213` | `oklch(0.985 0 0)` | `#FF8C42` | Primary brand color |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `#ffffff` | Text on primary |

### Secondary Colors
| Token | Light | Dark | Twilight | Usage |
|-------|-------|------|----------|-------|
| `--secondary` | `oklch(0.95 0.0058 264.53)` | `oklch(0.269 0 0)` | `#FAD4A7` | Secondary surfaces |
| `--secondary-foreground` | `#030213` | `oklch(0.985 0 0)` | `#362B24` | Text on secondary |

### Utility Colors
| Token | Light | Dark | Twilight | Usage |
|-------|-------|------|----------|-------|
| `--muted` | `#ececf0` | `oklch(0.269 0 0)` | `#FAD4A7` | De-emphasized content |
| `--muted-foreground` | `#717182` | `oklch(0.708 0 0)` | `#665B55` | Muted text |
| `--border` | `rgba(0, 0, 0, 0.1)` | `oklch(0.269 0 0)` | `rgba(0, 0, 0, 0.1)` | Dividers, borders |
| `--destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` | `#d4183d` | Errors, warnings |

---

## Other Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.625rem` (10px) | Default border radius |

---

## Usage Examples

### Spacing
```css
/* ✅ CORRECT */
padding: var(--space-4);
gap: var(--space-8);
margin-top: var(--space-3);

/* ❌ WRONG */
padding: 16px;
gap: 32px;
margin-top: 12px;
```

### Typography
```css
/* ✅ CORRECT */
font-size: var(--text-sm);
font-family: var(--font-mono);

/* ❌ WRONG */
font-size: 10px;
font-family: 'Courier Prime';
```

### Colors
```css
/* ✅ CORRECT */
background: var(--background);
color: var(--foreground);
border: 2px solid var(--primary);

/* ❌ WRONG */
background: #FEFCFB;
color: #030213;
border: 2px solid black;
```

---

## Theme Switching

Themes are controlled by the class on the `<html>` element:
- **Light:** No class (default)
- **Dark:** `.dark` class
- **Twilight:** `.twilight` class

All color tokens automatically swap based on the theme. **Never hardcode theme-specific colors.**

---

## Adding New Tokens

1. Add to `:root` in `src/index.css`
2. Add to `.dark` theme
3. Add to `.twilight` theme
4. Document here in alphabetical order
5. Update `ui-schema.json` if it's a component token
