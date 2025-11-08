# Code Research Projects

Async code research experiments following [Simon Willison's approach](https://simonwillison.net/2025/Nov/6/async-code-research/).

Each folder contains a focused research question, implementation experiments, and findings.

**Language:** All projects are implemented in **TypeScript** for type safety and modern development practices.

## Projects

### [sentry-replays-meticulous](./sentry-replays-meticulous/)
**Research Question:** Can we build a meticulous.ai-style automated testing system using Sentry's session replay data?

**Status:** ✅ Proof-of-Concept Complete

**Key Findings:**
- Sentry API provides comprehensive replay metadata
- Test generation from real user sessions is viable
- Main challenge: parsing detailed event data (rrweb format)
- Estimated MVP: 3-4 months with 1-2 engineers

**Components:**
- Sentry API client for fetching replays (TypeScript + axios)
- Replay analyzer for extracting test patterns
- Playwright test generator
- Coverage analysis tools
- Full TypeScript type safety

**Quick Start:**
```bash
cd sentry-replays-meticulous
npm install
export SENTRY_AUTH_TOKEN='your-token'
export SENTRY_ORG_SLUG='your-org'
npm run example
```

See the [project README](./sentry-replays-meticulous/README.md) for details.

---

## About This Repository

This repository demonstrates the "async code research" pattern:

1. **Pick a research question** - Focus on exploring a specific technical possibility
2. **Build proof-of-concept** - Create working code to validate the hypothesis
3. **Document findings** - Record what works, what doesn't, and next steps
4. **Move on** - Each project is self-contained and complete

Benefits:
- Rapid exploration of new ideas
- Low commitment (hours to days, not weeks)
- Sharable artifacts for future reference
- Learning through building

## Methodology

Each research project includes:

- **README.md** - Research question, background, approach
- **TypeScript Code** - Working proof-of-concept implementation
- **FINDINGS.md** - Detailed results, limitations, next steps
- **QUICKSTART.md** - How to run and use the code
- **package.json** - Dependencies and npm scripts
- **tsconfig.json** - TypeScript configuration

### Technology Stack

- **TypeScript** - All code is written in TypeScript for type safety
- **Node.js** - Runtime environment
- **npm** - Package management
- **Modern ES2020+** - Latest JavaScript features

## Contributing

Feel free to:
- Suggest new research questions
- Improve existing implementations
- Share your own findings
- Ask questions via issues

## License

MIT - See individual projects for specific attributions
