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

## 2026-03-11 - Custom Focus Styles for Checkboxes and Radios
**Learning:** Without explicit Tailwind focus classes like `focus-visible:ring-2 focus-visible:ring-blue-500` applied directly on `<input type="checkbox">` and `<input type="radio">`, default browser outlines can be suppressed by generic CSS resets or Tailwind's defaults, breaking keyboard accessibility (since `@tailwindcss/forms` plugin is not used). Wait, the project doesn't use the plugin, so explicit custom focus styling is critical on raw HTML radio/checkbox inputs to make them accessible via keyboard.
**Action:** Always manually add explicit focus visibility utility classes (e.g. `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1`) to all radio and checkbox elements when building forms without custom plugins.
