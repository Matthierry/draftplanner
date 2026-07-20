# Draft Assistant — Google Apps Script web app

Draft Assistant is a desktop-first companion for a live fantasy-football auction draft. It runs as a **Google Apps Script web app bound to the existing Google Sheet**: the spreadsheet remains the valuation engine and source of truth, and no Google Cloud project, service account, private key, external Google Sheets API, Vercel deployment, or server route is required.

## Project files

- `Code.gs` — sheet reads, validation, locked mutations, and web-app entry point.
- `Index.html` — application shell.
- `Styles.html` — dark desktop interface styles.
- `JavaScript.html` — browser UI and `google.script.run` calls.
- `appsscript.json` — Apps Script manifest and spreadsheet scopes.

## Preserved sheet ranges and mappings

The app deliberately preserves the workbook's formulas and historical data. It reads these existing ranges, using the same zero-based column mappings as the previous implementation:

| Sheet | Range | Purpose |
| --- | --- | --- |
| Settings | `Settings!A1:S30` | season, strategy mode (`B10`), squad rules and position limits |
| Managers | `Managers!A3:R15` | budgets, squad spaces, legal bids and position counts |
| Players | `Players!A3:AL923` | player availability and bid recommendations |
| Dashboard | `Dashboard!A1:K15` | draft progress and market state |
| Auction Log | `Auction Log!A2:K300` | sale history; writes begin on row 3 |

The Auction Log columns remain: pick, player ID, player name, locked position, team, sold price, winning manager, expected value, value difference, market status, and notes.

## Deploy

1. Open the existing Google Sheet.
2. Select **Extensions → Apps Script**.
3. Replace/add the project files with `Code.gs`, `Index.html`, `Styles.html`, `JavaScript.html`, and `appsscript.json` from this repository, then save.
4. In the editor, select and run `authorizeDraftAssistant` once. Complete Google's authorisation prompts.
5. Select **Deploy → New deployment → Web app**.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Only myself**. Choose **Anyone with the link** only if your Sheet access policy permits it (or add your own PIN gate before doing so).
8. Deploy and open the web-app URL during the draft.

For an unbound standalone Apps Script project, set a Script Property named `SPREADSHEET_ID` to the spreadsheet ID first. A bound script needs no configuration.

## Draft-night workflow

1. Search an available player (three or more characters).
2. Review Opening, Good, Fair, Stretch, Do Not Exceed, and Live Max bid guidance from the Players sheet.
3. Enter the winning manager, sold price, any required locked position, and optional note.
4. Select **Confirm sale**. The app locks the sheet, re-reads state, validates availability, budget, squad spaces, minimum feasibility and position maximums, then writes one Auction Log row.
5. The UI re-reads the workbook after each write so formula-driven budgets, availability and recommendations are shown again.
6. Use **Undo last sale** only for the newest Auction Log entry. Use **Edit last sale** to correct that row when necessary.

The Strategy selector writes only `Settings!B10`; it never replaces spreadsheet formulas. The app never clears or changes historical rows except when explicitly undoing the last sale or editing that same selected sale.

## Operating notes

- Apps Script runs under the deploying user's Google account, so that user must be able to edit `Auction Log` and `Settings!B10` (and any protected ranges involved).
- `LockService.getDocumentLock()` serializes sale, undo, edit, and strategy writes to prevent duplicate confirmations from multiple browser tabs.
- The browser refreshes state every 20 seconds and can be refreshed manually.
- Formula recalculation can take a moment after a write; the app flushes and waits briefly before its required re-read.
