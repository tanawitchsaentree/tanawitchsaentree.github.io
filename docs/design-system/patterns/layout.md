# Layout Pattern

## Overview
Main page layout uses a grid split (Profile | Chat), stacking vertically on mobile. On mobile, a bottom nav tab bar switches between Profile, Work, and Chat views.

---

## Grid Structure

### Desktop (≥1024px)
```css
.main-content {
  display: grid;
  grid-template-columns: 2fr 3fr;  /* Profile narrower, Chat wider */
  gap: 0;
  align-items: start;
}
```

### Tablet (768px–1023px)
```css
.main-content {
  grid-template-columns: 1fr 1fr;  /* 50/50 split */
}
```

### Mobile (<768px)
Controlled via bottom tab bar — only one panel visible at a time:
- `.mobile-tab-profile` → shows profile, hides chat/work
- `.mobile-tab-work` → shows work grid, hides profile/chat
- `.mobile-tab-chat` → shows chat, hides profile/work

---

## Sections

### Profile Section (Left 50%)
- **CSS Class:** `.profile-section`
- **Alignment:** `align-items: center` (centered vertically/horizontally)
- **Max Width:** None (fills 50% of grid)
- **Padding:** `var(--space-8)` (horizontal)

**Rule:** Content is centered within its 50% column

### Chat Section (Right 50%)
- **CSS Class:** `.chat-section`
- **Alignment:** `justify-content: flex-start` (left-aligned)
- **Padding Left:** `var(--space-8)` (32px)
- **Child:** `.chatbox-container` (max 600px, left-aligned)

**Rule:** Chatbox starts from left side, not centered

---

## Container Rules

### ChatBox Container
```css
.chatbox-container {
  max-width: 600px;
  margin: 0;  /* Left-align, don't center */
}
```

### Profile Content
```css
/* No max-width constraint */
/* Centered with flex properties on parent */
```

---

## Spacing Tokens

| Element | Spacing |
|---------|---------|
| Grid gap (mobile) | `var(--space-8)` |
| Section padding | `var(--space-8)` |
| Profile header margin | `var(--space-6)` |

---

## DO/DON'T

### ❌ DON'T
- Don't use `max-width: 100%` on chatbox (prevents fixed width)
- Don't center chatbox with `margin: 0 auto`
- Don't add gap between grid columns on desktop
- Don't use fixed heights

### ✅ DO
- Keep strict 50/50 grid split (1fr 1fr)
- Left-align chatbox within right column
- Center profile content within left column
- Use `align-items: start` on grid

---

## Visual Structure

### Desktop (2fr 3fr)
```
┌────────────────────┬──────────────────────────────┐
│ .profile-section   │ .chat-section                │
│ (Centered, 2fr)    │ (Left-aligned, 3fr)          │
│                    │                              │
│   ┌──────────┐     │  ┌───────────────────┐      │
│   │ Profile  │     │  │ .chatbox-container│      │
│   │ Content  │     │  │ max-width: 600px  │      │
│   └──────────┘     │  └───────────────────┘      │
└────────────────────┴──────────────────────────────┘
```

### Mobile (tab-switched)
```
┌──────────────────────────┐
│  Active tab panel only   │
│  (profile / work / chat) │
└──────────────────────────┘
┌──────────────────────────┐
│  Bottom nav bar          │
│  [Profile] [Work] [Chat] │
└──────────────────────────┘
```

---

## Related Patterns
- [ChatBox Pattern](chatbox.md) - Chat section details
- [Typography Pattern](typography.md) - Text sizing/spacing

---

## Files
- `src/index.css` - `.main-content`, `.chat-section`, `.profile-section`
- `src/App.tsx` - Main layout component
- `src/pages/index.tsx` - Profile section content

---

## Testing Checklist
- [ ] Desktop shows 50/50 split
- [ ] Mobile stacks vertically
- [ ] Profile content is centered in left column
- [ ] Chatbox is left-aligned in right column
- [ ] No layout shift when typing
- [ ] Tested at various screen widths
