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

## 2026-03-01 - Add explicit focus styles to checkboxes and radios
**Learning:** In a Tailwind project without `@tailwindcss/forms`, custom-styled checkboxes and radio buttons lose their default browser focus rings. The lack of visual focus indication renders keyboard navigation completely inaccessible for these form controls.
**Action:** When styling forms manually or omitting the forms plugin, always ensure explicit focus utility classes (e.g., `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`) are applied to `<input type="checkbox">` and `<input type="radio">` elements, either via HTML or globally via JavaScript, to preserve keyboard accessibility.
