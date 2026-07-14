# Draft Assistant

Draft Assistant is a private desktop-first web app for live fantasy football auction drafts. It connects to the populated Google Sheet valuation engine, lets the user search the current nomination, review sheet-calculated bid guidance, confirm the sale, and refresh budgets, squads, availability, market status and recommendations without manually editing the spreadsheet.

## Architecture

- Next.js App Router with TypeScript strict mode.
- Server-only Google Sheets access through `googleapis`.
- PIN authentication using a signed HttpOnly SameSite cookie.
- Centralised sheet ranges in `src/lib/google-sheets/config.ts`.
- Row parsing in `src/lib/google-sheets/parsers.ts`.
- Mutations and revalidation in `src/lib/google-sheets/repository.ts`.
- Presentation calculations in `src/lib/calculations/market.ts`.
- Sale validations in `src/lib/validation/sale.ts`.
- Interactive draft UI in `src/components/draft/DraftClient.tsx`.

## Local setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in all environment variables.
5. Run `npm run dev` and open `http://localhost:3000/draft`.

## Environment variables

```env
GOOGLE_SHEETS_SPREADSHEET_ID=1gVv7FbNYs3WKUbaPNQU-PcTszVL7AKu0z2SvIlnFUMQ
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
DRAFT_APP_PIN=
SESSION_SECRET=
```

`SESSION_SECRET` should be a random value of at least 32 characters. `GOOGLE_PRIVATE_KEY` may contain escaped newline characters; the app converts `\\n` to real newlines on the server.

## Google Cloud service account

1. Create or select a Google Cloud project.
2. Go to IAM & Admin → Service Accounts.
3. Create a service account for Draft Assistant.
4. Create a JSON key.
5. Copy the `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Copy the `private_key` into `GOOGLE_PRIVATE_KEY`.
7. Do not commit the JSON key or `.env.local`.

## Enable Google Sheets API

In Google Cloud, open APIs & Services → Library, search for “Google Sheets API”, and enable it for the project containing the service account.

## Share the spreadsheet

Open the draft Google Sheet and share it as **Editor** with the service account email. Without Editor access, reads may work but sale confirmation, undo, edit and strategy mode writes will fail.

## Run locally

```bash
npm run dev
```

Log in with the PIN configured in `DRAFT_APP_PIN`.

## Tests and checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Tests use mocked data and never write to the live Google Sheet.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Add all environment variables in the Vercel project settings.
4. Ensure the Google Sheet is shared with the service account email.
5. Deploy.

## Rotate credentials

1. Create a new service-account key in Google Cloud.
2. Update `GOOGLE_PRIVATE_KEY` in local and Vercel environments.
3. Redeploy Vercel.
4. Delete the old key from Google Cloud.

## Draft-night operating instructions

1. Open `/draft` and log in.
2. Search the nominated player; search begins after three characters.
3. Review the bid recommendation cards and factors.
4. Enter final sold price and winning manager.
5. Choose a locked position when prompted for multi-position players.
6. Press Confirm Sale or Ctrl/Cmd+Enter.
7. Watch the dashboard refresh automatically.
8. Use Undo Last Sale only for the most recent mistaken sale.
9. Switch strategy mode only when you want the sheet formulas recalculated for Safe, Balanced or Upside.

## Known limitations

- The Google Sheet remains the primary valuation engine; the app intentionally does not recreate every formula.
- Formula recalculation latency is handled with a short wait and retry, but very slow Google recalculation can require a manual refresh.
- The MVP uses neutral text/position treatments rather than player photos or club badges.

## Troubleshooting

- `invalid_grant`: check service-account email, private key formatting, and system time.
- `PERMISSION_DENIED`: share the sheet with the service-account email as Editor.
- `Requested entity was not found`: verify `GOOGLE_SHEETS_SPREADSHEET_ID`.
- Writes fail but reads work: confirm Editor permissions and that protected ranges allow the service account to edit Auction Log and Settings B10.
- Login always fails: verify `DRAFT_APP_PIN` is set in the active environment.
