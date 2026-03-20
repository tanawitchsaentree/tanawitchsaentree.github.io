# WorkGrid Layout Rules

Grid = 2 columns. Every entry in `work_projects.json` is either **large** (spans both cols) or **small** (spans one col).

---

## Repeating pattern

```
[=== large ===]          row 1 — full-width case study
[=== large ===]          row 2 — full-width case study
[small][small]           row 3 — two side projects / quick work
[=== large ===]          row 4 — full-width case study
[=== large ===]          row 5 — full-width case study
[small][small]           row 6 — ...and so on
```

Pattern unit = **large · large · small · small**, repeating.

---

## Size rules

| size    | grid-column | aspect  | when to use                                      |
|---------|-------------|---------|--------------------------------------------------|
| `large` | span 2      | `21/9`  | Case study with full modal (`projectId` present) |
| `small` | span 1      | `16/10` | Side project, experiment, client piece, external link |

**Smalls must come in pairs.** A lone small leaves an orphaned empty cell.
If you only have one new small, either wait for a second or promote it to large.

---

## Fields

```json
{
    "id":          unique integer (increment from last),
    "title":       "Client — Project Name",
    "type":        "Category · Category",        // shown as tags on hover
    "cover_color": "#RRGGBB",                    // brand color, used in dark theme
    "size":        "large" | "small",
    "aspect":      "21/9",                       // large only; omit for small
    "projectId":   "kebab-case-id",              // triggers modal; omit if external link
    "image":       "url/to/image-or.mp4",        // optional cover media
    "link":        "https://...",                // used when no projectId
    "position":    "center"                      // optional: objectPosition for image
}
```

---

## Adding a new project

1. Append entry at the **end** of the array
2. Assign next available `id` integer
3. If `large`: add loader to `PROJECT_LOADERS` in `ProjectModal.tsx` and create `src/data/projects/{projectId}.json`
4. If `small` and previous entry was also `small`: they will auto-pair into one row
5. If `small` and previous entry was `large`: the small sits alone — add a second small next or reconsider size
