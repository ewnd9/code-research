/**
 * Replay Analyzer
 *
 * Analyzes Sentry replay data to extract patterns suitable for automated testing.
 * This serves as a bridge between Sentry's replay format and a meticulous.ai-style
 * testing system.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface UserAction {
  timestamp: number; // milliseconds since replay start
  actionType: string; // click, input, navigation, etc.
  selector?: string; // CSS selector or XPath
  value?: string; // For input events
  target?: string; // URL for navigation
  coordinates?: { x: number; y: number }; // x, y for clicks
}

export interface NetworkRequest {
  timestamp: number;
  method: string;
  url: string;
  statusCode?: number;
  responseBody?: string;
  requestBody?: string;
}

export interface ReplayMetadata {
  user?: Record<string, any>;
  browser?: { name: string; version: string };
  os?: { name: string; version: string };
  device?: Record<string, any>;
  startedAt?: string;
  finishedAt?: string;
  errorCount: number;
  projectId?: number;
}

export interface ReplaySession {
  replayId: string;
  duration: number; // milliseconds
  url: string; // Starting URL
  actions: UserAction[];
  networkRequests: NetworkRequest[];
  errors: Array<Record<string, any>>;
  metadata: ReplayMetadata;
}

export interface CoverageStats {
  totalSessions: number;
  uniqueUrls: number;
  uniqueSelectors: number;
  urlDistribution: Record<string, number>;
  browserDistribution: Record<string, number>;
  totalActions: number;
  totalErrors: number;
}

export interface TestSummary {
  generatedAt: string;
  totalTests: number;
  coverage: CoverageStats;
  tests: Array<{
    replayId: string;
    duration: number;
    url: string;
    actionCount: number;
    errorCount: number;
  }>;
}

export class ReplayAnalyzer {
  private sessions: ReplaySession[] = [];

  /**
   * Analyze a single replay and extract actionable test data.
   */
  analyzeReplay(replayData: Record<string, any>): ReplaySession {
    const replayId = replayData.id || 'unknown';
    const duration = replayData.duration || 0;

    // Extract starting URL
    const url = this.extractUrl(replayData);

    // Parse events (if available in the replay data)
    const actions = this.extractActions(replayData);
    const networkRequests = this.extractNetworkRequests(replayData);
    const errors = this.extractErrors(replayData);

    const metadata: ReplayMetadata = {
      user: replayData.user,
      browser: replayData.browser,
      os: replayData.os,
      device: replayData.device,
      startedAt: replayData.started_at,
      finishedAt: replayData.finished_at,
      errorCount: replayData.error_count || 0,
      projectId: replayData.project_id,
    };

    const session: ReplaySession = {
      replayId,
      duration,
      url,
      actions,
      networkRequests,
      errors,
      metadata,
    };

    this.sessions.push(session);
    return session;
  }

  /**
   * Extract starting URL from replay data.
   */
  private extractUrl(replayData: Record<string, any>): string {
    // Check various possible fields
    if (replayData.urls && Array.isArray(replayData.urls) && replayData.urls.length > 0) {
      return replayData.urls[0];
    }
    if (replayData.url) {
      return replayData.url;
    }
    if (replayData.tags && Array.isArray(replayData.tags)) {
      for (const tag of replayData.tags) {
        if (tag.key === 'url') {
          return tag.value || '';
        }
      }
    }

    return 'https://example.com'; // Fallback
  }

  /**
   * Extract user actions from replay data.
   *
   * Note: This is a placeholder. Actual implementation depends on
   * Sentry's replay event format, which may require fetching
   * additional data via the events endpoint.
   */
  private extractActions(replayData: Record<string, any>): UserAction[] {
    const actions: UserAction[] = [];

    // Placeholder: In a real implementation, you'd parse the
    // rrweb events or Sentry's specific format
    // Example structure we might see:
    // {
    //   "type": 3,  // IncrementalSnapshot
    //   "data": {
    //     "source": 2,  // MouseInteraction
    //     "type": 2,  // Click
    //     "id": 123,
    //     "x": 100,
    //     "y": 200
    //   }
    // }

    return actions;
  }

  /**
   * Extract network requests from replay data.
   */
  private extractNetworkRequests(replayData: Record<string, any>): NetworkRequest[] {
    const requests: NetworkRequest[] = [];

    // Placeholder: Parse network activity from replay
    // Sentry may include this in breadcrumbs or separate events

    return requests;
  }

  /**
   * Extract errors from replay data.
   */
  private extractErrors(replayData: Record<string, any>): Array<Record<string, any>> {
    const errors: Array<Record<string, any>> = [];

    if (replayData.errors && Array.isArray(replayData.errors)) {
      return replayData.errors;
    } else if (replayData.error_ids && Array.isArray(replayData.error_ids)) {
      // Would need to fetch error details separately
      return replayData.error_ids.map((id: string) => ({ id }));
    }

    return errors;
  }

  /**
   * Analyze test coverage across all sessions.
   */
  analyzeCoverage(): CoverageStats {
    const allUrls: string[] = [];
    const allSelectors: string[] = [];
    const allBrowsers: string[] = [];

    for (const session of this.sessions) {
      allUrls.push(session.url);
      if (session.metadata.browser?.name) {
        allBrowsers.push(session.metadata.browser.name);
      }

      for (const action of session.actions) {
        if (action.selector) {
          allSelectors.push(action.selector);
        }
      }
    }

    // Count occurrences
    const urlDistribution = this.countOccurrences(allUrls);
    const browserDistribution = this.countOccurrences(allBrowsers);

    return {
      totalSessions: this.sessions.length,
      uniqueUrls: new Set(allUrls).size,
      uniqueSelectors: new Set(allSelectors).size,
      urlDistribution,
      browserDistribution,
      totalActions: this.sessions.reduce((sum, s) => sum + s.actions.length, 0),
      totalErrors: this.sessions.reduce((sum, s) => sum + s.errors.length, 0),
    };
  }

  /**
   * Count occurrences of items in an array.
   */
  private countOccurrences(items: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item] = (counts[item] || 0) + 1;
    }
    return counts;
  }

  /**
   * Select most valuable sessions for automated testing.
   */
  selectSessionsForTesting(options: {
    maxSessions?: number;
    prioritizeErrors?: boolean;
    minDuration?: number;
  } = {}): ReplaySession[] {
    const {
      maxSessions = 10,
      prioritizeErrors = true,
      minDuration = 1000, // milliseconds
    } = options;

    // Filter by minimum duration
    let candidates = this.sessions.filter((s) => s.duration >= minDuration);

    if (prioritizeErrors) {
      // Sort by error count (descending) then by duration
      candidates.sort((a, b) => {
        if (b.errors.length !== a.errors.length) {
          return b.errors.length - a.errors.length;
        }
        return b.duration - a.duration;
      });
    } else {
      // Sort by duration (longer sessions = more coverage)
      candidates.sort((a, b) => b.duration - a.duration);
    }

    return candidates.slice(0, maxSessions);
  }

  /**
   * Generate a Playwright test script from a session.
   */
  toPlaywrightTest(session: ReplaySession): string {
    const lines: string[] = [
      "import { test, expect } from '@playwright/test';",
      '',
      `test('replay-${session.replayId.substring(0, 8)}', async ({ page }) => {`,
      `  // Original session duration: ${session.duration}ms`,
      `  // URL: ${session.url}`,
      '',
      `  await page.goto('${session.url}');`,
      '',
    ];

    for (const action of session.actions) {
      if (action.actionType === 'click' && action.selector) {
        lines.push(`  await page.click('${action.selector}');`);
      } else if (action.actionType === 'input' && action.selector && action.value) {
        lines.push(`  await page.fill('${action.selector}', '${action.value}');`);
      } else if (action.actionType === 'navigation' && action.target) {
        lines.push(`  await page.goto('${action.target}');`);
      }

      // Add small delay to simulate real user behavior
      lines.push('  await page.waitForTimeout(100);');
      lines.push('');
    }

    lines.push('  // Take final screenshot for comparison');
    lines.push(`  await page.screenshot({ path: 'screenshots/replay-${session.replayId.substring(0, 8)}.png' });`);
    lines.push('});');

    return lines.join('\n');
  }

  /**
   * Export selected sessions as Playwright test scripts.
   */
  exportForTesting(outputDir: string = './tests'): void {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const selected = this.selectSessionsForTesting();

    for (const session of selected) {
      const testScript = this.toPlaywrightTest(session);
      const filename = path.join(outputDir, `replay-${session.replayId.substring(0, 8)}.spec.ts`);

      fs.writeFileSync(filename, testScript);
      console.log(`Generated test: ${filename}`);
    }

    // Generate a summary file
    const summary: TestSummary = {
      generatedAt: new Date().toISOString(),
      totalTests: selected.length,
      coverage: this.analyzeCoverage(),
      tests: selected.map((s) => ({
        replayId: s.replayId,
        duration: s.duration,
        url: s.url,
        actionCount: s.actions.length,
        errorCount: s.errors.length,
      })),
    };

    const summaryPath = path.join(outputDir, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\nGenerated ${selected.length} tests in ${outputDir}/`);
    console.log(`Summary written to ${summaryPath}`);
  }

  /**
   * Get all analyzed sessions.
   */
  getSessions(): ReplaySession[] {
    return this.sessions;
  }
}

/**
 * Example usage of ReplayAnalyzer
 */
async function main() {
  // Example replay data (simplified)
  const sampleReplay = {
    id: 'abc123def456',
    duration: 45000, // 45 seconds
    url: 'https://example.com/app',
    user: { email: 'user@example.com' },
    browser: { name: 'Chrome', version: '120.0' },
    os: { name: 'macOS', version: '14.0' },
    error_count: 2,
    errors: [
      { message: 'TypeError: Cannot read property X' },
      { message: 'NetworkError: Failed to fetch' },
    ],
  };

  const analyzer = new ReplayAnalyzer();

  // Analyze replay
  const session = analyzer.analyzeReplay(sampleReplay);

  console.log('Analyzed Replay Session:');
  console.log(`  ID: ${session.replayId}`);
  console.log(`  Duration: ${session.duration}ms`);
  console.log(`  URL: ${session.url}`);
  console.log(`  Errors: ${session.errors.length}`);

  // Generate test script
  console.log('\nGenerated Test Script:');
  console.log(analyzer.toPlaywrightTest(session));

  // Coverage analysis
  console.log('\nCoverage Analysis:');
  const coverage = analyzer.analyzeCoverage();
  console.log(JSON.stringify(coverage, null, 2));
}

// Run if executed directly
if (require.main === module) {
  main();
}
