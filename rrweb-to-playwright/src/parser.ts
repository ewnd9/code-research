/**
 * rrweb Event Parser
 *
 * Parses rrweb recordings and extracts actionable events for Playwright test generation.
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  RRwebEvent,
  MetaEvent,
  ParsedAction,
  PlaywrightTest,
} from './types';
import { EventType, IncrementalSource, MouseInteractions } from './types';

export class RRwebParser {
  private events: RRwebEvent[] = [];
  private nodeMap: Map<number, any> = new Map();
  private selectorMap: Map<number, string> = new Map();

  /**
   * Load rrweb recording from JSON file
   */
  loadRecording(filePath: string): void {
    const data = fs.readFileSync(filePath, 'utf-8');
    this.events = JSON.parse(data);
    console.log(`Loaded ${this.events.length} events from ${filePath}`);
  }

  /**
   * Parse recording into actionable events
   */
  parse(): PlaywrightTest {
    const actions: ParsedAction[] = [];
    let url = '';
    let viewport = { width: 1920, height: 1080 };

    // Build node map from FullSnapshot
    this.buildNodeMap();

    for (const event of this.events) {
      // Extract URL from Meta event
      if (event.type === EventType.Meta) {
        const metaEvent = event as MetaEvent;
        url = metaEvent.data.href;
        viewport = {
          width: metaEvent.data.width,
          height: metaEvent.data.height,
        };
        actions.push({
          type: 'navigation',
          timestamp: event.timestamp,
          url,
        });
        actions.push({
          type: 'viewport',
          timestamp: event.timestamp,
          width: viewport.width,
          height: viewport.height,
        });
      }

      // Parse incremental snapshots
      if (event.type === EventType.IncrementalSnapshot) {
        const action = this.parseIncrementalSnapshot(event);
        if (action) {
          actions.push(action);
        }
      }
    }

    const duration = this.events.length > 0
      ? this.events[this.events.length - 1].timestamp - this.events[0].timestamp
      : 0;

    return {
      url,
      viewport,
      actions,
      duration,
    };
  }

  /**
   * Build a map of node IDs to node data from FullSnapshot
   */
  private buildNodeMap(): void {
    for (const event of this.events) {
      if (event.type === EventType.FullSnapshot) {
        this.traverseNode(event.data.node);
      }
    }
  }

  /**
   * Recursively traverse node tree
   */
  private traverseNode(node: any): void {
    if (!node || !node.id) return;

    this.nodeMap.set(node.id, node);

    // Generate selector for this node
    const selector = this.generateSelector(node);
    if (selector) {
      this.selectorMap.set(node.id, selector);
    }

    // Traverse children
    if (node.childNodes) {
      for (const child of node.childNodes) {
        this.traverseNode(child);
      }
    }
  }

  /**
   * Generate CSS selector for a node
   */
  private generateSelector(node: any): string | null {
    if (!node || node.type !== 2) return null; // Only element nodes

    const tagName = node.tagName?.toLowerCase();
    if (!tagName) return null;

    // Priority 1: data-testid
    const testId = node.attributes?.['data-testid'];
    if (testId) {
      return `[data-testid="${testId}"]`;
    }

    // Priority 2: ID
    const id = node.attributes?.id;
    if (id) {
      return `#${id}`;
    }

    // Priority 3: name attribute (for forms)
    const name = node.attributes?.name;
    if (name) {
      return `${tagName}[name="${name}"]`;
    }

    // Priority 4: type attribute (for inputs/buttons)
    const type = node.attributes?.type;
    if (type) {
      return `${tagName}[type="${type}"]`;
    }

    // Priority 5: class (first class only)
    const className = node.attributes?.class;
    if (className) {
      const firstClass = className.split(' ')[0];
      return `${tagName}.${firstClass}`;
    }

    // Fallback: just tag name (not ideal)
    return tagName;
  }

  /**
   * Parse incremental snapshot events
   */
  private parseIncrementalSnapshot(event: RRwebEvent): ParsedAction | null {
    const data = event.data;

    // Mouse click
    if (data.source === IncrementalSource.MouseInteraction) {
      if (data.type === MouseInteractions.Click) {
        const selector = this.selectorMap.get(data.id);
        return {
          type: 'click',
          timestamp: event.timestamp,
          selector: selector || `/* node-id: ${data.id} */`,
          x: data.x,
          y: data.y,
          nodeId: data.id,
        };
      }
    }

    // Input (text, checkbox, etc.)
    if (data.source === IncrementalSource.Input) {
      const selector = this.selectorMap.get(data.id);

      if (data.isChecked !== undefined) {
        // Checkbox
        return {
          type: 'input',
          timestamp: event.timestamp,
          selector: selector || `/* node-id: ${data.id} */`,
          value: data.isChecked ? 'check' : 'uncheck',
          nodeId: data.id,
        };
      } else if (data.text !== undefined) {
        // Text input
        return {
          type: 'input',
          timestamp: event.timestamp,
          selector: selector || `/* node-id: ${data.id} */`,
          value: data.text,
          nodeId: data.id,
        };
      }
    }

    // Scroll
    if (data.source === IncrementalSource.Scroll) {
      const selector = this.selectorMap.get(data.id);
      return {
        type: 'scroll',
        timestamp: event.timestamp,
        selector: selector || 'body',
        x: data.x,
        y: data.y,
        nodeId: data.id,
      };
    }

    return null;
  }

  /**
   * Get all events
   */
  getEvents(): RRwebEvent[] {
    return this.events;
  }

  /**
   * Get event statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, number> = {};

    for (const event of this.events) {
      const typeName = EventType[event.type] || 'Unknown';
      stats[typeName] = (stats[typeName] || 0) + 1;

      if (event.type === EventType.IncrementalSnapshot) {
        const source = IncrementalSource[event.data.source] || 'Unknown';
        stats[`Incremental.${source}`] = (stats[`Incremental.${source}`] || 0) + 1;
      }
    }

    return stats;
  }
}

/**
 * Example usage
 */
async function main() {
  const parser = new RRwebParser();

  // Check if recording file exists
  const recordingPath = process.argv[2] || './recordings/sample.json';

  if (!fs.existsSync(recordingPath)) {
    console.log('No recording file found.');
    console.log(`Usage: bun run src/parser.ts <path-to-rrweb-recording.json>`);
    console.log('\nTo create a recording:');
    console.log('1. Open demo.html in a browser');
    console.log('2. Click "Start Recording"');
    console.log('3. Interact with the page');
    console.log('4. Click "Stop Recording" and "Download Recording"');
    console.log('5. Save the file to ./recordings/ folder');
    return;
  }

  parser.loadRecording(recordingPath);

  const test = parser.parse();

  console.log('\n=== Parsed Playwright Test ===\n');
  console.log(`URL: ${test.url}`);
  console.log(`Viewport: ${test.viewport?.width}x${test.viewport?.height}`);
  console.log(`Duration: ${test.duration}ms`);
  console.log(`Actions: ${test.actions.length}`);

  console.log('\n=== Actions ===\n');
  for (const action of test.actions) {
    console.log(`[${action.timestamp}ms] ${action.type}:`, {
      selector: action.selector,
      value: action.value,
      url: action.url,
    });
  }

  console.log('\n=== Event Statistics ===\n');
  const stats = parser.getStats();
  for (const [key, count] of Object.entries(stats)) {
    console.log(`${key}: ${count}`);
  }
}

if (require.main === module) {
  main();
}
