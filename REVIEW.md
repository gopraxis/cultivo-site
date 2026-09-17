# Cultivo landing-page redesign

This preview is based on `gopraxis/cultivo-site` main at `fb74727`. It does not change the operator application, production data, or the existing calculator implementation.

## What changed

- A clearer cultivation planning promise with an interactive facility beside it.
- Solid cutaway rooms, tables, plant silhouettes, stable screen-space room labels, pointer rotation and keyboard-accessible camera buttons.
- One deterministic example: a two-day harvest delay shifts four dates and exposes a one-day dry-room overlap. The conflict survives confirmation. Reset returns the original dates.
- Earlier actual-product screenshot with an accessible native image dialog.
- Anonymous operating-history proof reuses the existing published batch, strain and ledger-row figures. No new customer attribution or ROI claim.
- Clearer value-calculator navigation and a short pilot-to-demo journey.
- The existing email-draft contact approach is stated explicitly. Preparing a request does not claim an email was sent or a meeting booked.
- Responsive phone layout, reduced-motion support, labeled controls, local fonts and no added dependencies.

## Validation

- Five Node scenario tests: original dates, delay propagation, overlap calculation, conflict persistence after confirmation, deterministic reset/date rollover.
- JavaScript syntax, HTML nesting, unique IDs, anchor and local asset checks.
- Native Safari desktop: room selection, drag rotation, reset, propose, confirm, replay, planner anchor and image dialog including Escape.
- Native Safari 390px iframe viewport: hero, model, proposal warning, request form and native required-field validation.
- The mobile review uses the real page in a sized iframe; it is not a physical iPhone or touch-gesture test.
- Email draft composition reviewed in source; no test email sent.

## Claims / limitations

The model and handoff are labeled illustrative, not a production connection. Public operating-history numbers are retained from the existing site and were not independently re-audited in this design pass. Customer proof stays anonymous. The screenshot is the existing seeded product asset, not a fabricated application UI. The calculator remains unchanged and retains its existing assumptions.

Marketing effectiveness is not established by a design score. Next validation should be a brief prospect comprehension test and measured demo-request conversion.
