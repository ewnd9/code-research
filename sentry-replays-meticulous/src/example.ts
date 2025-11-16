/**
 * End-to-end example: Fetch Sentry replays and generate test scripts
 *
 * This demonstrates the complete workflow:
 * 1. Fetch replays from Sentry API
 * 2. Analyze replay data
 * 3. Generate Playwright test scripts
 * 4. Export for testing
 *
 * Usage:
 *   export SENTRY_AUTH_TOKEN='your-token'
 *   export SENTRY_ORG_SLUG='your-org'
 *   npm run example
 */

import { SentryReplayClient } from './sentry-client';
import { ReplayAnalyzer } from './replay-analyzer';

async function main() {
  console.log('=== Sentry Replays → Meticulous.ai Clone Demo ===\n');

  // Step 1: Initialize Sentry client
  console.log('Step 1: Connecting to Sentry...');
  let client: SentryReplayClient;

  try {
    client = new SentryReplayClient();
    console.log(`✓ Connected to organization: ${(client as any).orgSlug}\n`);
  } catch (error: any) {
    console.log(`✗ Error: ${error.message}\n`);
    console.log('Please set environment variables:');
    console.log("  export SENTRY_AUTH_TOKEN='your-token'");
    console.log("  export SENTRY_ORG_SLUG='your-org-slug'\n");
    console.log('To get a Sentry auth token:');
    console.log('  1. Go to https://sentry.io/settings/account/api/auth-tokens/');
    console.log('  2. Create a new token with \'org:read\' scope');
    console.log('  3. Copy the token and set it as SENTRY_AUTH_TOKEN');
    return;
  }

  // Step 2: Fetch replays
  console.log('Step 2: Fetching replays from last 7 days...');

  try {
    // Fetch with error filtering to prioritize problematic sessions
    const result = await client.listReplays({
      statsPeriod: '7d',
      query: 'error_count:>0', // Only sessions with errors
      perPage: 20,
      fields: [
        'id',
        'project_id',
        'duration',
        'finished_at',
        'user',
        'browser',
        'os',
        'error_count',
        'urls',
      ],
    });

    const replays = result.data;
    console.log(`✓ Found ${replays.length} replays with errors\n`);

    if (replays.length === 0) {
      console.log('No replays found. Try:');
      console.log('  - Removing the error_count filter');
      console.log("  - Increasing the time range (e.g., statsPeriod='30d')");
      console.log('  - Checking that your Sentry project has session replay enabled');
      return;
    }

    // Step 3: Analyze replays
    console.log('Step 3: Analyzing replay sessions...');
    const analyzer = new ReplayAnalyzer();

    for (const replay of replays) {
      const session = analyzer.analyzeReplay(replay);
      console.log(
        `  • Replay ${session.replayId.substring(0, 8)}: ${session.duration}ms, ${session.errors.length} errors`
      );
    }

    console.log(`✓ Analyzed ${analyzer.getSessions().length} sessions\n`);

    // Step 4: Coverage analysis
    console.log('Step 4: Analyzing test coverage...');
    const coverage = analyzer.analyzeCoverage();

    console.log(`  • Total sessions: ${coverage.totalSessions}`);
    console.log(`  • Unique URLs: ${coverage.uniqueUrls}`);
    console.log(`  • Total errors: ${coverage.totalErrors}`);
    console.log('  • Browser distribution:');

    for (const [browser, count] of Object.entries(coverage.browserDistribution)) {
      if (browser) {
        // Skip empty values
        console.log(`    - ${browser}: ${count}`);
      }
    }

    console.log();

    // Step 5: Select sessions for testing
    console.log('Step 5: Selecting sessions for automated testing...');
    const selected = analyzer.selectSessionsForTesting({
      maxSessions: 5,
      prioritizeErrors: true,
      minDuration: 1000, // At least 1 second
    });

    console.log(`✓ Selected ${selected.length} sessions for testing\n`);

    for (let i = 0; i < selected.length; i++) {
      const session = selected[i];
      console.log(
        `  ${i + 1}. ${session.replayId.substring(0, 8)} - ${session.duration}ms, ${session.errors.length} errors, ${session.actions.length} actions`
      );
    }

    console.log();

    // Step 6: Export test scripts
    console.log('Step 6: Generating Playwright test scripts...');
    const outputDir = './generated-tests';

    try {
      analyzer.exportForTesting(outputDir);
      console.log(`✓ Tests exported to ${outputDir}/\n`);

      // Show example test
      if (selected.length > 0) {
        const exampleSession = selected[0];
        console.log('Example generated test:\n');
        console.log('-'.repeat(60));
        console.log(analyzer.toPlaywrightTest(exampleSession));
        console.log('-'.repeat(60));
      }
    } catch (error: any) {
      console.log(`✗ Error exporting tests: ${error.message}\n`);
      return;
    }

    // Step 7: Summary and next steps
    console.log('\n=== Summary ===\n');
    console.log('This proof-of-concept demonstrates:');
    console.log('  ✓ Fetching session replays from Sentry API');
    console.log('  ✓ Analyzing replay data for test generation');
    console.log('  ✓ Generating Playwright test scripts');
    console.log('  ✓ Prioritizing sessions with errors');
    console.log();
    console.log('Next steps to build a full meticulous.ai clone:');
    console.log('  1. Parse actual Sentry replay events (rrweb format)');
    console.log('  2. Extract precise user actions (clicks, inputs, etc.)');
    console.log('  3. Mock network requests from replay data');
    console.log('  4. Implement visual regression testing');
    console.log('  5. Run tests on both base and head commits');
    console.log('  6. Compare screenshots and report differences');
    console.log();
    console.log('To run the generated tests:');
    console.log('  1. npm install -D @playwright/test');
    console.log('  2. npx playwright test generated-tests/');
    console.log();
  } catch (error: any) {
    console.log(`✗ Error fetching replays: ${error.message}\n`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return;
  }
}

// Run the example
main().catch(console.error);
