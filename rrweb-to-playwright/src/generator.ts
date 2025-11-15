/**
 * Playwright Test Generator
 *
 * Converts parsed rrweb recordings into executable Playwright test files.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PlaywrightTest, ParsedAction } from './types';
import { RRwebParser } from './parser';

export class PlaywrightGenerator {
  /**
   * Generate Playwright test code from parsed test
   */
  generate(test: PlaywrightTest, testName: string = 'recorded-session'): string {
    const lines: string[] = [];

    // Header
    lines.push("import { test, expect } from '@playwright/test';");
    lines.push('');
    lines.push(`test('${testName}', async ({ page }) => {`);
    lines.push(`  // Generated from rrweb recording`);
    lines.push(`  // Duration: ${test.duration}ms`);
    lines.push(`  // Actions: ${test.actions.length}`);
    lines.push('');

    // Process actions
    let hasNavigated = false;

    for (const action of test.actions) {
      switch (action.type) {
        case 'navigation':
          if (!hasNavigated && action.url) {
            lines.push(`  // Navigate to page`);
            lines.push(`  await page.goto('${action.url}');`);
            hasNavigated = true;
          }
          break;

        case 'viewport':
          if (action.width && action.height) {
            lines.push(`  // Set viewport size`);
            lines.push(`  await page.setViewportSize({ width: ${action.width}, height: ${action.height} });`);
          }
          break;

        case 'click':
          if (action.selector) {
            lines.push('');
            lines.push(`  // Click: ${action.selector}`);
            if (action.selector.includes('/* node-id:')) {
              lines.push(`  // WARNING: Could not resolve selector, using coordinates`);
              lines.push(`  await page.mouse.click(${action.x}, ${action.y});`);
            } else {
              lines.push(`  await page.click('${action.selector}');`);
            }
          }
          break;

        case 'input':
          if (action.selector && action.value) {
            lines.push('');
            if (action.value === 'check' || action.value === 'uncheck') {
              lines.push(`  // ${action.value === 'check' ? 'Check' : 'Uncheck'}: ${action.selector}`);
              lines.push(`  await page.${action.value}('${action.selector}');`);
            } else {
              lines.push(`  // Fill: ${action.selector}`);
              lines.push(`  await page.fill('${action.selector}', '${this.escapeString(action.value)}');`);
            }
          }
          break;

        case 'scroll':
          if (action.selector && action.x !== undefined && action.y !== undefined) {
            lines.push('');
            lines.push(`  // Scroll`);
            if (action.selector === 'body') {
              lines.push(`  await page.evaluate(() => window.scrollTo(${action.x}, ${action.y}));`);
            } else {
              lines.push(`  await page.evaluate(({ selector, x, y }) => {`);
              lines.push(`    const el = document.querySelector(selector);`);
              lines.push(`    if (el) { el.scrollLeft = x; el.scrollTop = y; }`);
              lines.push(`  }, { selector: '${action.selector}', x: ${action.x}, y: ${action.y} });`);
            }
          }
          break;
      }
    }

    // Footer
    lines.push('');
    lines.push('  // Wait for page to be stable');
    lines.push('  await page.waitForLoadState(\'networkidle\');');
    lines.push('');
    lines.push('  // Take screenshot for visual verification');
    lines.push(`  await page.screenshot({ path: 'test-results/${testName}.png' });`);
    lines.push('});');

    return lines.join('\n');
  }

  /**
   * Generate test file and save to disk
   */
  generateFile(
    test: PlaywrightTest,
    testName: string,
    outputDir: string = './generated-tests'
  ): string {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate test code
    const testCode = this.generate(test, testName);

    // Write to file
    const fileName = `${testName}.spec.ts`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, testCode);

    console.log(`✓ Generated test: ${filePath}`);
    return filePath;
  }

  /**
   * Escape string for code generation
   */
  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }

  /**
   * Generate summary of what was converted
   */
  generateSummary(test: PlaywrightTest): string {
    const actionTypes = test.actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lines: string[] = [];
    lines.push('=== Conversion Summary ===');
    lines.push('');
    lines.push(`URL: ${test.url}`);
    lines.push(`Viewport: ${test.viewport?.width}x${test.viewport?.height}`);
    lines.push(`Duration: ${test.duration}ms (${(test.duration / 1000).toFixed(1)}s)`);
    lines.push(`Total Actions: ${test.actions.length}`);
    lines.push('');
    lines.push('Action Breakdown:');
    for (const [type, count] of Object.entries(actionTypes)) {
      lines.push(`  - ${type}: ${count}`);
    }

    // Count actions with unresolved selectors
    const unresolvedCount = test.actions.filter(a =>
      a.selector?.includes('/* node-id:')
    ).length;

    if (unresolvedCount > 0) {
      lines.push('');
      lines.push(`⚠️  Warning: ${unresolvedCount} actions have unresolved selectors`);
      lines.push('   These will use coordinates instead of selectors (less reliable)');
    }

    return lines.join('\n');
  }
}

/**
 * Example usage
 */
async function main() {
  const recordingPath = process.argv[2];

  if (!recordingPath || !fs.existsSync(recordingPath)) {
    console.log('Usage: bun run src/generator.ts <path-to-rrweb-recording.json>');
    console.log('');
    console.log('Example:');
    console.log('  bun run src/generator.ts ./recordings/my-recording.json');
    return;
  }

  console.log('=== rrweb to Playwright Generator ===\n');

  // Parse recording
  const parser = new RRwebParser();
  parser.loadRecording(recordingPath);
  const test = parser.parse();

  // Generate Playwright test
  const generator = new PlaywrightGenerator();
  const testName = path.basename(recordingPath, '.json');

  console.log(generator.generateSummary(test));
  console.log('');

  const filePath = generator.generateFile(test, testName);

  console.log('');
  console.log('To run the generated test:');
  console.log(`  bun test:playwright ${filePath}`);
}

if (require.main === module) {
  main();
}
