# IVC-Writer Roadmap

## Guiding Principle: HIPAA Compliance

Every feature must maintain **100% client-side processing**. No patient data (PHI) may be transmitted, stored externally, or persisted in localStorage beyond the active session unless the user explicitly opts in and the data is non-identifying.

**Rules for all phases:**

- No network calls containing PHI — ever
- localStorage may store: examiner info, facility info, county, certification type, UI preferences
- localStorage must NOT store: patient names, DOB, SSN, diagnoses, findings, or any encounter-specific data (unless auto-save draft with safeguards — see Phase 2)
- Any feature that exports PHI to a file must show a warning that the file contains protected health information
- Clipboard parsing must be ephemeral — fill fields in memory, never cache parsed PHI

---

## Phase 1: Core Workflow Improvements

_Goal: Reduce clicks and prevent errors on every single encounter._

### 1.1 Clear Form / New Patient Button

- Add a "New Patient" button that resets all patient-specific fields
- Preserve remembered fields (examiner, facility, county, certification, notary)
- Prompt for confirmation if form has unsaved changes (use existing `isFormDirty` flag)
- Place button prominently in each tab's header area

### 1.2 Form Validation Before PDF Generation

- Define required fields: respondent name, DOB, exam date, findings, disposition
- On generate, check for empty required fields before creating PDFs
- Highlight empty fields with red border and scroll to first error
- Show summary toast: "3 required fields are empty — generate anyway?"
- Allow override (clinicians sometimes legitimately leave fields blank)

### 1.3 County Auto-Save

- Add county dropdown to the `local-save` system
- On page load, restore the last-selected county
- Trivial implementation — add `local-save` class to county `<select>` elements

### 1.4 Smart BP Parsing

- Accept `120/80`, `120 80`, `120-80` formats in the BP input
- Normalize to `systolic/diastolic` for trigger calculation
- Update `checkBpTriggers()` to parse all three formats

### 1.5 Keyboard Shortcuts

- `Ctrl+Enter` — Generate PDF(s) for the active tab
- `Ctrl+Shift+N` — New Patient (clear form)
- `Escape` — Close any open modal/toast
- Show shortcut hints in button tooltips
- Register via a single `keydown` listener on `document`

---

## Phase 2: Efficiency Features

_Goal: Cut encounter documentation time in half for power users._

### 2.1 Datalist Autocomplete

- Add `<datalist>` elements for:
  - **Diagnoses**: Schizophrenia, Schizoaffective Disorder, Bipolar I, Bipolar II, MDD, Psychosis NOS, Brief Psychotic Disorder, PTSD, Anxiety Disorder
  - **Medications**: Haloperidol, Lorazepam, Olanzapine, Risperidone, Quetiapine, Lithium, Valproic Acid, Aripiprazole, Ziprasidone, Diphenhydramine
  - **Allergies**: NKDA, Penicillin, Sulfa, Codeine, Morphine, Latex, Iodine, Aspirin
  - **Petitioner relationship**: Physician, Psychiatrist, Psychologist, Social Worker, Nurse, Law Enforcement, Family Member, Other
- All lists are static — no PHI, no network calls

### 2.2 Auto-Save Draft with Recovery

- Periodically save the entire form state to `localStorage` key `ivc-draft-{tabId}`
- **Safeguards:**
  - Exclude SSN from auto-save
  - Auto-purge draft on successful PDF generation or "New Patient" click
  - TTL: auto-expire drafts after 4 hours (check on page load)
  - On page load, if a draft exists, show a dismissible banner: "Unsaved encounter found — Restore or Discard?"
  - Discard permanently deletes the draft
- **HIPAA note**: This stores PHI in localStorage temporarily. Include a settings toggle to disable auto-save entirely. Default: enabled.

### 2.3 Tab Sync for Shared Fields

- Add a "Copy from Unified" button in the AOC-only and DMH-only tabs
- One-click copies all overlapping fields (respondent info, petitioner, exam details) from the Unified tab into the current tab
- Does not auto-sync — requires explicit user action to avoid confusion

### 2.4 Encounter Timer

- Display elapsed time since exam date/time was entered
- Show as a small, non-intrusive badge near the exam time field
- Useful for tracking evaluation windows and statutory time limits
- Pure UI — no data storage

### 2.5 Narrative Word Count

- Show a live character/word count below the findings textarea
- Format: "247 words / 1,523 characters"
- Update on input events — uses existing auto-resize listener

---

## Phase 3: Advanced UX

_Goal: Professional-grade UX that matches clinician workflows._

### 3.1 Inline PDF Preview

- After PDF generation, render a preview using a blob URL in a modal `<iframe>`
- Buttons: "Download" and "Close"
- Replaces the current auto-download behavior
- Falls back to direct download if iframe rendering fails

### 3.2 Facesheet Clipboard Parser

- "Paste from Facesheet" button in the Respondent section
- Reads from `navigator.clipboard.readText()`
- Parses common facesheet formats using regex:
  - Name (First Last or Last, First)
  - DOB (MM/DD/YYYY, YYYY-MM-DD)
  - SSN (XXX-XX-XXXX)
  - MRN / Account number
  - Address (street, city, state, zip)
  - Phone
- Fills matched fields, leaves unmatched fields empty
- Shows a confirmation: "Parsed 8 of 12 fields — review and correct"
- **HIPAA**: Clipboard data is parsed in-memory only, never persisted

### 3.3 Saved Facility Profiles

- Allow users to save multiple facility profiles to localStorage:
  - Facility name, street, city, state, zip, phone
- Dropdown to select a saved profile, auto-fills all facility fields
- Add/edit/delete profiles from a simple modal
- **HIPAA**: Facility info is not PHI — safe to persist

### 3.4 Encounter Templates (Non-PHI)

- Save reusable templates containing **only non-PHI fields**:
  - Narrative snippet selections
  - Common disposition choices
  - Standard findings boilerplate text
  - Default commitment criteria patterns
- Template names like "Standard MI Evaluation", "SA Evaluation", "Geriatric Eval"
- **Enforced**: Template save function explicitly skips all respondent/patient fields

### 3.5 Field-Level Error Messages

- Replace toast-only validation with inline error text below fields
- Red text: "Required", "Invalid format (expected XXX-XX-XXXX)", etc.
- Errors clear when the field is corrected
- Complements Phase 1 validation — more granular feedback

---

## Phase 4: Reliability and Offline

_Goal: Ensure the app works anywhere, including facilities with poor connectivity._

### 4.1 Service Worker for Offline Use

- Cache strategy: cache-first for app shell, PDF templates, and CDN assets
- On first load, pre-cache all critical resources
- Show an "Available Offline" indicator after caching completes
- Update strategy: check for new versions on load, prompt user to refresh

### 4.2 Bundle CDN Dependencies Locally

- Download and vendor: Tailwind CSS, pdf-lib, FileSaver.js
- Serve from local files instead of CDN
- Eliminates external network dependency entirely
- Pairs with service worker for true offline operation

### 4.3 Export/Import Encounter JSON

- "Export Encounter" button saves all form fields as a JSON file
- "Import Encounter" button loads a JSON file and fills the form
- **HIPAA safeguards:**
  - Show a prominent warning before export: "This file contains Protected Health Information. Handle according to your facility's PHI policy."
  - File is saved to user's local device only
  - No cloud upload, no sharing mechanism
- Useful for: corrections, audits, transferring between devices via secure means

### 4.4 Input Format Validation

- Zip code: 5 digits or 9 digits (XXXXX or XXXXX-XXXX)
- Phone: 10 digits (formatted as (XXX) XXX-XXXX)
- SSN: 9 digits (formatted as XXX-XX-XXXX)
- DL State: convert to US state dropdown
- Validate on blur, show inline warnings for malformed input

---

## Phase 5: Polish

_Goal: Accessibility, print support, and final refinements._

### 5.1 Accessibility Audit

- Add `aria-live="polite"` to toast notification container
- Ensure all form controls have associated `<label>` elements
- Test tab order matches visual flow
- Add skip-to-content link
- Verify color contrast ratios meet WCAG 2.1 AA in both light and dark themes
- Test with screen reader (NVDA/VoiceOver)

### 5.2 Print-Friendly CSS

- Add `@media print` stylesheet
- Hide navigation, buttons, theme toggle, and non-essential UI
- Format form fields for readable printed output
- Serves as a backup if PDF generation fails

### 5.3 Undo/Redo for Narrative Snippets

- Track snippet toggle actions in a stack
- Ctrl+Z reverts the last snippet insertion/removal in the findings textarea
- Integrates with browser-native undo where possible

### 5.4 Popout Narrative Builder

- Button to open the narrative snippet builder in a `window.open()` popup
- Communicates with the main form via `postMessage`
- Useful for dual-monitor setups in clinical workstations
- Falls back to inline builder if popups are blocked

---

## Explicitly Rejected Ideas

| Idea | Reason |
|---|---|
| Recent encounters list (storing patient names/dates) | Stores PHI in localStorage with no clinical need. Risk outweighs convenience. |
| Cloud sync / multi-device sync | Requires server-side infrastructure and PHI transmission. Violates core architecture. |
| Analytics or usage tracking | No external calls. No telemetry. |
| AI-powered narrative generation | Would require API calls with PHI. Not compatible with client-side-only constraint. |

---

## Implementation Priority Summary

| Phase | Items | Effort | Impact |
|---|---|---|---|
| **Phase 1** | Clear Form, Validation, County Save, BP Parsing, Shortcuts | Small | High — every encounter benefits |
| **Phase 2** | Datalist, Auto-Save Draft, Tab Sync, Timer, Word Count | Medium | High — power users save significant time |
| **Phase 3** | PDF Preview, Facesheet Parser, Facility Profiles, Templates, Field Errors | Medium-Large | Medium — advanced workflow optimization |
| **Phase 4** | Service Worker, Bundle CDN, Export/Import JSON, Input Validation | Medium | Medium — reliability and edge cases |
| **Phase 5** | Accessibility, Print CSS, Undo/Redo, Popout Builder | Small-Medium | Lower — polish and compliance |
