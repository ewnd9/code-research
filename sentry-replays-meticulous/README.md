# Sentry Replays + Meticulous.ai Clone Research

## Research Question

Can we build a meticulous.ai-style automated testing system using Sentry's session replay data instead of building custom recording infrastructure?

## Background

### Meticulous.ai
Meticulous.ai is an automated testing platform that:
- Records user sessions from production/staging environments
- Replays those sessions on different versions of code (base vs. head)
- Captures visual snapshots during replay
- Compares snapshots to detect visual regressions
- Uses network mocking to make tests deterministic
- Provides intelligent coverage tracking

### Sentry Replays
Sentry provides session replay functionality with:
- API endpoint: `GET /api/0/organizations/{org}/replays/`
- Bearer token authentication (requires `org:read`, `org:write`, or `org:admin` scope)
- Rich filtering options (time range, project, environment)
- Detailed replay data including user actions, network requests, errors
- Metadata like browser, device, OS, duration, error counts

## Hypothesis

By leveraging Sentry's existing replay infrastructure, we can build a simplified meticulous.ai clone that:
1. Fetches replay sessions via Sentry API
2. Extracts user interaction patterns and network data
3. Replays sessions on test environments
4. Compares visual/functional outcomes
5. Detects regressions without manual test writing

## Approach

### Phase 1: Data Access
- Build Sentry API client to fetch replays
- Understand replay data format
- Extract actionable events (clicks, inputs, navigations)

### Phase 2: Replay Engine
- Parse Sentry replay events
- Build DOM event dispatcher
- Implement network request mocking
- Capture screenshots during replay

### Phase 3: Comparison
- Store baseline snapshots
- Compare new vs. baseline
- Detect visual differences
- Report regressions

## Key Challenges

1. **Replay Format**: Sentry's replay format may differ from standard recording formats
2. **Network Mocking**: Need to extract and mock network calls from replay data
3. **Determinism**: Browser behavior must be deterministic (dates, random, etc.)
4. **Event Timing**: Accurate replay of timing-dependent interactions
5. **Coverage Tracking**: Mapping replays to code coverage

## Success Criteria

- Successfully fetch and parse Sentry replay data
- Replay at least one user session in a controlled environment
- Capture and compare screenshots
- Identify one visual regression

## Next Steps

1. Set up Sentry API authentication
2. Fetch sample replay data
3. Analyze replay event structure
4. Build minimal replay engine
5. Proof-of-concept with simple web app

## References

- [Sentry Replays API](https://docs.sentry.io/api/replays/list-an-organizations-replays/)
- [Meticulous.ai How It Works](https://www.meticulous.ai/how-it-works)
- [Simon Willison - Async Code Research](https://simonwillison.net/2025/Nov/6/async-code-research/)
