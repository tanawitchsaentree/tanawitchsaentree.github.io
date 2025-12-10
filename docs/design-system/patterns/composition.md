# Composition Pattern

## Overview

The **Composition Pattern** allows you to build flexible, context-aware UI components that adapt to different user needs without creating multiple component variants.

**Key Principle:** Use compound components (sub-components) to allow maximum flexibility while maintaining a consistent structure.

---

## What is a Compound Component?

A compound component consists of a parent component and multiple sub-components that work together.

### Example:
```tsx
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Buttons</Modal.Footer>
</Modal>
```

Instead of:
```tsx
// ❌ Too rigid
<Modal title="Title" content="Content" buttons={[...]} />
```

---

## When to Use Composition

### ✅ USE Composition When:
- Different users need different layouts
- Content structure varies significantly
- You want maximum flexibility
- Component has multiple distinct sections

### ❌ DON'T Use Composition When:
- Component is simple (like a button)
- Structure is always the same
- Props are sufficient

---

## Real-World Example

### Problem:
Different users see different modal layouts:
- **User A:** Image + 1 button
- **User B:** Title + Image + Help text + 2 buttons
- **User C:** Custom form + 3 buttons

### ❌ Bad Solution (Config-Based):
```tsx
<Modal
  config={{
    hasImage: true,
    hasTitle: true,
    hasHelpText: false,
    buttonCount: 1
  }}
/>
// Creates 100+ config combinations!
```

### ✅ Good Solution (Composition):
```tsx
// User A
<Modal>
  <Modal.Body>
    <Image src="..." />
    <RetroButton>OK</RetroButton>
  </Modal.Body>
</Modal>

// User B
<Modal>
  <Modal.Header>Confirm Action</Modal.Header>
  <Modal.Body>
    <Image src="..." />
    <Text>Are you sure?</Text>
  </Modal.Body>
  <Modal.Footer>
    <RetroButton variant="secondary">Cancel</RetroButton>
    <RetroButton>Confirm</RetroButton>
  </Modal.Footer>
</Modal>

// User C
<Modal>
  <Modal.Body>
    <CustomForm />
  </Modal.Body>
  <Modal.Footer>
    <RetroButton>Save</RetroButton>
    <RetroButton>Cancel</RetroButton>
    <RetroButton>Delete</RetroButton>
  </Modal.Footer>
</Modal>
```

**One component → Infinite variations!**

---

## Implementation Pattern

### Component Structure:
```tsx
// Modal/index.tsx
export const Modal = ({ children }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

// Sub-components
Modal.Header = ({ children }) => (
  <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);
```

---

## Design System Integration

### Document in `ui-schema.json`:
```json
{
  "Modal": {
    "type": "compound",
    "path": "src/components/ui/Modal/index.tsx",
    "pattern": "composition",
    "description": "Flexible modal with composable sub-components",
    
    "subComponents": {
      "Modal.Header": {
        "optional": true,
        "tokens": {
          "padding": "var(--space-4)",
          "borderBottom": "1px solid var(--border)"
        }
      },
      "Modal.Body": {
        "required": true,
        "tokens": {
          "padding": "var(--space-4)"
        }
      },
      "Modal.Footer": {
        "optional": true,
        "tokens": {
          "padding": "var(--space-4)",
          "gap": "var(--space-3)",
          "display": "flex",
          "justifyContent": "flex-end"
        }
      }
    },
    
    "contextVariants": {
      "simple": ["Modal.Body"],
      "standard": ["Modal.Header", "Modal.Body", "Modal.Footer"],
      "custom": "Any combination of sub-components"
    }
  }
}
```

---

## Styling with Design Tokens

All sub-components MUST use design tokens:

```css
/* ✅ CORRECT */
.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.modal-footer {
  padding: var(--space-4);
  gap: var(--space-3);
  display: flex;
  justify-content: flex-end;
}

/* ❌ WRONG */
.modal-header {
  padding: 16px;  /* Hardcoded! */
}
```

---

## Common Compound Components

### 1. Modal
**Sub-components:** Header, Body, Footer  
**Use case:** Dialogs, confirmations, forms

### 2. Card
**Sub-components:** Card.Image, Card.Title, Card.Body, Card.Footer  
**Use case:** Content containers, previews

### 3. Toast/Notification
**Sub-components:** Toast.Icon, Toast.Title, Toast.Message, Toast.Action  
**Use case:** Alerts, feedback messages

### 4. Dropdown
**Sub-components:** Dropdown.Trigger, Dropdown.Menu, Dropdown.Item  
**Use case:** Menus, selects

---

## DO/DON'T

### ❌ DON'T
- Don't create separate components for each variant
- Don't use deeply nested prop configurations
- Don't hardcode layout assumptions
- Don't forget to document sub-components in schema

### ✅ DO
- Use `children` prop for maximum flexibility
- Provide sensible default styles
- Use design tokens in all sub-components
- Document all sub-components and their tokens
- Test with different compositions

---

## Context-Aware Patterns

### Pattern: Conditional Rendering
```tsx
const Modal = ({ user }) => (
  <Modal>
    {user.isPremium && <Modal.Header>Premium Feature</Modal.Header>}
    
    <Modal.Body>
      {user.isPremium ? <PremiumContent /> : <BasicContent />}
    </Modal.Body>
    
    <Modal.Footer>
      <RetroButton>
        {user.isPremium ? "Upgrade" : "Learn More"}
      </RetroButton>
    </Modal.Footer>
  </Modal>
);
```

### Pattern: Dynamic Button Count
```tsx
const Modal = ({ actions }) => (
  <Modal>
    <Modal.Body>...</Modal.Body>
    <Modal.Footer>
      {actions.map(action => (
        <RetroButton key={action.id} onClick={action.handler}>
          {action.label}
        </RetroButton>
      ))}
    </Modal.Footer>
  </Modal>
);
```

---

## Advanced: Shared Context

For complex interactions between sub-components:

```tsx
const ModalContext = createContext();

export const Modal = ({ children, onClose }) => {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="modal-overlay">
        {children}
      </div>
    </ModalContext.Provider>
  );
};

Modal.CloseButton = () => {
  const { onClose } = useContext(ModalContext);
  return <button onClick={onClose}>×</button>;
};
```

---

## Portfolio Value

This pattern demonstrates:

1. **Advanced React Knowledge** - Compound components, context
2. **System Thinking** - Reusable, flexible architecture
3. **Scalability** - One component handles infinite variants
4. **Industry Standard** - Used by Radix UI, Headless UI, Material-UI

**This is a senior-level pattern** that shows you understand component architecture beyond basic props.

---

## Related Patterns
- [Button Pattern](buttons.md) - Simple component (no composition needed)
- [ChatBox Pattern](chatbox.md) - Uses RetroButton component

---

## Testing Checklist

When creating a compound component:
- [ ] Parent component accepts `children`
- [ ] Sub-components exported (Modal.Header, etc.)
- [ ] All sub-components use design tokens
- [ ] Documented in `ui-schema.json`
- [ ] Tested with different compositions
- [ ] Works in all 3 themes
- [ ] Context-aware behavior documented

---

## Summary

**Composition Pattern = Maximum Flexibility**

Instead of creating 100 variants, create 1 flexible component that adapts to any context.

This is the **professional standard** for building scalable design systems.
