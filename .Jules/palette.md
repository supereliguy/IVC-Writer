# Palette's Journal

## 2024-11-20 - Placeholder Text as a UX Pattern

**Learning:** Even with input masking, explicit placeholder text (e.g., `(555) 555-5555`) significantly reduces user hesitation by clarifying the expected format and content type immediately.
**Action:** Always include format-specific placeholders for inputs like phone numbers, SSNs, and vital signs, especially in high-stress data entry forms.

## 2026-02-22 - Auto-expanding Textareas

**Learning:** Fixed-height textareas in detailed narrative forms create unnecessary friction and anxiety about "hidden" content. Auto-expansion is a subtle but powerful way to encourage complete documentation.
**Action:** Use a simple JS utility to auto-expand textareas on input, respecting the initial `rows` attribute as a minimum height.

## 2026-02-24 - Unsaved Changes Protection

**Learning:** For long, data-intensive forms that exist purely client-side, the risk of accidental data loss (via refresh or tab close) is high and frustrating. Users expect a safety net.
**Action:** Implement a lightweight `beforeunload` check that tracks form dirtiness and warns users before they leave, resetting only on successful completion/download.

## 2028-03-28 - Screen Reader Accessibility for Dynamic Notifications

**Learning:** Dynamic notifications like toasts and loading spinners are visually apparent but completely invisible to screen readers unless explicitly marked up. Conversely, decorative icons within these notifications create confusing noise if read aloud.
**Action:** Always wrap dynamic notification containers with `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` to ensure they are announced, and apply `aria-hidden="true"` to decorative elements like SVG icons and spinner animations to reduce noise.
