# Draft Assistant implementation plan

1. Inspect the workbook tabs and centralise all A1 ranges/column mappings.
2. Build server-only Google Sheets access using service-account credentials and escaped private-key handling.
3. Parse Settings, Managers, Players, Dashboard and Auction Log into strict typed objects.
4. Implement authenticated route handlers for state reads, confirm sale, edit sale, undo and strategy mode.
5. Build a desktop-first `/draft` client dashboard with local autocomplete and 10-second refresh.
6. Keep spreadsheet formulas as the valuation engine; write only Auction Log rows and Settings risk mode.
7. Cover parsing, validations, calculations and a mocked end-to-end sale flow with Vitest.
