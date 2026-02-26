# CLAUDE.md - NC IVC Form Writer

## Project Overview

Client-side HIPAA-compliant web app for generating NC involuntary commitment forms (AOC-SP-300 and DMH-5-72-19). All processing happens in-browser using pdf-lib. No server, no PHI transmission.

## Tech Stack

- Vanilla JavaScript (no framework)
- Tailwind CSS v3 (CDN)
- pdf-lib v1.17.1 (PDF generation)
- FileSaver.js v2.0.0 (download)

## Architecture

- `index.html` - Complete UI with three tab-based form sections (Unified, AOC-only, DMH-only)
- `scripts.js` - All application logic: form data collection, PDF generation, localStorage, auto-formatting
- `AOC-SP-300.pdf` / `DMH-5-72-19.pdf` - PDF templates loaded and filled via pdf-lib
- `FORM_SCHEMA` object maps form fields to HTML element IDs with type info
- `formCache` pre-resolves DOM elements at init to avoid repeated lookups during collection

## Key Design Decisions

- **Privacy first**: 100% client-side, no analytics, no external calls beyond CDN assets
- **localStorage for "Remember Me"**: Saves petitioner info, examiner/facility details, certification type, and notary info
- **Three parallel form sections**: Unified (generates both PDFs), AOC-only, DMH-only - each with prefixed IDs (`unified-`, `aoc-`, `dmh-`)

## Development Commands

```bash
# Check JS syntax
node -c scripts.js

# Format code
npx prettier --write .
```

## Current Auto-Fill Features (Implemented)

- Auto-calculate age from DOB
- Auto-check vital sign trigger checkboxes from entered HR/RR/Temp/BP values
- Auto-check age trigger when age < 12 or > 65
- Default all state fields to "NC"
- SSN auto-formatting (XXX-XX-XXXX)
- Phone number auto-formatting ((XXX) XXX-XXXX)
- Date/time fields default to current date/time
- "Copy from Respondent" address buttons on LRP, Petitioner, and Witness sections
- localStorage persistence for petitioner info, examiner, facility, certification, notary
- Parallel PDF generation via Promise.all for unified form

## Future Optimization Ideas

### High Impact - Minimize User Input

1. **County auto-fill from localStorage**: Save and restore the selected county dropdown since examiners typically work in one county. Add it to the `local-save` system or the saved radio groups pattern.

2. **Saved facility profiles**: Allow users to save multiple facility profiles (name, address, phone) in localStorage and select from a dropdown. Useful for examiners who work at multiple facilities but want one-click selection.

3. **Respondent name parsing**: When the user types a full name, auto-split into first/last if the PDF fields ever require it. Currently the PDF uses a single name field so this isn't needed yet.

4. **Datalist autocomplete for common values**: Add `<datalist>` elements for frequently entered values like:
   - Impression/Diagnosis (common psychiatric diagnoses: "Schizophrenia", "Bipolar Disorder", "Major Depressive Disorder", etc.)
   - Medications (common psychiatric medications)
   - Allergies ("NKDA", "Penicillin", etc.)
   - Petitioner relationship ("Physician", "Psychiatrist", "Social Worker", "Law Enforcement", etc.)

5. **Smart BP parsing**: Currently BP trigger checks for `systolic/diastolic` format. Could also accept formats like `120 80` or `120-80` and normalize to `120/80`.

6. **Exam location from localStorage**: The exam location field already has `local-save` but a dropdown of recently used locations could speed up entry when an examiner works across multiple sites.

7. **Quick-fill respondent from clipboard**: A "Paste from facesheet" button that parses structured text (name, DOB, SSN, address) from a copied patient facesheet. Would require careful regex parsing but could fill 10+ fields in one action.

### Medium Impact - UX Improvements

8. **Form validation before generation**: Warn on empty critical fields (respondent name, DOB, findings, disposition) before generating PDFs. Currently generates silently with blank fields.

9. **Tab-sync for shared fields**: When using the AOC-only or DMH-only tabs, provide an option to sync data from the Unified tab or between tabs. Currently each tab is independent.

10. **Clear form button**: Add a "Clear All" or "New Patient" button that resets all fields except remembered ones. Currently requires page refresh.

11. **PDF preview**: Show a preview of the generated PDF in-browser before downloading, so users can verify before saving.

12. **Keyboard shortcuts**: Add shortcuts like Ctrl+Enter to generate PDFs, or Ctrl+S to save current data.

### Lower Impact - Technical

13. **Bundle CDN dependencies**: Currently loads Tailwind, pdf-lib, and FileSaver from CDNs. Bundling locally would improve offline capability and load reliability.

14. **Service Worker for offline use**: Add a service worker to cache the app shell and PDF templates for fully offline operation.

15. **Respondent DL state dropdown**: Convert the free-text DL state field to a dropdown of US state abbreviations for consistency.

16. **Zip code validation**: Validate zip codes are 5 or 9 digits (XXXXX or XXXXX-XXXX format).
