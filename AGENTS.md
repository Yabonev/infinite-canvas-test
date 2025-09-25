# AI Agent Development Workflow

**Version:** 1.0.0  
**Last Updated:** 2025-09-25  
**Purpose:** Define the workflow for AI agents implementing the infinite canvas application

---

## Table of Contents

1. [Agent Overview](#agent-overview)
2. [Development Workflow](#development-workflow)
3. [Task Execution Protocol](#task-execution-protocol)
4. [Testing Strategy](#testing-strategy)
5. [PR Creation Guidelines](#pr-creation-guidelines)
6. [Playwright MCP Integration](#playwright-mcp-integration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Code Quality Standards](#code-quality-standards)

---

## Agent Overview

This document defines how AI agents should approach development tasks for the infinite canvas project. The workflow emphasizes:

- **Small, focused tasks** - Each task should be completable in 1-2 hours
- **Test-driven development** - Write tests before or alongside implementation
- **Continuous validation** - Run and test the application after each change
- **Automated testing** - Use Playwright MCP for E2E testing
- **Clean PR practices** - Small, reviewable pull requests with clear descriptions

### Agent Capabilities Required

- File system operations (read, write, create directories)
- Command execution (npm, git, testing frameworks)
- Browser automation (Playwright MCP tools)
- Code analysis and generation
- Git operations (branch, commit, push)

---

## Development Workflow

### 1. Task Intake Phase

When receiving a new task, the agent should:

```markdown
## Task Analysis
- [ ] Read task description and acceptance criteria
- [ ] Review related code and documentation
- [ ] Identify dependencies and blockers
- [ ] Break down into subtasks if needed
- [ ] Estimate completion time (should be <2 hours)
```

### 2. Branch Creation

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/<task-id>-<brief-description>

# Examples:
# feature/IC-001-viewport-system
# feature/IC-002-keyboard-navigation
# feature/IC-003-shape-creation
```

### 3. Implementation Cycle

```markdown
## Implementation Checklist
1. [ ] Write failing test(s) for the feature
2. [ ] Implement minimum code to pass tests
3. [ ] Refactor for clarity and performance
4. [ ] Update documentation and comments
5. [ ] Run local test suite
6. [ ] Test manually with dev server
7. [ ] Write Playwright E2E test
8. [ ] Verify all tests pass
```

### 4. Testing Phase

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- viewport.test.ts

# Run E2E tests with Playwright
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### 5. PR Creation

```bash
# Stage and commit changes
git add -A
git commit -m "feat(component): brief description

- Detailed change 1
- Detailed change 2
- Fixes #issue-number"

# Push to remote
git push -u origin feature/<branch-name>

# Create PR via GitHub CLI
gh pr create --title "feat(component): Brief description" \
  --body "$(cat .github/pr_template.md)" \
  --base develop \
  --draft
```

---

## Task Execution Protocol

### Phase 1: Setup and Verification

```typescript
// AGENT_TASK_001: Initialize Development Environment
interface TaskContext {
  taskId: string;
  description: string;
  acceptanceCriteria: string[];
  estimatedTime: number; // in minutes
  dependencies: string[];
}

// Step 1: Verify environment
async function verifyEnvironment() {
  // Check Node.js version
  const nodeVersion = await exec('node --version');
  assert(nodeVersion.startsWith('v18') || nodeVersion.startsWith('v20'));
  
  // Check npm/yarn
  const packageManager = await exec('npm --version');
  assert(packageManager);
  
  // Check git
  const gitVersion = await exec('git --version');
  assert(gitVersion);
}

// Step 2: Install dependencies
async function setupProject() {
  await exec('npm install');
  await exec('npm run build');
  await exec('npm test -- --run');
}
```

### Phase 2: Implementation Pattern

```typescript
// AGENT_TASK_PATTERN: Standard Implementation Flow
class TaskExecutor {
  async execute(task: TaskContext) {
    // 1. Create test file first
    await this.writeTest(task);
    
    // 2. Run test (should fail)
    const testResult = await this.runTest(task);
    assert(testResult.failed, 'Test should fail initially');
    
    // 3. Implement feature
    await this.implement(task);
    
    // 4. Run test again (should pass)
    const finalResult = await this.runTest(task);
    assert(finalResult.passed, 'Test should pass after implementation');
    
    // 5. Run app and verify visually
    await this.runAndVerify(task);
    
    // 6. Create E2E test
    await this.createE2ETest(task);
    
    // 7. Commit and push
    await this.commitChanges(task);
  }
}
```

### Phase 3: Validation and Review

```typescript
// Validation checklist for each task
interface ValidationChecklist {
  unitTestsPassing: boolean;
  e2eTestsPassing: boolean;
  lintingPassed: boolean;
  buildSuccessful: boolean;
  manualTestCompleted: boolean;
  documentationUpdated: boolean;
  prCreated: boolean;
}

// Must be 100% complete before marking task done
function validateTask(checklist: ValidationChecklist): boolean {
  return Object.values(checklist).every(check => check === true);
}
```

---

## Testing Strategy

### Unit Testing Structure

```typescript
// src/core/viewport/__tests__/viewport.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ViewportManager } from '../ViewportManager';

describe('ViewportManager', () => {
  let viewport: ViewportManager;
  let canvas: HTMLCanvasElement;
  
  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    viewport = new ViewportManager(canvas);
  });
  
  describe('coordinate conversion', () => {
    it('should convert screen to world coordinates', () => {
      const screenPoint = { x: 400, y: 300 };
      const worldPoint = viewport.screenToWorld(screenPoint);
      expect(worldPoint).toEqual({ x: 400, y: 300 });
    });
    
    it('should handle zoom in coordinate conversion', () => {
      viewport.setZoom(2);
      const screenPoint = { x: 400, y: 300 };
      const worldPoint = viewport.screenToWorld(screenPoint);
      expect(worldPoint).toEqual({ x: 200, y: 150 });
    });
  });
});
```

### E2E Testing with Playwright MCP

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });
  
  test('should navigate between shapes with arrow keys', async ({ page }) => {
    // Create initial shapes
    await page.keyboard.press('c'); // Create class
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter'); // Create connected shape
    
    // Test navigation
    await page.keyboard.press('ArrowLeft');
    const selected = await page.locator('.shape.selected');
    await expect(selected).toHaveAttribute('data-id', /class_/);
    
    await page.keyboard.press('ArrowRight');
    const newSelected = await page.locator('.shape.selected');
    await expect(newSelected).toHaveAttribute('data-id', /class_.*_2/);
  });
  
  test('should auto-focus camera on selected shape', async ({ page }) => {
    // Create shape off-screen
    await page.keyboard.press('c');
    await page.evaluate(() => {
      window.moveSelectedShape(1000, 1000);
    });
    
    // Focus should bring shape into view
    await page.keyboard.press('f');
    await page.waitForTimeout(700); // Wait for animation
    
    const shapeBounds = await page.locator('.shape.selected').boundingBox();
    const viewportSize = await page.viewportSize();
    
    expect(shapeBounds.x).toBeGreaterThan(100);
    expect(shapeBounds.x).toBeLessThan(viewportSize.width - 100);
  });
});
```

### Playwright MCP Tool Usage

```typescript
// Agent instructions for using Playwright MCP tools

// 1. Start dev server
await bash('npm run dev');

// 2. Navigate to application
await playwright_browser_navigate({ url: 'http://localhost:5173' });

// 3. Take initial snapshot
await playwright_browser_snapshot();

// 4. Test keyboard navigation
await playwright_browser_press_key({ key: 'c' }); // Create class
await playwright_browser_snapshot(); // Verify shape created

await playwright_browser_press_key({ key: 'ArrowRight' });
await playwright_browser_snapshot(); // Verify navigation

// 5. Test shape creation workflow
await playwright_browser_press_key({ key: 'm' }); // Create method
await playwright_browser_type({ 
  element: 'Shape label input',
  ref: 'input.shape-label',
  text: 'calculateTotal'
});

// 6. Verify visual state
await playwright_browser_take_screenshot({ 
  filename: 'test-shape-creation.png',
  fullPage: false 
});

// 7. Test connections
await playwright_browser_press_key({ key: 'Control+Enter' }); // Start connection
await playwright_browser_press_key({ key: 'ArrowRight' }); // Select target
await playwright_browser_press_key({ key: 'Enter' }); // Confirm connection

// 8. Validate final state
const snapshot = await playwright_browser_snapshot();
// Verify snapshot contains expected elements and connections
```

---

## PR Creation Guidelines

### PR Size Guidelines

```yaml
PR Size Limits:
  Files Changed: <= 10
  Lines Added: <= 500
  Lines Deleted: <= 500
  Test Coverage: >= 80%
  Review Time: <= 30 minutes
```

### PR Template

```markdown
## Description
Brief description of changes (1-2 sentences)

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature with breaking changes)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Changes Made
- Bullet point list of specific changes
- Include file paths for major changes
- Reference any design decisions

## Testing
- [ ] Unit tests pass locally
- [ ] E2E tests pass locally
- [ ] Manual testing completed
- [ ] Playwright MCP tests written
- [ ] No console errors

## Screenshots/Recordings
[Include screenshots or recordings for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #[issue-number]
```

### Commit Message Format

```bash
# Format: <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore

# Examples:
feat(viewport): add smooth camera transitions
fix(navigation): correct spatial navigation direction
test(shapes): add unit tests for shape creation
docs(readme): update installation instructions
perf(rendering): optimize canvas redraw cycle
```

---

## Playwright MCP Integration

### Setup Instructions

```bash
# Install Playwright
npm install -D @playwright/test playwright

# Install browsers
npx playwright install

# Configure playwright.config.ts
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### MCP Tool Usage Patterns

```typescript
// Pattern 1: Visual Regression Testing
async function testVisualRegression() {
  await playwright_browser_navigate({ url: 'http://localhost:5173' });
  
  // Create baseline diagram
  await createTestDiagram();
  
  // Take screenshot
  await playwright_browser_take_screenshot({ 
    filename: 'baseline-diagram.png',
    fullPage: true 
  });
  
  // Make changes
  await modifyDiagram();
  
  // Take comparison screenshot
  await playwright_browser_take_screenshot({ 
    filename: 'modified-diagram.png',
    fullPage: true 
  });
  
  // Compare using image diff tools
}

// Pattern 2: Performance Testing
async function testPerformance() {
  await playwright_browser_navigate({ url: 'http://localhost:5173' });
  
  // Measure initial load
  const metrics = await playwright_browser_evaluate({
    function: `() => performance.getEntriesByType('navigation')[0]`
  });
  
  // Create many shapes
  for (let i = 0; i < 100; i++) {
    await playwright_browser_press_key({ key: 'c' });
    await playwright_browser_evaluate({
      function: `() => window.moveSelectedShape(${i * 50}, ${i * 50})`
    });
  }
  
  // Measure frame rate
  const fps = await playwright_browser_evaluate({
    function: `() => window.measureFPS()`
  });
  
  assert(fps >= 30, 'Frame rate should be at least 30fps with 100 shapes');
}

// Pattern 3: Accessibility Testing
async function testAccessibility() {
  await playwright_browser_navigate({ url: 'http://localhost:5173' });
  
  // Get accessibility tree
  const snapshot = await playwright_browser_snapshot();
  
  // Verify ARIA labels
  assert(snapshot.includes('role="application"'));
  assert(snapshot.includes('aria-label="Infinite Canvas"'));
  
  // Test keyboard navigation
  await playwright_browser_press_key({ key: 'Tab' });
  const focusedElement = await playwright_browser_evaluate({
    function: `() => document.activeElement.getAttribute('aria-label')`
  });
  
  assert(focusedElement, 'Focused element should have ARIA label');
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Check formatting
        run: npm run format:check

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Check bundle size
        run: |
          npm run build:analyze
          # Fail if bundle exceeds 500KB
          MAX_SIZE=512000
          BUNDLE_SIZE=$(stat -f%z dist/assets/*.js | head -1)
          if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
            echo "Bundle size exceeds limit: $BUNDLE_SIZE > $MAX_SIZE"
            exit 1
          fi

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security audit
        run: npm audit --audit-level=moderate
```

### Branch Protection Rules

```yaml
# GitHub Branch Protection Settings for 'main'
Protection Rules:
  Required Reviews: 1
  Dismiss Stale Reviews: true
  Require Review from CODEOWNERS: false
  Required Status Checks:
    - lint
    - test-unit
    - test-e2e
    - build
    - security
  Require Branches Up to Date: true
  Include Administrators: false
  Allow Force Pushes: false
  Allow Deletions: false

# Protected branches
Branches:
  main: 
    - No direct pushes
    - All changes via PR
    - Automatic deployment on merge
  develop:
    - Feature branches merge here
    - Daily automated tests
    - Staging deployment
```

---

## Code Quality Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}
```

---

## Agent Task Examples

### Example 1: Implement Viewport System

```markdown
## Task: IC-001 - Implement Viewport System

### Input
- Task ID: IC-001
- Description: Implement the core viewport system for infinite canvas
- Acceptance Criteria:
  - [ ] Pan and zoom functionality
  - [ ] Coordinate conversion (screen ↔ world)
  - [ ] Viewport bounds calculation
  - [ ] Smooth animations
  - [ ] 60fps performance

### Agent Execution Steps

1. Create feature branch
   ```bash
   git checkout -b feature/IC-001-viewport-system
   ```

2. Create test file
   ```bash
   mkdir -p src/core/viewport/__tests__
   touch src/core/viewport/__tests__/viewport.test.ts
   ```

3. Write failing tests
   - Test coordinate conversion
   - Test zoom functionality
   - Test pan operations
   - Test animation system

4. Copy and adapt viewport-system.ts snippet
   ```bash
   mkdir -p src/core/viewport
   cp docs/research/infinite-canvas-drawing/SNIPPETS/viewport-system.ts \
      src/core/viewport/ViewportManager.ts
   ```

5. Run tests
   ```bash
   npm test -- viewport.test.ts
   ```

6. Start dev server and test manually
   ```bash
   npm run dev
   # Use playwright_browser_navigate to test
   ```

7. Create E2E test
   ```bash
   touch tests/e2e/viewport.spec.ts
   # Write Playwright test for viewport operations
   ```

8. Commit and create PR
   ```bash
   git add -A
   git commit -m "feat(viewport): implement core viewport system
   
   - Add ViewportManager class with pan/zoom
   - Implement coordinate conversion methods
   - Add smooth animation transitions
   - Include comprehensive test coverage"
   
   git push -u origin feature/IC-001-viewport-system
   gh pr create --title "feat(viewport): Core viewport system" \
     --body "$(cat .github/pr_template.md)" \
     --base develop
   ```

### Output
- ViewportManager class implemented
- 95% test coverage
- E2E tests passing
- PR #1 created and ready for review
```

### Example 2: Add Keyboard Navigation

```markdown
## Task: IC-002 - Implement Keyboard Navigation

### Prerequisites
- IC-001 (Viewport System) completed

### Input
- Task ID: IC-002
- Description: Implement spatial keyboard navigation
- Acceptance Criteria:
  - [ ] Arrow key navigation between shapes
  - [ ] Tab/Shift+Tab sequential navigation
  - [ ] Auto-focus camera on selection
  - [ ] Visual selection indicators
  - [ ] Vim-style navigation support

### Agent Execution Steps

1. Create feature branch
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/IC-002-keyboard-navigation
   ```

2. Write tests first
   - Test spatial navigation algorithm
   - Test focus management
   - Test camera auto-focus
   - Test keyboard shortcut handling

3. Implement KeyboardNavigationManager
   - Adapt keyboard-navigation.ts snippet
   - Integrate with ViewportManager
   - Add event handling
   - Implement spatial algorithms

4. Test with Playwright MCP
   ```typescript
   // Use playwright tools to test navigation
   await playwright_browser_navigate({ url: 'http://localhost:5173' });
   await playwright_browser_press_key({ key: 'c' }); // Create shape
   await playwright_browser_press_key({ key: 'ArrowRight' });
   await playwright_browser_snapshot(); // Verify navigation
   ```

5. Create comprehensive E2E tests

6. Document keyboard shortcuts

7. Create PR with demo video
```

---

## Performance Monitoring

### Key Metrics to Track

```typescript
interface PerformanceMetrics {
  fps: number;                    // Target: >= 60
  renderTime: number;              // Target: < 16ms
  memoryUsage: number;             // Target: < 100MB
  shapeCount: number;              // Support: > 1000
  inputLatency: number;            // Target: < 50ms
  animationSmoothness: number;     // Target: > 0.95
}

// Agent should measure and report these metrics
async function measurePerformance() {
  const metrics = await playwright_browser_evaluate({
    function: `() => window.performanceMonitor.getMetrics()`
  });
  
  // Validate against targets
  assert(metrics.fps >= 60, 'FPS below target');
  assert(metrics.renderTime < 16, 'Render time too high');
  assert(metrics.memoryUsage < 100000000, 'Memory usage excessive');
}
```

---

## Troubleshooting Guide

### Common Issues and Solutions

```markdown
## Build Failures
- Clear node_modules and reinstall
- Check Node.js version (requires 18+)
- Verify all dependencies in package.json

## Test Failures
- Run tests in isolation first
- Check for timing issues in E2E tests
- Verify test environment setup
- Use --debug flag for detailed output

## Playwright MCP Issues
- Ensure dev server is running
- Check port availability (5173)
- Verify browser installation
- Use headed mode for debugging

## Performance Problems
- Profile with Chrome DevTools
- Check for memory leaks
- Optimize render cycles
- Implement viewport culling
```

---

## Success Metrics

### Sprint Success Criteria

```yaml
Sprint Metrics:
  Test Coverage: >= 80%
  E2E Test Pass Rate: 100%
  Build Time: < 2 minutes
  Bundle Size: < 500KB
  Lighthouse Score: >= 90
  Zero Critical Vulnerabilities: true
  PR Review Time: < 30 minutes
  Deployment Success Rate: 100%
```

### Weekly Checkpoints

```markdown
## Week 1 Checkpoint
- [ ] Repository initialized with CI/CD
- [ ] Basic canvas rendering working
- [ ] Viewport system implemented
- [ ] 10+ unit tests passing
- [ ] 3+ E2E tests passing

## Week 2 Checkpoint  
- [ ] Keyboard navigation complete
- [ ] Auto-focus camera working
- [ ] 25+ unit tests passing
- [ ] 8+ E2E tests passing
- [ ] Performance targets met
```

---

## Appendix: Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Testing
npm test                       # Run all tests
npm run test:unit             # Run unit tests only
npm run test:e2e              # Run E2E tests
npm run test:coverage         # Generate coverage report

# Code Quality
npm run lint                  # Run ESLint
npm run lint:fix              # Fix linting issues
npm run format                # Format with Prettier
npm run type-check            # TypeScript checking

# Git Operations
git checkout -b feature/name  # Create feature branch
git add -A                    # Stage all changes
git commit -m "type: msg"     # Commit with convention
git push -u origin branch     # Push to remote
gh pr create                  # Create pull request

# Playwright MCP
playwright_browser_navigate   # Navigate to URL
playwright_browser_snapshot   # Capture accessibility tree
playwright_browser_click      # Click element
playwright_browser_press_key  # Press keyboard key
playwright_browser_type       # Type text
playwright_browser_screenshot # Take screenshot
```

---

This workflow ensures consistent, high-quality development with comprehensive testing and small, reviewable PRs. Each agent task should follow this structure for predictable, reliable results.