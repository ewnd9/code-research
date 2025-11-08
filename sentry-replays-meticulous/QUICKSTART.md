# Quick Start Guide

## Prerequisites

1. A Sentry account with Session Replay enabled
2. Node.js 18+ installed
3. Access to create Sentry auth tokens

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Sentry Credentials

**Auth Token:**
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Give it a name (e.g., "Replay Testing")
4. Select scope: `org:read` (minimum) or `org:write`
5. Click "Create Token"
6. Copy the token (you'll only see it once!)

**Organization Slug:**
1. Go to your Sentry dashboard
2. Look at the URL: `https://sentry.io/organizations/{your-org-slug}/`
3. Copy the org slug from the URL

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
SENTRY_AUTH_TOKEN=sntrys_your_token_here
SENTRY_ORG_SLUG=your-org-name
```

Or export directly:

```bash
export SENTRY_AUTH_TOKEN='sntrys_your_token_here'
export SENTRY_ORG_SLUG='your-org-name'
```

## Usage

### Fetch Replays

```bash
npm run client
```

This will:
- Connect to Sentry API
- Fetch replays from the last 7 days
- Display replay metadata (browser, duration, errors)
- Show detailed info for the first replay

### Analyze Replays

```bash
npm run analyzer
```

This demonstrates:
- Parsing replay data
- Extracting user actions and errors
- Generating Playwright test scripts
- Coverage analysis

### Run Complete Example

```bash
npm run example
```

This runs the full workflow:
1. ✓ Connect to Sentry
2. ✓ Fetch replays with errors
3. ✓ Analyze sessions
4. ✓ Calculate coverage
5. ✓ Select best sessions for testing
6. ✓ Generate Playwright tests
7. ✓ Export to `./generated-tests/`

## Understanding the Output

### Generated Test Files

After running `example.py`, you'll find:

```
generated-tests/
├── replay-abc12345.spec.ts    # Playwright test
├── replay-def67890.spec.ts    # Another test
├── ...
└── test-summary.json           # Metadata about all tests
```

### Test Summary

`test-summary.json` contains:
- Generation timestamp
- Total tests created
- Coverage statistics
- Details for each test (duration, errors, actions)

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('replay-abc12345', async ({ page }) => {
  // Original session duration: 45000ms
  // URL: https://example.com/app

  await page.goto('https://example.com/app');

  // User actions would go here
  // (Currently placeholders - need event parsing)

  // Take final screenshot for comparison
  await page.screenshot({ path: 'screenshots/replay-abc12345.png' });
});
```

## Next Steps

### To Run Generated Tests

1. Playwright is already installed as a dev dependency

2. Run tests:
   ```bash
   npm test
   # or
   npx playwright test generated-tests/
   ```

3. View report:
   ```bash
   npx playwright show-report
   ```

### To Enhance the Tests

Current tests are scaffolds. To make them fully functional:

1. **Parse Replay Events**: Extract actual user actions from Sentry's rrweb data
2. **Add Network Mocking**: Mock API calls for deterministic tests
3. **Visual Assertions**: Compare screenshots against baselines
4. **Add Waits**: Proper element waiting and state verification

See `FINDINGS.md` for detailed implementation roadmap.

## Troubleshooting

### "Error: auth_token required"

- Make sure you've set `SENTRY_AUTH_TOKEN` environment variable
- Check that your token is valid (not expired)
- Verify you copied the full token (starts with `sntrys_`)

### "Error: organization_slug required"

- Set `SENTRY_ORG_SLUG` to your Sentry organization name
- Check the URL in Sentry dashboard to confirm slug

### "No replays found"

- Verify Session Replay is enabled in your Sentry project
- Try increasing time range: `stats_period='30d'`
- Remove error filter to see all replays (not just errors)
- Check that your project has actual user traffic

### "403 Forbidden"

- Ensure your auth token has the right scopes (`org:read` minimum)
- Verify you're using the correct organization slug
- Check token hasn't been revoked

### "Rate Limited"

- Sentry API has rate limits (check headers for details)
- Add delays between requests if fetching many replays
- Consider caching results locally

## Architecture

```
┌──────────────────┐
│      Sentry      │  Session Replay captures user sessions
└────────┬─────────┘
         │ API (axios)
         ▼
┌──────────────────┐
│ sentry-client.ts │  Fetches replay data via REST API
└────────┬─────────┘
         │ TypeScript interfaces
         ▼
┌──────────────────┐
│replay-analyzer.ts│ Parses sessions, extracts patterns
└────────┬─────────┘
         │ ReplaySession objects
         ▼
┌──────────────────┐
│ Test Generator   │  Creates Playwright test scripts
└────────┬─────────┘
         │ .spec.ts files
         ▼
┌──────────────────┐
│   Playwright     │  Runs tests, captures screenshots
└──────────────────┘
```

## Learn More

- **Full Findings**: Read `FINDINGS.md` for research conclusions
- **API Details**: See `src/sentry-client.ts` for API documentation
- **Analysis Logic**: Check `src/replay-analyzer.ts` for processing details
- **Sentry Docs**: https://docs.sentry.io/product/session-replay/
- **Playwright Docs**: https://playwright.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/

## Contributing

This is a research project. Ideas for improvement:

1. Parse actual rrweb events from Sentry
2. Extract network requests from breadcrumbs
3. Implement visual regression testing
4. Add selector stability (data-testid)
5. Build CI/CD integration
6. Create web dashboard for results

See the roadmap in `FINDINGS.md` for detailed next steps.
