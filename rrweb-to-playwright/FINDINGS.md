# rrweb to Playwright: Research Findings

## Executive Summary

**Feasibility:** ✅ **Viable with caveats** - It is possible to convert rrweb session recordings into Playwright tests, but significant challenges exist around selector stability, timing, and test reliability.

**Key Insight:** rrweb captures pixel-perfect user sessions, but translating visual replays to executable tests requires bridging the gap between DOM node IDs and stable CSS selectors.

## rrweb Format Deep Dive

### Event Structure

rrweb recordings are JSON arrays of events with strict typing:

```typescript
{
  type: EventType,      // 0-5 (DomContentLoaded, Load, FullSnapshot, etc.)
  data: any,            // Event-specific data
  timestamp: number     // Unix timestamp in milliseconds
}
```

### Six Core Event Types

1. **DomContentLoaded (0)** - Page DOMContentLoaded fired
   ```json
   { "type": 0, "data": {}, "timestamp": 1699876543210 }
   ```

2. **Load (1)** - Page load completed
   ```json
   { "type": 1, "data": {}, "timestamp": 1699876543410 }
   ```

3. **FullSnapshot (2)** - Complete DOM tree serialization
   ```json
   {
     "type": 2,
     "data": {
       "node": {
         "type": 1,  // Document
         "childNodes": [/* serialized DOM tree */]
       },
       "initialOffset": { "top": 0, "left": 0 }
     },
     "timestamp": 1699876543410
   }
   ```

4. **IncrementalSnapshot (3)** - DOM mutations and interactions
   ```json
   {
     "type": 3,
     "data": {
       "source": 2,  // MouseInteraction
       "type": 2,    // Click
       "id": 123,    // Node ID
       "x": 450,
       "y": 230
     },
     "timestamp": 1699876545123
   }
   ```

5. **Meta (4)** - Page metadata
   ```json
   {
     "type": 4,
     "data": {
       "href": "https://example.com/page",
       "width": 1920,
       "height": 1080
     },
     "timestamp": 1699876543200
   }
   ```

6. **Custom (5)** - Application-defined events
   ```json
   {
     "type": 5,
     "data": {
       "tag": "user-action",
       "payload": { "action": "checkout" }
     },
     "timestamp": 1699876546000
   }
   ```

### Incremental Snapshot Types (IncrementalSource)

The most important for test generation:

| Source | Type | Purpose | Playwright Equivalent |
|--------|------|---------|----------------------|
| 0 | Mutation | DOM changes | N/A (structural) |
| 1 | MouseMove | Mouse tracking | N/A (not needed) |
| **2** | **MouseInteraction** | Clicks, focus, blur | `page.click()` |
| 3 | Scroll | Scroll position | `page.evaluate(scroll)` |
| 4 | ViewportResize | Window resize | `page.setViewportSize()` |
| **5** | **Input** | Text input, checkboxes | `page.fill()`, `page.check()` |
| 6 | TouchMove | Touch events | `page.tap()` |
| 7 | MediaInteraction | Play/pause media | `page.click()` on controls |
| 8-13 | Styling/Canvas | Visual mutations | N/A |

### Mouse Interaction Types

```typescript
enum MouseInteractions {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,         // ← Most important
  ContextMenu = 3,
  DblClick = 4,      // ← Useful
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchEnd = 9,
}
```

### Input Event Format

```json
{
  "type": 3,
  "data": {
    "source": 5,     // Input
    "text": "john.doe@example.com",
    "isChecked": undefined,
    "id": 456        // Input element node ID
  },
  "timestamp": 1699876548000
}
```

For checkboxes:
```json
{
  "type": 3,
  "data": {
    "source": 5,
    "text": "",
    "isChecked": true,
    "id": 789
  },
  "timestamp": 1699876549000
}
```

## Implementation: rrweb to Playwright

### Architecture

```
┌─────────────────┐
│ rrweb Recording │ (JSON file with events)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RRwebParser    │ Extracts actions, builds node map
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ParsedAction[]  │ Structured action list
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│PlaywrightGen    │ Generates test code
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  .spec.ts file  │ Executable Playwright test
└─────────────────┘
```

### Selector Generation Strategy

**Priority Order:**

1. **data-testid** (Best) - Stable, semantic
   ```typescript
   [data-testid="email-input"] → page.fill('[data-testid="email-input"]', '...')
   ```

2. **ID attribute** (Good) - Usually stable
   ```typescript
   #email → page.fill('#email', '...')
   ```

3. **Name attribute** (OK) - Common in forms
   ```typescript
   input[name="email"] → page.fill('input[name="email"]', '...')
   ```

4. **Type attribute** (Weak) - Multiple elements may match
   ```typescript
   input[type="email"] → page.fill('input[type="email"]', '...')
   ```

5. **First class** (Fragile) - Styling changes break this
   ```typescript
   input.form-input → page.fill('input.form-input', '...')
   ```

6. **Coordinates fallback** (Last resort) - Least reliable
   ```typescript
   page.mouse.click(450, 230)
   ```

### Conversion Examples

**rrweb Click Event:**
```json
{
  "type": 3,
  "data": { "source": 2, "type": 2, "id": 123, "x": 450, "y": 230 },
  "timestamp": 1699876545123
}
```

**Generated Playwright:**
```typescript
await page.click('[data-testid="submit-button"]');
```

**rrweb Input Event:**
```json
{
  "type": 3,
  "data": { "source": 5, "text": "test@example.com", "id": 456 },
  "timestamp": 1699876548000
}
```

**Generated Playwright:**
```typescript
await page.fill('input[name="email"]', 'test@example.com');
```

## Pros and Cons

### ✅ Advantages

1. **Real User Behavior**
   - Captures actual user flows from production
   - No need to manually write test scenarios
   - Tests represent real usage patterns

2. **Comprehensive Coverage**
   - Captures every interaction (clicks, typing, scrolling)
   - Includes edge cases users actually encounter
   - Records timing and sequence accurately

3. **Fast Test Creation**
   - Generate tests in seconds from recordings
   - No manual scripting required
   - Scales to hundreds of flows quickly

4. **Visual Replay**
   - Can replay exactly what user did
   - Debugging is easier with visual playback
   - Stakeholders can see actual user behavior

5. **Cross-Browser Consistency**
   - rrweb works across all modern browsers
   - Consistent format regardless of browser
   - Portable recordings

6. **Lightweight**
   - JSON format is compact
   - Efficient storage and transmission
   - No video files (much smaller)

### ❌ Disadvantages

1. **Selector Fragility** ⚠️ **Critical Issue**
   - rrweb uses internal node IDs (e.g., `id: 123`)
   - These IDs don't exist in DOM, are runtime-generated
   - Converting to CSS selectors is heuristic-based
   - Tests break when DOM structure changes
   - **Mitigation:** Require `data-testid` attributes on all interactive elements

2. **No Network Mocking** ⚠️ **Major Limitation**
   - rrweb doesn't capture network requests/responses
   - Tests hit real APIs (slow, non-deterministic)
   - Can't replay offline or in CI without real backend
   - **Mitigation:** Combine with network recording tools (HAR, Polly.js)

3. **Timing Challenges**
   - rrweb has exact timestamps (e.g., click at 2.3s)
   - Playwright tests need to wait for elements
   - Replays may be faster/slower than recording
   - **Mitigation:** Add `page.waitForSelector()` before each action

4. **Dynamic Content**
   - User sees personalized content (name, email)
   - Tests replay with same data expectations
   - IDs, timestamps change between runs
   - **Mitigation:** Parameterize tests, mock dynamic data

5. **No Assertions**
   - rrweb only records actions, not expected outcomes
   - Generated tests just replay actions
   - Need to manually add `expect()` statements
   - **Mitigation:** Add screenshot comparison or manual assertions

6. **Privacy Concerns**
   - Records everything users do
   - May capture PII (passwords, credit cards, emails)
   - GDPR/compliance issues
   - **Mitigation:** Mask sensitive fields, filter recordings

7. **Large Files**
   - Long sessions create large JSON files
   - Mouse movements add significant data
   - Storage and parsing overhead
   - **Mitigation:** Disable mouse tracking, limit session length

8. **iframes and Shadow DOM**
   - Complex to handle nested contexts
   - May not capture all interactions
   - Requires special configuration
   - **Mitigation:** Test components individually

## Comparison with Meticulous.ai Approach

| Feature | rrweb + Playwright | Meticulous.ai | Sentry Replays |
|---------|-------------------|---------------|----------------|
| Recording | ✅ Open source | ✅ Proprietary | ✅ Built-in |
| Selector Mapping | ⚠️ Heuristic | ✅ Smart algorithm | ⚠️ Node IDs |
| Network Mocking | ❌ Manual | ✅ Automatic | ❌ No |
| Visual Comparison | ⚠️ Manual | ✅ Automatic | ❌ No |
| Test Generation | ✅ DIY | ✅ Automated | ⚠️ Limited |
| Cost | 🆓 Free | 💰 Paid SaaS | 💰 Paid (Sentry) |
| Customization | ✅ Full control | ⚠️ Limited | ⚠️ Limited |

## Production Readiness Assessment

### What Works Well

✅ **Proof-of-Concept Level**
- Recording sessions works reliably
- Parsing rrweb format is straightforward
- Basic test generation is functional
- Can replay simple flows

### What Needs Work

❌ **For Production Use**
- **Selector stability:** Need comprehensive `data-testid` coverage
- **Network layer:** Must integrate network recording/mocking
- **Assertions:** Tests need expected outcomes, not just actions
- **Flake reduction:** Add proper waits, retries, state verification
- **Data handling:** Parameterize tests, handle dynamic content
- **Privacy:** Implement PII masking and filtering

### Recommended Architecture for Production

```
┌──────────────────┐
│   Production     │  User interacts with app
└────────┬─────────┘
         │
         ├─────► rrweb (records sessions)
         │       └─ Filter PII, limit length
         │
         └─────► HAR/Polly.js (records network)
                 └─ Capture requests/responses

         ▼

┌──────────────────┐
│  Storage (S3)    │  Store recordings + network data
└────────┬─────────┘
         │
         ▼

┌──────────────────┐
│  Test Generator  │  Parse + Generate tests
├──────────────────┤
│  - Map selectors │
│  - Add waits     │
│  - Mock network  │
│  - Add assertions│
└────────┬─────────┘
         │
         ▼

┌──────────────────┐
│ Playwright Tests │  Run in CI/CD
└──────────────────┘
```

## Estimated Effort for Production MVP

### Phase 1: Selector Stability (2-3 weeks)
- Add `data-testid` to all interactive elements
- Implement smart selector generation
- Handle dynamic IDs and classes
- XPath fallback strategy

### Phase 2: Network Integration (2 weeks)
- Integrate HAR recording
- Build network mock layer
- Handle authentication tokens
- GraphQL support

### Phase 3: Test Quality (2-3 weeks)
- Add automatic waits (`waitForSelector`)
- Implement screenshot assertions
- Handle iframes and shadow DOM
- Retry logic for flaky steps

### Phase 4: Data Management (1-2 weeks)
- Parameterize tests (emails, names, IDs)
- Test data factories
- Environment-specific config
- Secrets management

### Phase 5: Production Hardening (2 weeks)
- PII masking and filtering
- Recording size optimization
- Parallel test execution
- CI/CD integration
- Monitoring and alerts

**Total: 9-12 weeks** for production-ready MVP

## Use Cases

### ✅ Good Fit

1. **Smoke Testing** - Quick validation that basic flows work
2. **Visual Regression** - Detect UI changes (with screenshot comparison)
3. **User Journey Documentation** - Record and share common flows
4. **Bug Reproduction** - Capture exact steps that caused issues
5. **Onboarding New Developers** - Show how app is actually used

### ❌ Not a Good Fit

1. **API Testing** - Better tools exist (Postman, REST Assured)
2. **Unit Testing** - Wrong level of abstraction
3. **Load Testing** - Performance testing needs different approach
4. **Security Testing** - Requires specialized tools
5. **Complex Business Logic** - Need explicit assertions

## Recommendations

### For Quick Wins

1. **Start small:** Record 5-10 critical user flows
2. **Add data-testid:** Instrument key interactive elements
3. **Manual assertions:** Add `expect()` statements to generated tests
4. **Screenshot comparison:** Use Playwright's visual regression
5. **Run in CI:** Start with nightly runs, not blocking PRs

### For Long-Term Success

1. **Selector strategy:** Mandate `data-testid` in coding standards
2. **Network mocking:** Invest in HAR integration or MSW
3. **Test maintenance:** Budget 20% time for test updates
4. **Hybrid approach:** Combine with hand-written tests
5. **Observability:** Monitor test flakiness and reliability

## Conclusion

**rrweb to Playwright conversion is viable for specific use cases**, particularly smoke testing and visual regression detection. However, it's **not a silver bullet** and works best as part of a comprehensive testing strategy.

**Key Success Factors:**
- Good selector hygiene (`data-testid` everywhere)
- Network mocking infrastructure
- Regular test maintenance
- Realistic expectations (complement, not replace manual tests)

**Bottom Line:**
- ✅ Use for: Smoke tests, visual regression, bug reproduction
- ⚠️ Use cautiously for: Complex flows, critical paths
- ❌ Don't use for: API testing, unit testing, load testing

The approach is most valuable when integrated with Sentry's error tracking - use replays to generate regression tests for bugs that actually occurred in production.

---

**Research Date:** November 8, 2025
**Status:** Proof-of-Concept Complete ✅
**Next Action:** Experiment with real Sentry replay data
