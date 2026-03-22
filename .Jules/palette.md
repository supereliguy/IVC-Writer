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

## 2026-03-05 - Screen Reader Accessibility for Dynamic Notifications
**Learning:** Visual-only indicators for dynamic events, like toast notifications and loading spinners, are inaccessible to screen reader users. Without ARIA live regions, users relying on assistive technologies are unaware of these important updates.
**Action:** Always use `aria-live="polite"` (and `aria-atomic="true"` when appropriate) on notification containers to ensure they are announced by screen readers without interrupting the user's current task. Add `role="status"` to loading indicators, and explicitly hide decorative loading animations with `aria-hidden="true"`.
