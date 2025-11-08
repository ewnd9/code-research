# Claude Code Configuration

## Language and Runtime

**All code in this repository MUST be written in TypeScript and run with Bun.**

### Core Requirements

1. **TypeScript Only**: Always use TypeScript for new code files
2. **Bun Runtime**: Always use Bun as the JavaScript runtime (never Node.js)
3. **mise for Installation**: Use mise to manage Bun installation
4. **Type Safety**: Leverage TypeScript's type system - use interfaces, types, and proper annotations
5. **Modern Syntax**: Use ES2020+ features (async/await, optional chaining, nullish coalescing)
6. **File Extensions**: Use `.ts` for TypeScript files, `.spec.ts` for tests
7. **No JavaScript**: Do not create `.js` files - convert any existing JS to TS

### Project Structure

```
project-name/
├── src/              # TypeScript source files
│   ├── *.ts         # Implementation files
│   └── *.spec.ts    # Test files (Bun's built-in test runner)
├── .mise.toml        # mise configuration for Bun
├── package.json      # Bun dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # Documentation
```

### Required Files for New Projects

When creating a new research project, always include:

1. **.mise.toml** - mise configuration with `bun = "latest"`
2. **package.json** - Define dependencies, scripts, metadata (with `"type": "module"`)
3. **tsconfig.json** - TypeScript compiler configuration
4. **README.md** - Project overview, research question, approach
5. **FINDINGS.md** - Detailed research results and conclusions
6. **QUICKSTART.md** - Getting started guide with Bun/mise installation steps

### Dependencies

Standard dependencies for research projects:

**Runtime:**
- `axios` - HTTP client for API requests (Bun has built-in `fetch`, but axios is fine too)

**Development:**
- `@types/node` - Node.js type definitions (for compatibility)
- `bun-types` - Bun-specific type definitions
- `@playwright/test` - E2E testing (if needed)

**Note**: Bun has built-in:
- TypeScript transpilation (no need for `typescript` package in most cases)
- Test runner (no need for `jest`, `vitest`, etc.)
- Package manager (no need for `npm` or `yarn`)
- Bundler (no need for `webpack`, `esbuild`, etc.)

### Code Style

- Use **4 spaces** for indentation (or 2 spaces, be consistent)
- Use **single quotes** for strings (except when avoiding escapes)
- Use **async/await** instead of `.then()` chains
- Export classes and interfaces for reusability
- Add JSDoc comments for public APIs

### Example TypeScript Class

```typescript
/**
 * Example API client demonstrating proper TypeScript patterns
 */
export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || process.env.API_KEY || '';
  }

  async fetchData<T>(endpoint: string): Promise<T> {
    const response = await axios.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.data;
  }
}
```

### Scripts Convention

Standard Bun scripts to include:

```json
{
  "type": "module",
  "scripts": {
    "dev": "bun run src/main.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "test": "bun test",
    "test:playwright": "bunx playwright test",
    "clean": "rm -rf dist generated-tests node_modules"
  }
}
```

**Command Reference:**
- `bun install` - Install dependencies (like `npm install`)
- `bun run <script>` - Run a script (like `npm run`)
- `bun run <file.ts>` - Run a TypeScript file directly
- `bunx <package>` - Run a package binary (like `npx`)
- `bun test` - Run tests with Bun's built-in test runner

## Research Project Guidelines

Following Simon Willison's async code research pattern:

1. **Focused Question** - Each project explores one specific technical question
2. **Working Code** - Build proof-of-concept implementations, not just documentation
3. **Document Findings** - Capture what works, what doesn't, and next steps
4. **Self-Contained** - Each project should be runnable independently

### Project Lifecycle

1. Create project folder with descriptive name
2. Create `.mise.toml` with `bun = "latest"`
3. Set up TypeScript configuration (package.json with `"type": "module"`, tsconfig.json)
4. Run `mise install` to install Bun
5. Run `bun install` to install dependencies
6. Implement proof-of-concept using Bun
7. Document findings in FINDINGS.md
8. Create QUICKSTART.md with mise/Bun installation steps
9. Update root README.md with project summary

## Never Do

❌ Create Python files (`.py`) - use TypeScript instead
❌ Write JavaScript (`.js`) - use TypeScript
❌ Use Node.js or npm - always use Bun
❌ Use `npm install`, `npm run`, `npx` - use `bun install`, `bun run`, `bunx`
❌ Install `ts-node` or `typescript` package unnecessarily - Bun runs TypeScript natively
❌ Skip type annotations - leverage TypeScript's type system
❌ Commit without documentation - always include README/FINDINGS
❌ Create projects without runnable code - build working implementations
❌ Forget to add `.mise.toml` for new projects

## Always Do

✅ Use TypeScript for all code
✅ Use Bun as the runtime (never Node.js)
✅ Use mise to manage Bun installation
✅ Add `.mise.toml` with `bun = "latest"` to every project
✅ Set `"type": "module"` in package.json
✅ Use `bun` commands (install, run, test, build)
✅ Include proper type definitions and interfaces
✅ Add `bun-types` to devDependencies
✅ Add JSDoc comments for public APIs
✅ Create QUICKSTART.md with mise/Bun installation instructions
✅ Document research findings thoroughly
✅ Follow async code research pattern
✅ Make projects self-contained and reproducible
