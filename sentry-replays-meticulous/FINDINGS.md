# Research Findings: Sentry Replays + Meticulous.ai Clone

## Executive Summary

**Feasibility:** ✅ **Viable** - It is possible to build a meticulous.ai-style testing system using Sentry replays, though with some important caveats.

**Key Insight:** Sentry already captures session replay data in production. By leveraging this data through their API, we can skip the "recording infrastructure" phase that meticulous.ai requires, and jump straight to generating automated tests from real user behavior.

## Technical Architecture

### Components Built

1. **Sentry API Client** (`sentry_client.py`)
   - Fetches replay sessions via REST API
   - Supports filtering by project, environment, errors
   - Handles pagination automatically
   - Authenticates with bearer tokens

2. **Replay Analyzer** (`replay_analyzer.py`)
   - Parses replay data into actionable test cases
   - Extracts user actions, network requests, errors
   - Generates Playwright test scripts
   - Provides coverage analysis
   - Selects most valuable sessions for testing

3. **Integration Example** (`example.py`)
   - End-to-end workflow demonstration
   - Fetches → Analyzes → Generates → Exports

## What Works

### ✅ Data Access
- Sentry API provides comprehensive replay metadata
- Can filter by errors, time range, environment
- Pagination works smoothly for large datasets
- Authentication is straightforward (bearer tokens)

### ✅ Session Selection
- Can prioritize sessions with errors (most valuable for testing)
- Duration filtering helps focus on meaningful interactions
- Coverage analysis identifies unique URLs and patterns

### ✅ Test Generation
- Can generate Playwright test script scaffolds
- Metadata (browser, OS, user) available for test context
- Error information helps target problematic flows

## Current Limitations

### ⚠️ Event-Level Data
**Challenge:** The API endpoint for fetching detailed replay events (clicks, inputs, scrolls) is not well-documented in public Sentry docs.

**Impact:** Current implementation generates test *scaffolds* but can't yet extract precise user actions.

**Solution Path:**
1. Sentry replays use [rrweb format](https://github.com/rrweb-io/rrweb) internally
2. Need to find/document the events endpoint
3. Parse rrweb events to extract DOM interactions
4. May require Sentry SDK integration for more access

### ⚠️ Network Request Mocking
**Challenge:** Network requests may be in breadcrumbs or separate event stream, not in main replay object.

**Impact:** Can't yet mock API calls for deterministic testing.

**Solution Path:**
1. Explore Sentry's performance monitoring integration
2. Parse breadcrumb data for network events
3. Extract request/response bodies if available
4. Build network mock layer for Playwright

### ⚠️ Visual Comparison
**Challenge:** Need separate infrastructure for baseline storage and comparison.

**Impact:** Can generate tests but can't detect visual regressions yet.

**Solution Path:**
1. Integrate [Playwright's screenshot testing](https://playwright.dev/docs/test-snapshots)
2. Use [Percy](https://percy.io/) or [Chromatic](https://www.chromatic.com/) for visual diffs
3. Or build custom pixel comparison (e.g., with Pixelmatch)

## Advantages Over Meticulous.ai

1. **No Recording Infrastructure**: Sentry already deployed → instant data access
2. **Error Context**: Replays come with error data built-in
3. **Production Data**: Real user behavior, not synthetic tests
4. **Existing Integration**: If using Sentry, no new SDK needed

## Disadvantages vs. Meticulous.ai

1. **Less Control**: Can't control what Sentry records
2. **Privacy Constraints**: User data may limit replay access
3. **Format Lock-in**: Dependent on Sentry's data format
4. **Incomplete Events**: May not capture all interactions
5. **No Built-in Mocking**: Must build network mocking layer

## Proof-of-Concept Status

### What This PoC Demonstrates

✅ **API Integration**: Successfully connects to Sentry and fetches replays
✅ **Data Filtering**: Can query by errors, projects, time ranges
✅ **Analysis Pipeline**: Processes replay data into structured format
✅ **Test Scaffolding**: Generates runnable Playwright test files
✅ **Coverage Metrics**: Analyzes test coverage across sessions

### What's Missing for Production

❌ **Event Parsing**: Need to parse rrweb events for precise actions
❌ **Network Mocking**: Must extract and mock API calls
❌ **Visual Comparison**: Need baseline storage + diff detection
❌ **CI Integration**: Pipeline for running tests on commits
❌ **Determinism**: Browser augmentation for stable replays
❌ **Selector Strategy**: Robust element targeting (not just CSS)

## Next Steps for Full Implementation

### Phase 1: Enhanced Event Parsing (Est. 2-3 weeks)
1. Reverse-engineer Sentry's replay events endpoint
2. Build rrweb event parser
3. Extract precise user actions (clicks, inputs, navigations)
4. Map DOM events to reliable selectors (data-testid, ARIA)

### Phase 2: Network Layer (Est. 2 weeks)
1. Extract network requests from replay/breadcrumbs
2. Build mock layer (MSW or Playwright route mocking)
3. Handle auth tokens and cookies
4. Support GraphQL and REST

### Phase 3: Visual Testing (Est. 2 weeks)
1. Implement screenshot capture at key points
2. Store baseline images (S3, Git LFS, or DB)
3. Compare screenshots (Playwright or Pixelmatch)
4. Generate visual diff reports

### Phase 4: Determinism (Est. 3 weeks)
1. Mock Date/Time in replays
2. Stabilize random number generation
3. Handle animations and transitions
4. Control async timing

### Phase 5: Production Hardening (Est. 3 weeks)
1. Error handling and retry logic
2. Parallel test execution
3. CI/CD integration (GitHub Actions, Jenkins)
4. Reporting dashboard
5. Flake detection and quarantine

**Total Estimated Effort:** ~12-13 weeks for MVP

## Recommended Architecture

```
┌─────────────────┐
│  Sentry Cloud   │
│  (Replay Data)  │
└────────┬────────┘
         │ API
         ▼
┌─────────────────────────┐
│  Replay Fetcher         │
│  - Poll for new replays │
│  - Filter by criteria   │
│  - Download events      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Event Parser           │
│  - Parse rrweb events   │
│  - Extract actions      │
│  - Extract network      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Test Generator         │
│  - Create Playwright    │
│  - Add network mocks    │
│  - Add assertions       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Test Runner (CI)       │
│  - Run on base commit   │
│  - Run on head commit   │
│  - Compare results      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Visual Diff Engine     │
│  - Screenshot compare   │
│  - Generate reports     │
│  - Alert on regressions │
└─────────────────────────┘
```

## Business Viability

### Target Users
1. Teams already using Sentry for error monitoring
2. Companies wanting to reduce QA costs
3. Projects with complex user flows
4. High-traffic consumer applications

### Competitive Positioning
- **vs. Meticulous.ai**: Lower setup (use existing Sentry), error-focused
- **vs. Manual Testing**: Automated, continuous, real user flows
- **vs. Unit Tests**: Integration-level, actual user behavior

### Pricing Model Ideas
- Tiered by number of replays processed/month
- Per-seat for team collaboration
- Enterprise: Self-hosted option

## Conclusion

**This research proves the concept is technically viable.** The core components work:
- Sentry API is accessible and well-structured
- Replay data contains useful metadata
- Test generation is straightforward
- Coverage analysis provides value

**The main challenge is depth, not breadth.** We can build the pipeline, but need to invest in:
1. Deep event parsing (rrweb format)
2. Robust network mocking
3. Visual comparison infrastructure

**Estimated time to MVP:** 3-4 months with 1-2 engineers

**Risk Level:** Medium
- API access: ✅ Proven
- Data quality: ⚠️ Depends on Sentry setup
- Event parsing: ⚠️ Needs research
- Market fit: ⚠️ Validates need for Sentry integration

## References

- [Sentry Replays Documentation](https://docs.sentry.io/product/session-replay/)
- [rrweb - Record and Replay Web](https://github.com/rrweb-io/rrweb)
- [Playwright Test](https://playwright.dev/)
- [Meticulous.ai](https://www.meticulous.ai/)
- [Simon Willison - Async Code Research](https://simonwillison.net/2025/Nov/6/async-code-research/)

---

**Research Date:** November 8, 2025
**Status:** Proof-of-Concept Complete ✅
**Next Action:** Seek event endpoint documentation or reverse-engineer event format
