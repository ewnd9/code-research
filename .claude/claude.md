# Claude Code Configuration

## Language Preference

**All code in this repository MUST be written in TypeScript.**

### Guidelines

1. **TypeScript Only**: Always use TypeScript for new code files
2. **Type Safety**: Leverage TypeScript's type system - use interfaces, types, and proper annotations
3. **Modern Syntax**: Use ES2020+ features (async/await, optional chaining, nullish coalescing)
4. **File Extensions**: Use `.ts` for TypeScript files, `.spec.ts` for tests
5. **No JavaScript**: Do not create `.js` files - convert any existing JS to TS

### Project Structure

```
project-name/
├── src/              # TypeScript source files
│   ├── *.ts         # Implementation files
│   └── *.spec.ts    # Test files
├── dist/            # Compiled JavaScript output
├── package.json     # Node.js dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── README.md        # Documentation
```

### Required Files for New Projects

When creating a new research project, always include:

1. **package.json** - Define dependencies, scripts, metadata
2. **tsconfig.json** - TypeScript compiler configuration
3. **README.md** - Project overview, research question, approach
4. **FINDINGS.md** - Detailed research results and conclusions
5. **QUICKSTART.md** - Getting started guide

### Dependencies

Standard dependencies for research projects:

**Runtime:**
- `axios` - HTTP client for API requests
- `dotenv` - Environment variable management

**Development:**
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `@types/node` - Node.js type definitions
- `@playwright/test` - E2E testing (if needed)

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

Standard npm scripts to include:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/main.ts",
    "test": "playwright test",
    "clean": "rm -rf dist"
  }
}
```

## Research Project Guidelines

Following Simon Willison's async code research pattern:

1. **Focused Question** - Each project explores one specific technical question
2. **Working Code** - Build proof-of-concept implementations, not just documentation
3. **Document Findings** - Capture what works, what doesn't, and next steps
4. **Self-Contained** - Each project should be runnable independently

### Project Lifecycle

1. Create project folder with descriptive name
2. Set up TypeScript configuration (package.json, tsconfig.json)
3. Implement proof-of-concept
4. Document findings in FINDINGS.md
5. Create QUICKSTART.md for easy reproduction
6. Update root README.md with project summary

## Never Do

❌ Create Python files (`.py`) - use TypeScript instead
❌ Write JavaScript (`.js`) - use TypeScript
❌ Skip type annotations - leverage TypeScript's type system
❌ Commit without documentation - always include README/FINDINGS
❌ Create projects without runnable code - build working implementations

## Always Do

✅ Use TypeScript for all code
✅ Include proper type definitions and interfaces
✅ Add JSDoc comments for public APIs
✅ Create QUICKSTART.md for easy setup
✅ Document research findings thoroughly
✅ Follow async code research pattern
✅ Make projects self-contained and reproducible
