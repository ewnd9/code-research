# Quick Start Guide

## Prerequisites

- Bun runtime installed (via mise)
- Modern web browser (Chrome, Firefox, Edge)

## Setup (2 minutes)

### 1. Install Dependencies

```bash
bun install
```

## Usage

### Step 1: Record a Session

1. **Open the demo page:**
   ```bash
   # Serve the demo page (or just open demo.html in your browser)
   open demo.html
   ```

2. **Record interactions:**
   - Click "Start Recording"
   - Interact with the page:
     - Fill in the form fields
     - Check/uncheck boxes
     - Click buttons
     - Add list items
   - Click "Stop Recording"
   - Click "Download Recording"

3. **Save the recording:**
   ```bash
   mkdir -p recordings
   # Move downloaded file to: recordings/my-session.json
   ```

### Step 2: Parse the Recording

View what was captured:

```bash
bun run src/parser.ts recordings/my-session.json
```

**Output:**
```
Loaded 156 events from recordings/my-session.json

=== Parsed Playwright Test ===

URL: file:///path/to/demo.html
Viewport: 1920x1080
Duration: 12543ms
Actions: 15

=== Actions ===

[1234ms] navigation: { url: 'file://...' }
[1235ms] viewport: { width: 1920, height: 1080 }
[2456ms] click: { selector: '[data-testid="name-input"]' }
[2567ms] input: { selector: '[data-testid="name-input"]', value: 'John Doe' }
[3891ms] click: { selector: '[data-testid="email-input"]' }
[4012ms] input: { selector: '[data-testid="email-input"]', value: 'john@example.com' }
...

=== Event Statistics ===

Meta: 1
FullSnapshot: 1
IncrementalSnapshot: 145
  Incremental.MouseMove: 78
  Incremental.MouseInteraction: 12
  Incremental.Input: 8
  Incremental.Scroll: 2
```

### Step 3: Generate Playwright Test

Convert to executable test:

```bash
bun run src/generator.ts recordings/my-session.json
```

**Output:**
```
=== rrweb to Playwright Generator ===

=== Conversion Summary ===

URL: file:///path/to/demo.html
Viewport: 1920x1080
Duration: 12543ms (12.5s)
Total Actions: 15

Action Breakdown:
  - navigation: 1
  - viewport: 1
  - click: 6
  - input: 7

✓ Generated test: ./generated-tests/my-session.spec.ts

To run the generated test:
  bun test:playwright ./generated-tests/my-session.spec.ts
```

### Step 4: Review Generated Test

```bash
cat generated-tests/my-session.spec.ts
```

**Generated Code:**
```typescript
import { test, expect } from '@playwright/test';

test('my-session', async ({ page }) => {
  // Generated from rrweb recording
  // Duration: 12543ms
  // Actions: 15

  // Navigate to page
  await page.goto('file:///path/to/demo.html');

  // Set viewport size
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Fill: [data-testid="name-input"]
  await page.fill('[data-testid="name-input"]', 'John Doe');

  // Fill: [data-testid="email-input"]
  await page.fill('[data-testid="email-input"]', 'john@example.com');

  // Check: [data-testid="newsletter-checkbox"]
  await page.check('[data-testid="newsletter-checkbox"]');

  // Click: [data-testid="submit-button"]
  await page.click('[data-testid="submit-button"]');

  // Wait for page to be stable
  await page.waitForLoadState('networkidle');

  // Take screenshot for visual verification
  await page.screenshot({ path: 'test-results/my-session.png' });
});
```

### Step 5: Run the Test

```bash
# Install Playwright browsers (first time only)
bunx playwright install

# Run the generated test
bun test:playwright generated-tests/my-session.spec.ts

# View results
bunx playwright show-report
```

## Tips for Better Recordings

### 1. Use data-testid Attributes

**Good:** Elements with `data-testid`:
```html
<input data-testid="email-input" type="email" name="email">
<button data-testid="submit-button">Submit</button>
```

**Result:** Stable selectors in generated tests:
```typescript
await page.fill('[data-testid="email-input"]', 'test@example.com');
await page.click('[data-testid="submit-button"]');
```

**Bad:** Elements without stable identifiers:
```html
<input type="email" class="form-input">
<button class="btn btn-primary">Submit</button>
```

**Result:** Fragile selectors:
```typescript
await page.fill('input.form-input', '...');  // Breaks if CSS changes
await page.click('button.btn-primary', '...'); // Non-unique selector
```

### 2. Keep Sessions Short

- **Ideal:** 30-60 seconds
- **Max:** 2-3 minutes
- Shorter sessions = smaller files, faster tests

### 3. Avoid Mouse Movements

rrweb captures every mouse move by default, creating large files. For test generation, you only need clicks and inputs.

### 4. Record Complete Flows

Start from a clean state and complete the entire user journey in one recording:

- ✅ Login → Browse → Checkout → Confirm
- ❌ Random clicking without clear goal

### 5. Use Multiple Recordings

Create separate recordings for different scenarios:

```
recordings/
├── happy-path.json       # Successful flow
├── validation-errors.json # Form errors
├── empty-cart.json       # Edge case
└── guest-checkout.json   # Alternative flow
```

## Advanced Usage

### Batch Convert Multiple Recordings

```bash
# Convert all recordings in a folder
for file in recordings/*.json; do
  bun run src/generator.ts "$file"
done
```

### Customize Test Generation

Edit `src/generator.ts` to:
- Add custom assertions
- Change wait strategies
- Modify selector generation
- Add test setup/teardown

### Filter Events

Modify `src/parser.ts` to:
- Skip mouse movements
- Filter by time range
- Extract only specific actions
- Group related interactions

## Troubleshooting

### "No recording file found"

Make sure you've:
1. Recorded a session using demo.html
2. Downloaded the JSON file
3. Moved it to `recordings/` folder

### "Could not resolve selector"

Some elements don't have stable identifiers. Add `data-testid` attributes:

```html
<!-- Before -->
<button class="btn">Click me</button>

<!-- After -->
<button class="btn" data-testid="action-button">Click me</button>
```

### Tests failing to run

Install Playwright browsers:
```bash
bunx playwright install chromium
```

### Large file sizes

Disable mouse tracking in demo.html:

```javascript
stopFn = rrweb.record({
  emit(event) { events.push(event); },
  recordCanvas: true,
  collectFonts: true,
  sampling: {
    mousemove: false,  // ← Disable mouse tracking
  }
});
```

## Next Steps

1. **Try with your app:** Add rrweb recording to your application
2. **Add assertions:** Enhance generated tests with `expect()` statements
3. **Integrate CI/CD:** Run tests in your pipeline
4. **Visual testing:** Use Playwright's screenshot comparison
5. **Read FINDINGS.md:** Understand pros, cons, and best practices

## Example Workflow

```bash
# 1. Install dependencies
bun install

# 2. Open demo page and record session
open demo.html
# (Click "Start Recording", interact, "Stop Recording", "Download")

# 3. Move recording
mv ~/Downloads/rrweb-recording-*.json recordings/demo-session.json

# 4. Generate test
bun run src/generator.ts recordings/demo-session.json

# 5. Run test
bun test:playwright generated-tests/demo-session.spec.ts

# 6. View report
bunx playwright show-report
```

## Learning Resources

- [rrweb Documentation](https://github.com/rrweb-io/rrweb)
- [Playwright Documentation](https://playwright.dev/)
- [FINDINGS.md](./FINDINGS.md) - Detailed research findings
- [README.md](./README.md) - Project overview
