# rrweb to Playwright Test Generator

## Research Question

Can we convert rrweb session recordings into executable Playwright tests for automated regression testing?

## Background

### rrweb (Record and Replay the Web)

rrweb is an open-source library for recording and replaying user sessions on the web:
- Records all DOM mutations with timestamps
- Captures user interactions (clicks, inputs, scrolls, mouse movements)
- Serializes sessions as JSON events
- Can replay sessions pixel-perfect in the browser

### Event Types

rrweb uses 6 main event types:
1. **DomContentLoaded** (0) - Page DOMContentLoaded event
2. **Load** (1) - Page load event
3. **FullSnapshot** (2) - Complete DOM tree snapshot
4. **IncrementalSnapshot** (3) - Incremental mutations/interactions
5. **Meta** (4) - Page metadata (URL, viewport size)
6. **Custom** (5) - Custom application events

### Incremental Snapshot Types

The most important for test generation:
- **Mutation** (0) - DOM changes
- **MouseMove** (1) - Mouse movement tracking
- **MouseInteraction** (2) - Clicks, double-clicks, etc.
- **Scroll** (3) - Scroll position changes
- **ViewportResize** (4) - Window resize
- **Input** (5) - Form input changes
- **TouchMove** (6) - Touch events
- **MediaInteraction** (7) - Video/audio interactions

## Hypothesis

By parsing rrweb's incremental snapshots, we can extract user actions and convert them to Playwright commands:
- MouseInteraction → `page.click()`
- Input → `page.fill()` or `page.type()`
- Scroll → `page.evaluate()` with scroll commands
- Meta events → `page.goto()` and `page.setViewportSize()`

## Approach

### Phase 1: rrweb Integration
- Install rrweb library
- Create HTML demo page with recording capability
- Generate sample rrweb recordings

### Phase 2: Event Parser
- Build TypeScript parser for rrweb events
- Extract actionable events (clicks, inputs, navigation)
- Map DOM node IDs to CSS selectors

### Phase 3: Playwright Generator
- Convert rrweb events to Playwright commands
- Generate executable test files
- Handle timing and synchronization

### Phase 4: Validation
- Run generated Playwright tests
- Compare against original recording
- Measure accuracy and reliability

## Technical Challenges

1. **Selector Generation**: rrweb uses internal node IDs, need to map to stable selectors
2. **Timing**: rrweb has exact timestamps, Playwright needs waitForSelector
3. **Dynamic Content**: Replaying may hit race conditions
4. **iframes**: rrweb records iframes separately
5. **Shadow DOM**: Special handling needed
6. **Network State**: rrweb doesn't capture network, need mocking strategy

## Success Criteria

- Successfully record user session with rrweb
- Parse rrweb events into structured actions
- Generate Playwright test that completes without errors
- Test produces similar end state as original recording

## References

- [rrweb GitHub](https://github.com/rrweb-io/rrweb)
- [rrweb Event Documentation](https://github.com/rrweb-io/rrweb/blob/master/docs/recipes/dive-into-event.md)
- [Sentry Replay Format](https://develop.sentry.dev/sdk/data-model/event-payloads/replay-recording/)
- [Playwright Documentation](https://playwright.dev/)
