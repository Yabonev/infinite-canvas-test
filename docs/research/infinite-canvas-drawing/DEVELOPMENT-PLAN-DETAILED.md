# Detailed Implementation Plan: Infinite Canvas Application

**Version:** 2.0.0  
**Last Updated:** 2025-09-25  
**Estimated Timeline:** 8-10 weeks  
**Development Methodology:** AI-Assisted TDD with Continuous Integration

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Week-by-Week Implementation](#week-by-week-implementation)
3. [Detailed Task Specifications](#detailed-task-specifications)
4. [Testing Requirements](#testing-requirements)
5. [Performance Benchmarks](#performance-benchmarks)
6. [Integration Points](#integration-points)

---

## Project Architecture

### Technology Stack

```yaml
Frontend:
  Framework: React 18.2+ with TypeScript 5.3+
  Build Tool: Vite 5.0+
  Rendering: Konva.js 9.3+ with react-konva
  State Management: Zustand 4.4+
  Styling: Styled Components 6.1+
  Animation: Framer Motion 11.0+ (for UI elements)

Testing:
  Unit Tests: Vitest 1.2+
  E2E Tests: Playwright 1.40+
  Visual Regression: Percy (optional)
  Coverage: Istanbul/c8

Development:
  Package Manager: npm 10+
  Node Version: 20.x LTS
  Linting: ESLint 8.56+ with TypeScript plugin
  Formatting: Prettier 3.2+
  Pre-commit: Husky 9.0+ with lint-staged

CI/CD:
  Platform: GitHub Actions
  Deployment: Vercel/Netlify (static hosting)
  Monitoring: Sentry for error tracking
  Analytics: Posthog (privacy-focused)
```

### Project Structure

```
infinite-canvas-diagram/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Main CI pipeline
│   │   ├── e2e-tests.yml       # E2E test workflow
│   │   └── deploy.yml          # Deployment workflow
│   ├── pull_request_template.md
│   └── CODEOWNERS
├── docs/
│   ├── architecture/           # Architecture decisions
│   ├── api/                    # API documentation
│   └── guides/                  # User guides
├── public/
│   └── assets/                 # Static assets
├── src/
│   ├── core/                   # Core business logic
│   │   ├── viewport/
│   │   │   ├── ViewportManager.ts
│   │   │   ├── ViewportContext.tsx
│   │   │   └── __tests__/
│   │   ├── navigation/
│   │   │   ├── KeyboardNavigation.ts
│   │   │   ├── SpatialNavigation.ts
│   │   │   └── __tests__/
│   │   ├── shapes/
│   │   │   ├── ShapeManager.ts
│   │   │   ├── ShapeFactory.ts
│   │   │   └── __tests__/
│   │   └── connections/
│   │       ├── ConnectionManager.ts
│   │       ├── ArrowRenderer.ts
│   │       └── __tests__/
│   ├── components/              # React components
│   │   ├── Canvas/
│   │   │   ├── InfiniteCanvas.tsx
│   │   │   ├── CanvasControls.tsx
│   │   │   └── __tests__/
│   │   ├── Shapes/
│   │   │   ├── ClassShape.tsx
│   │   │   ├── MethodShape.tsx
│   │   │   └── InterfaceShape.tsx
│   │   ├── UI/
│   │   │   ├── Toolbar.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   ├── KeyboardHelp.tsx
│   │   │   └── ContextMenu.tsx
│   │   └── Layout/
│   │       └── AppLayout.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useKeyboard.ts
│   │   ├── useViewport.ts
│   │   ├── useSelection.ts
│   │   └── usePerformance.ts
│   ├── stores/                  # Zustand stores
│   │   ├── diagramStore.ts
│   │   ├── uiStore.ts
│   │   └── historyStore.ts
│   ├── utils/                   # Utility functions
│   │   ├── geometry.ts
│   │   ├── performance.ts
│   │   └── testing.ts
│   ├── types/                   # TypeScript types
│   │   ├── diagram.ts
│   │   ├── navigation.ts
│   │   └── api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── e2e/                     # Playwright E2E tests
│   │   ├── navigation.spec.ts
│   │   ├── shapes.spec.ts
│   │   └── performance.spec.ts
│   ├── fixtures/                # Test fixtures
│   └── utils/                   # Test utilities
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── AGENTS.md                    # AI agent workflow
├── package.json
├── playwright.config.ts
├── README.md
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Week-by-Week Implementation

### Week 0: Project Setup and Infrastructure (2 days)

#### Day 1: Repository and CI/CD Setup

**Task IC-000: Initialize Project**

```bash
# Commands for AI agent to execute
npm create vite@latest infinite-canvas-diagram -- --template react-ts
cd infinite-canvas-diagram
git init
git add -A
git commit -m "chore: initial project setup with Vite + React + TypeScript"

# Install core dependencies
npm install konva react-konva zustand styled-components framer-motion
npm install -D @types/konva @types/styled-components

# Install dev dependencies
npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event
npm install -D @playwright/test
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D husky lint-staged
```

**Configuration Files to Create:**

1. `tsconfig.json` (strict mode with all checks)
2. `.eslintrc.cjs` (with TypeScript and React rules)
3. `.prettierrc` (consistent formatting)
4. `vite.config.ts` (with aliases and optimizations)
5. `playwright.config.ts` (E2E test configuration)

#### Day 2: GitHub Setup and Branch Protection

**Task IC-000B: Configure GitHub Repository**

```bash
# Create GitHub repository
gh repo create infinite-canvas-diagram --public --description "Keyboard-first infinite canvas for code visualization"

# Set up branches
git branch develop
git checkout develop
git push -u origin develop

# Configure branch protection via GitHub CLI
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","test-unit","test-e2e","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

---

### Week 1: Core Canvas and Viewport System

#### Day 1-2: Viewport Implementation

**Task IC-001: Core Viewport System**

```typescript
// Detailed implementation specification
interface ViewportSpecification {
  features: [
    'Infinite pan in all directions',
    'Smooth zoom with mouse wheel and keyboard',
    'Coordinate system conversion (screen ↔ world)',
    'Viewport bounds calculation for culling',
    'Animated transitions with easing',
    'Touch gesture support (optional)',
  ];
  
  performance: {
    panLatency: '<16ms';
    zoomLatency: '<16ms';
    animationFPS: '60fps';
    memoryUsage: '<10MB for viewport ops';
  };
  
  api: {
    methods: [
      'pan(deltaX, deltaY)',
      'zoomAt(point, factor)',
      'focusOnBounds(bounds, padding?, duration?)',
      'screenToWorld(point)',
      'worldToScreen(point)',
      'getVisibleBounds()',
      'isVisible(bounds)',
    ];
    
    events: [
      'onViewportChange',
      'onZoomChange',
      'onPanStart',
      'onPanEnd',
    ];
  };
}
```

**Test Requirements:**

```typescript
// Tests to implement (minimum 15 test cases)
describe('ViewportManager', () => {
  // Coordinate conversion tests (5 cases)
  test('converts screen to world coordinates at default zoom');
  test('converts world to screen coordinates at default zoom');
  test('handles coordinate conversion with zoom');
  test('handles coordinate conversion with pan offset');
  test('handles coordinate conversion with both zoom and pan');
  
  // Pan operation tests (3 cases)
  test('pans viewport by delta values');
  test('emits pan events');
  test('maintains zoom level during pan');
  
  // Zoom operation tests (4 cases)
  test('zooms at specific point');
  test('clamps zoom within min/max bounds');
  test('maintains point position during zoom');
  test('emits zoom events');
  
  // Animation tests (3 cases)
  test('animates to target viewport');
  test('uses easing function');
  test('cancels animation on manual control');
});
```

#### Day 3-4: Canvas Integration

**Task IC-002: Konva.js Canvas Setup**

```typescript
interface CanvasSpecification {
  layers: {
    background: 'Grid or solid color';
    shapes: 'All diagram elements';
    connections: 'Arrows and lines';
    overlay: 'Selection, hover effects';
    ui: 'Non-canvas UI elements';
  };
  
  rendering: {
    strategy: 'Viewport culling';
    batchUpdates: true;
    offscreenCanvas: 'For complex shapes';
    pixelRatio: 'Device pixel ratio support';
  };
  
  interaction: {
    hitDetection: 'Optimized for shapes';
    eventDelegation: 'Single listener pattern';
    touchSupport: 'Optional multitouch';
  };
}
```

**Implementation Checklist:**

```markdown
- [ ] Create InfiniteCanvas React component
- [ ] Set up Konva Stage and Layers
- [ ] Integrate ViewportManager
- [ ] Implement render loop with RAF
- [ ] Add performance monitoring
- [ ] Set up viewport culling
- [ ] Add debug overlay (optional)
- [ ] Write unit tests (10+ cases)
- [ ] Write E2E tests (3+ scenarios)
```

#### Day 5: Testing and Documentation

**Task IC-003: Week 1 Testing and Polish**

```bash
# Testing checklist for AI agent
npm test                        # All unit tests pass
npm run test:e2e -- --headed    # Visual verification
npm run build                   # Build succeeds
npm run lint                    # No linting errors
```

**Documentation to Create:**

1. `docs/architecture/viewport-system.md`
2. `docs/guides/getting-started.md`
3. `README.md` with setup instructions
4. Inline code documentation (JSDoc)

---

### Week 2: Keyboard Navigation System

#### Day 1-2: Basic Navigation

**Task IC-004: Keyboard Event Handling**

```typescript
interface KeyboardSpecification {
  shortcuts: {
    // Navigation
    'ArrowKeys': 'Spatial navigation';
    'Tab/Shift+Tab': 'Sequential navigation';
    'Home/End': 'First/last shape';
    'PageUp/PageDown': 'Navigate by screen';
    
    // Vim-style (optional)
    'h/j/k/l': 'Left/down/up/right';
    'g/G': 'Top/bottom of diagram';
    
    // Camera
    'f': 'Focus on selected';
    'z': 'Zoom to fit all';
    'Ctrl+0': 'Reset zoom';
    'Ctrl++/-': 'Zoom in/out';
    
    // Creation
    'c': 'Create class';
    'm': 'Create method';
    'i': 'Create interface';
    'Enter': 'Create connected';
    
    // Editing
    'Delete/Backspace': 'Delete selected';
    'Ctrl+C/V': 'Copy/paste';
    'Ctrl+Z/Y': 'Undo/redo';
    'F2': 'Rename selected';
  };
  
  modes: {
    SELECT: 'Default navigation mode';
    CREATE: 'Shape creation mode';
    CONNECT: 'Connection drawing mode';
    EDIT: 'Text editing mode';
    PAN: 'Canvas panning mode';
  };
}
```

**Spatial Navigation Algorithm:**

```typescript
// Detailed algorithm specification
class SpatialNavigationAlgorithm {
  /*
   * Algorithm: Find best candidate in direction
   * 
   * 1. Filter candidates in general direction (cone angle: 90°)
   * 2. Score each candidate:
   *    - Distance score (closer is better)
   *    - Alignment score (more aligned is better)
   *    - Overlap score (more overlap is better)
   * 3. Apply weights: distance(0.5) + alignment(0.3) + overlap(0.2)
   * 4. Return highest scoring candidate
   * 
   * Edge cases:
   * - No candidates in direction: wrap around
   * - Multiple equal scores: prefer most recent
   * - Off-screen candidates: auto-scroll viewport
   */
  
  findBestCandidate(
    from: Shape,
    direction: Direction,
    candidates: Shape[]
  ): Shape | null {
    // Implementation here
  }
}
```

#### Day 3-4: Auto-Focus Camera

**Task IC-005: Camera Auto-Focus System**

```typescript
interface AutoFocusSpecification {
  triggers: [
    'Shape selection change',
    'Navigation to off-screen shape',
    'Shape creation',
    'Explicit focus command (f key)',
  ];
  
  behavior: {
    animationDuration: '300-600ms';
    easingFunction: 'ease-out-cubic';
    padding: '50-100px around shape';
    zoomAdjustment: 'Fit shape with padding';
    cancelOnUserInput: true;
  };
  
  smartFeatures: [
    'Predictive movement (anticipate direction)',
    'Grouped focus (multiple selected shapes)',
    'Context awareness (show connected shapes)',
    'Smooth chaining (queue animations)',
  ];
}
```

**Test Scenarios:**

```typescript
// E2E test scenarios with Playwright MCP
describe('Auto-Focus Camera', () => {
  test('follows selection during arrow navigation', async () => {
    // Create shapes across large canvas area
    // Navigate with arrows
    // Verify camera follows smoothly
  });
  
  test('brings off-screen shapes into view', async () => {
    // Create shape off-screen
    // Navigate to it
    // Verify viewport adjustment
  });
  
  test('handles rapid navigation changes', async () => {
    // Rapidly change selection
    // Verify no animation conflicts
    // Check final position is correct
  });
});
```

#### Day 5: Navigation Polish

**Task IC-006: Navigation Feedback and Polish**

```markdown
## Visual Feedback Requirements

1. Selection Indicators
   - Highlight color: Primary theme color
   - Outline width: 2-3px
   - Animation: Subtle pulse or glow
   - Accessibility: High contrast mode

2. Focus Indicators
   - Keyboard focus: Dashed outline
   - Hover state: Subtle highlight
   - Active state: Pressed appearance

3. Navigation Hints
   - Show possible navigation directions
   - Display keyboard shortcuts on hover
   - Breadcrumb trail for history

4. Performance
   - CSS transforms only (no repaints)
   - GPU acceleration where possible
   - Debounced updates for rapid changes
```

---

### Week 3: Shape System and Creation

#### Day 1-2: Shape Factory and Types

**Task IC-007: Shape System Architecture**

```typescript
// Shape type definitions and factory
interface ShapeSystemSpecification {
  shapeTypes: {
    class: {
      defaultSize: { width: 140, height: 100 };
      minSize: { width: 100, height: 60 };
      maxSize: { width: 300, height: 400 };
      style: {
        fill: '#f0f0f0';
        stroke: '#333';
        cornerRadius: 8;
      };
      sections: ['name', 'properties', 'methods'];
      icon: 'ClassIcon';
    };
    
    interface: {
      defaultSize: { width: 140, height: 80 };
      style: {
        fill: '#e8f4f8';
        stroke: '#0288d1';
        cornerRadius: 8;
        dashArray: [5, 5];
      };
      sections: ['name', 'methods'];
      icon: 'InterfaceIcon';
    };
    
    method: {
      defaultSize: { width: 120, height: 60 };
      style: {
        fill: '#fff3e0';
        stroke: '#f57c00';
        cornerRadius: 20;
      };
      sections: ['signature', 'params'];
      icon: 'MethodIcon';
    };
    
    property: {
      defaultSize: { width: 100, height: 40 };
      style: {
        fill: '#f3e5f5';
        stroke: '#7b1fa2';
        cornerRadius: 4;
      };
      sections: ['name', 'type'];
      icon: 'PropertyIcon';
    };
  };
  
  creation: {
    positioning: {
      strategy: 'Smart placement';
      rules: [
        'Near selected shape if exists',
        'Center of viewport if no selection',
        'Avoid overlaps with existing shapes',
        'Maintain minimum spacing (20px)',
        'Grid snapping (optional)',
      ];
    };
    
    animation: {
      type: 'Scale from center';
      duration: '200ms';
      easing: 'spring';
    };
  };
  
  interaction: {
    selection: 'Click or keyboard navigation';
    multiSelect: 'Shift+Click or Shift+Arrow';
    dragging: 'Mouse only (optional)';
    resizing: 'Corner handles (optional)';
    rotation: 'Not supported initially';
  };
}
```

**Shape Component Implementation:**

```tsx
// React component structure for shapes
interface ShapeComponentProps {
  id: string;
  type: ShapeType;
  position: Point;
  size: Size;
  data: ShapeData;
  selected: boolean;
  focused: boolean;
  connected: string[];
  onSelect: (id: string) => void;
  onEdit: (id: string, data: ShapeData) => void;
  onDelete: (id: string) => void;
}

const ClassShape: React.FC<ShapeComponentProps> = ({
  id, position, size, data, selected, focused
}) => {
  return (
    <Group x={position.x} y={position.y}>
      {/* Background */}
      <Rect
        width={size.width}
        height={size.height}
        fill={selected ? '#e3f2fd' : '#f0f0f0'}
        stroke={focused ? '#1976d2' : '#333'}
        strokeWidth={selected ? 2 : 1}
        cornerRadius={8}
        shadowBlur={selected ? 10 : 0}
      />
      
      {/* Class Name */}
      <Text
        text={data.name}
        x={10}
        y={10}
        fontSize={14}
        fontStyle="bold"
      />
      
      {/* Properties Section */}
      <Line
        points={[0, 35, size.width, 35]}
        stroke="#ccc"
        strokeWidth={1}
      />
      
      {/* Methods Section */}
      {data.methods?.map((method, i) => (
        <Text
          key={i}
          text={`• ${method}`}
          x={10}
          y={45 + i * 18}
          fontSize={12}
        />
      ))}
    </Group>
  );
};
```

#### Day 3-4: Text Editing and Labels

**Task IC-008: Inline Text Editing**

```typescript
interface TextEditingSpecification {
  trigger: [
    'Double-click on shape',
    'F2 key when selected',
    'Start typing when shape selected',
    'Enter key on empty shape',
  ];
  
  editor: {
    type: 'Inline contenteditable div';
    positioning: 'Overlay on shape';
    styling: 'Match shape font and size';
    features: [
      'Auto-select all on focus',
      'Tab to next field',
      'Escape to cancel',
      'Enter to confirm (Shift+Enter for newline)',
      'Auto-resize to content',
    ];
  };
  
  validation: {
    maxLength: 100;
    allowedCharacters: 'Alphanumeric + common symbols';
    uniqueness: 'Check for duplicate names (warning only)';
  };
  
  persistence: {
    autoSave: 'On blur or Enter';
    undoable: true;
    triggerEvents: ['onShapeEdit', 'onDiagramChange'];
  };
}
```

**Test Implementation:**

```typescript
// Playwright MCP test for text editing
async function testTextEditing() {
  // Create shape
  await playwright_browser_press_key({ key: 'c' });
  
  // Start editing with F2
  await playwright_browser_press_key({ key: 'F2' });
  
  // Type new name
  await playwright_browser_type({
    element: 'Shape label editor',
    ref: 'div[contenteditable="true"]',
    text: 'UserAccount'
  });
  
  // Confirm with Enter
  await playwright_browser_press_key({ key: 'Enter' });
  
  // Verify label updated
  const snapshot = await playwright_browser_snapshot();
  assert(snapshot.includes('UserAccount'));
}
```

#### Day 5: Shape Management

**Task IC-009: Shape CRUD Operations**

```typescript
interface ShapeManagementSpecification {
  operations: {
    create: {
      shortcuts: { c: 'class', m: 'method', i: 'interface' };
      api: 'shapeManager.createShape(type, position?, data?)';
      events: 'onShapeCreate, onDiagramChange';
      undo: 'Supported via history manager';
    };
    
    read: {
      api: [
        'shapeManager.getShape(id)',
        'shapeManager.getAllShapes()',
        'shapeManager.getShapesByType(type)',
        'shapeManager.getConnectedShapes(id)',
      ];
      performance: 'O(1) lookup via Map';
    };
    
    update: {
      api: 'shapeManager.updateShape(id, updates)';
      validation: 'Type checking, bounds checking';
      events: 'onShapeUpdate, onDiagramChange';
      batching: 'Queue updates for single render';
    };
    
    delete: {
      shortcuts: ['Delete', 'Backspace'];
      api: 'shapeManager.deleteShape(id)';
      cascading: 'Remove associated connections';
      confirmation: 'Only for multiple shapes';
      events: 'onShapeDelete, onDiagramChange';
    };
  };
  
  storage: {
    structure: 'Map<string, Shape>';
    indexing: {
      spatial: 'R-tree for spatial queries',
      type: 'Map<ShapeType, Set<string>>',
      connections: 'Graph structure',
    };
    limits: {
      maxShapes: 10000;
      maxConnections: 50000;
      maxUndoStack: 100;
    };
  };
}
```

---

### Week 4: Connections and Arrows

#### Day 1-2: Connection System

**Task IC-010: Connection Management**

```typescript
interface ConnectionSpecification {
  types: {
    dependency: {
      style: 'solid';
      arrow: 'filled';
      color: '#666';
      width: 2;
    };
    inheritance: {
      style: 'solid';
      arrow: 'empty-triangle';
      color: '#333';
      width: 2;
    };
    implementation: {
      style: 'dashed';
      arrow: 'empty-triangle';
      color: '#666';
      width: 2;
    };
    association: {
      style: 'solid';
      arrow: 'open';
      color: '#999';
      width: 1;
    };
  };
  
  creation: {
    keyboard: {
      'Ctrl+Enter': 'Start connection mode';
      'Arrow keys': 'Select target';
      'Enter': 'Confirm connection';
      'Escape': 'Cancel connection';
    };
    
    mouse: {
      'Drag from shape edge': 'Start connection';
      'Drop on target': 'Create connection';
      'Drop on empty': 'Cancel connection';
    };
    
    validation: [
      'No self-connections (optional)',
      'No duplicate connections',
      'Type compatibility checking',
      'Maximum connections per shape (optional)',
    ];
  };
  
  routing: {
    algorithm: 'Orthogonal with obstacle avoidance';
    strategies: [
      'Direct line (simple)',
      'Manhattan routing (orthogonal)',
      'Curved bezier (smooth)',
      'Smart routing (avoid overlaps)',
    ];
    
    optimization: {
      caching: 'Cache calculated paths';
      batching: 'Update multiple connections together';
      incremental: 'Only recalculate affected paths';
    };
  };
}
```

**Arrow Rendering Implementation:**

```typescript
class ArrowRenderer {
  renderArrow(
    from: Point,
    to: Point,
    type: ConnectionType,
    selected: boolean
  ): KonvaArrow {
    // Calculate path
    const path = this.calculatePath(from, to);
    
    // Create arrow shape
    const arrow = new Konva.Arrow({
      points: path,
      pointerLength: 10,
      pointerWidth: 10,
      fill: type.color,
      stroke: type.color,
      strokeWidth: selected ? type.width + 1 : type.width,
      dash: type.style === 'dashed' ? [5, 5] : undefined,
      tension: type.style === 'curved' ? 0.3 : 0,
    });
    
    // Add hover effect
    arrow.on('mouseenter', () => {
      arrow.strokeWidth(type.width + 2);
      document.body.style.cursor = 'pointer';
    });
    
    arrow.on('mouseleave', () => {
      arrow.strokeWidth(type.width);
      document.body.style.cursor = 'default';
    });
    
    return arrow;
  }
  
  calculatePath(from: Point, to: Point): number[] {
    // Implement routing algorithm
    // Return array of points for Konva
  }
}
```

#### Day 3-4: Dynamic Arrow Updates

**Task IC-011: Real-time Connection Updates**

```typescript
interface DynamicConnectionSpecification {
  updates: {
    triggers: [
      'Shape position change',
      'Shape size change',
      'Shape deletion',
      'Connection type change',
      'Viewport change (LOD adjustments)',
    ];
    
    strategy: {
      immediate: 'User-initiated changes';
      debounced: 'Automatic layout adjustments';
      batched: 'Multiple simultaneous updates';
      animated: 'Smooth transitions (optional)';
    };
  };
  
  optimization: {
    levelOfDetail: {
      far: 'Simple lines';
      medium: 'Styled lines with arrows';
      close: 'Full details with labels';
    };
    
    culling: {
      viewport: 'Only render visible connections';
      occlusion: 'Hide connections behind shapes (optional)';
      density: 'Simplify in dense areas (optional)';
    };
    
    performance: {
      maxRenderPerFrame: 100;
      asyncRendering: 'For large updates';
      webWorker: 'Path calculation (optional)';
    };
  };
}
```

#### Day 5: Connection UI/UX

**Task IC-012: Connection Interaction Polish**

```markdown
## Connection Interaction Requirements

1. Visual Feedback
   - Hover highlight
   - Selection state
   - Direction indicators
   - Connection type badges

2. Creation Flow
   - Ghost connection while dragging
   - Valid target highlighting
   - Snap to connection points
   - Preview of final path

3. Editing
   - Click to select
   - Delete with Delete key
   - Change type via context menu
   - Reroute by dragging (optional)

4. Labels (optional)
   - Multiplicity (1..*, 0..1)
   - Relationship name
   - Auto-positioning along path
```

---

### Week 5: Layout and Automation

#### Day 1-3: Auto-Layout Algorithms

**Task IC-013: Layout Engine Implementation**

```typescript
interface LayoutEngineSpecification {
  algorithms: {
    hierarchical: {
      type: 'Sugiyama/Layered';
      direction: ['top-down', 'left-right', 'bottom-up', 'right-left'];
      spacing: { x: 100, y: 80 };
      features: [
        'Minimize edge crossings',
        'Maintain hierarchy levels',
        'Compact arrangement',
        'Preserve user adjustments',
      ];
    };
    
    force: {
      type: 'Force-directed/Spring';
      forces: {
        repulsion: 'Between all nodes';
        attraction: 'Along edges';
        gravity: 'Toward center';
        collision: 'Prevent overlaps';
      };
      parameters: {
        iterations: 300;
        temperature: 100;
        cooling: 0.95;
      };
    };
    
    grid: {
      type: 'Grid arrangement';
      columns: 'Auto or specified';
      spacing: 'Uniform';
      sorting: ['type', 'name', 'connections'];
    };
    
    circular: {
      type: 'Circular/Radial';
      center: 'Most connected node';
      rings: 'By distance/hierarchy';
      spacing: 'Even distribution';
    };
  };
  
  api: {
    apply: 'layoutEngine.apply(shapes, connections, algorithm, options)';
    preview: 'layoutEngine.preview(algorithm) // Ghost positions';
    animate: 'layoutEngine.animateTransition(duration)';
    undo: 'layoutEngine.revert()';
  };
  
  performance: {
    async: 'Web Worker for large graphs';
    incremental: 'Partial layout for new nodes';
    caching: 'Store layout results';
    maxNodes: 1000; // For real-time calculation
  };
}
```

**Layout Implementation Example:**

```typescript
class HierarchicalLayout {
  apply(
    shapes: Map<string, Shape>,
    connections: Connection[],
    options: LayoutOptions
  ): LayoutResult {
    // Build graph structure
    const graph = this.buildGraph(shapes, connections);
    
    // Assign layers (Longest Path)
    const layers = this.assignLayers(graph);
    
    // Order nodes within layers (Barycenter)
    this.orderNodesInLayers(layers, graph);
    
    // Assign coordinates
    const positions = this.assignCoordinates(layers, options);
    
    // Return new positions
    return {
      positions,
      duration: 800,
      easing: 'ease-in-out',
    };
  }
  
  private assignLayers(graph: Graph): Layer[] {
    // Implement longest path algorithm
    // Handle cycles with feedback edge detection
  }
  
  private orderNodesInLayers(layers: Layer[], graph: Graph): void {
    // Minimize crossings using barycenter method
    // Or use more advanced like median heuristic
  }
}
```

#### Day 4-5: Smart Positioning

**Task IC-014: Intelligent Shape Placement**

```typescript
interface SmartPositioningSpecification {
  features: {
    contextAware: {
      rules: [
        'Place related shapes nearby',
        'Maintain visual hierarchy',
        'Respect existing layout patterns',
        'Avoid overlapping',
        'Maintain minimum spacing',
      ];
      
      analysis: {
        connectionDensity: 'Identify clusters';
        shapeTypes: 'Group similar types';
        userPatterns: 'Learn from user adjustments';
      };
    };
    
    gridSnapping: {
      enabled: 'User preference';
      gridSize: [10, 20, 50];
      magnetism: 'Snap when within 5px';
      visual: 'Show grid on drag (optional)';
    };
    
    alignment: {
      guides: 'Show alignment lines';
      snap: 'Snap to other shapes';
      distribute: 'Even spacing command';
      align: 'Top/bottom/left/right/center';
    };
  };
  
  api: {
    suggest: 'positioner.suggestPosition(shapeType, context)';
    validate: 'positioner.isValidPosition(position, shape)';
    adjust: 'positioner.adjustPosition(position, constraints)';
    optimize: 'positioner.optimizeLayout(shapes)';
  };
}
```

---

### Week 6: Advanced Features

#### Day 1-2: Undo/Redo System

**Task IC-015: Command Pattern Implementation**

```typescript
interface UndoRedoSpecification {
  architecture: {
    pattern: 'Command Pattern';
    storage: 'Immutable state snapshots';
    granularity: 'Individual actions';
    grouping: 'Related actions (drag sessions)';
  };
  
  commands: {
    ShapeCreateCommand: {
      execute: 'Add shape to diagram';
      undo: 'Remove shape from diagram';
      data: 'Shape details';
    };
    
    ShapeUpdateCommand: {
      execute: 'Apply updates';
      undo: 'Restore previous state';
      data: 'Previous and new state';
    };
    
    ConnectionCreateCommand: {
      execute: 'Add connection';
      undo: 'Remove connection';
      data: 'Connection details';
    };
    
    LayoutCommand: {
      execute: 'Apply new layout';
      undo: 'Restore previous positions';
      data: 'Position maps';
    };
  };
  
  limits: {
    stackSize: 100;
    memoryLimit: '50MB';
    compression: 'LZ-string for large states';
    persistence: 'LocalStorage for session recovery';
  };
}
```

#### Day 3-4: Copy/Paste and Multi-Select

**Task IC-016: Clipboard Operations**

```typescript
interface ClipboardSpecification {
  operations: {
    copy: {
      shortcut: 'Ctrl+C';
      data: 'Shapes + relative positions + connections';
      format: 'JSON + optional image';
      api: 'clipboard.copy(selection)';
    };
    
    cut: {
      shortcut: 'Ctrl+X';
      behavior: 'Copy + delete';
      animation: 'Fade out effect';
    };
    
    paste: {
      shortcut: 'Ctrl+V';
      positioning: 'Offset from original or at cursor';
      idGeneration: 'New unique IDs';
      connectionHandling: 'Preserve internal, drop external';
    };
    
    duplicate: {
      shortcut: 'Ctrl+D';
      behavior: 'Copy + paste with offset';
      offset: { x: 20, y: 20 };
    };
  };
  
  multiSelect: {
    keyboard: {
      'Shift+Arrow': 'Extend selection';
      'Ctrl+A': 'Select all';
      'Ctrl+Shift+A': 'Deselect all';
    };
    
    mouse: {
      'Ctrl+Click': 'Toggle selection';
      'Drag rectangle': 'Box selection';
      'Shift+Drag': 'Add to selection';
    };
    
    operations: [
      'Move together',
      'Delete multiple',
      'Copy multiple',
      'Align/distribute',
      'Group/ungroup',
    ];
  };
}
```

#### Day 5: Performance Optimization

**Task IC-017: Rendering Optimization**

```typescript
interface PerformanceOptimizationSpecification {
  strategies: {
    culling: {
      viewport: 'Only render visible shapes';
      frustum: 'Early rejection of off-screen elements';
      occlusion: 'Skip hidden elements (optional)';
    };
    
    batching: {
      draws: 'Combine similar render calls';
      updates: 'Queue and batch state changes';
      events: 'Debounce/throttle handlers';
    };
    
    caching: {
      shapes: 'Cache complex shape renders';
      paths: 'Cache connection paths';
      calculations: 'Memoize expensive operations';
    };
    
    progressive: {
      loading: 'Load shapes in chunks';
      rendering: 'Render in priority order';
      detail: 'Adjust based on zoom level';
    };
  };
  
  monitoring: {
    metrics: [
      'Frame rate (target: 60fps)',
      'Frame time (target: <16ms)',
      'Memory usage (target: <100MB)',
      'Input latency (target: <50ms)',
    ];
    
    tools: {
      internal: 'Performance.now() measurements';
      external: 'Chrome DevTools integration';
      reporting: 'Send metrics to analytics';
    };
  };
  
  targets: {
    shapes: {
      '100': '60fps smooth',
      '500': '30fps minimum',
      '1000': '15fps with LOD',
      '5000': 'Static render with updates',
    };
  };
}
```

---

### Week 7: Polish and Accessibility

#### Day 1-2: Visual Design System

**Task IC-018: Theme and Styling**

```typescript
interface DesignSystemSpecification {
  theme: {
    colors: {
      primary: '#1976d2';
      secondary: '#dc004e';
      success: '#4caf50';
      warning: '#ff9800';
      error: '#f44336';
      
      background: {
        default: '#fafafa';
        paper: '#ffffff';
        canvas: '#f5f5f5';
      };
      
      text: {
        primary: 'rgba(0, 0, 0, 0.87)';
        secondary: 'rgba(0, 0, 0, 0.6)';
        disabled: 'rgba(0, 0, 0, 0.38)';
      };
    };
    
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif';
      sizes: {
        h1: '24px';
        h2: '20px';
        body: '14px';
        small: '12px';
      };
      weights: {
        regular: 400;
        medium: 500;
        bold: 600;
      };
    };
    
    spacing: {
      unit: 8;
      scales: [0, 4, 8, 16, 24, 32, 48, 64];
    };
    
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)';
      md: '0 4px 6px rgba(0,0,0,0.16)';
      lg: '0 10px 20px rgba(0,0,0,0.19)';
    };
    
    transitions: {
      fast: '150ms ease-in-out';
      normal: '300ms ease-in-out';
      slow: '450ms ease-in-out';
    };
  };
  
  darkMode: {
    automatic: 'Follow system preference';
    manual: 'User toggle';
    colors: 'Inverted with adjusted saturation';
    persistence: 'LocalStorage preference';
  };
}
```

#### Day 3-4: Accessibility Implementation

**Task IC-019: WCAG Compliance**

```typescript
interface AccessibilitySpecification {
  keyboard: {
    navigation: '100% keyboard accessible';
    shortcuts: 'Customizable and documented';
    focus: 'Visible focus indicators';
    traps: 'No keyboard traps';
  };
  
  screenReader: {
    landmarks: 'Proper ARIA landmarks';
    labels: 'All interactive elements labeled';
    liveRegions: 'Announce dynamic changes';
    descriptions: 'Detailed shape descriptions';
    
    announcements: [
      'Navigation changes',
      'Shape creation/deletion',
      'Connection changes',
      'Mode switches',
      'Error messages',
    ];
  };
  
  visual: {
    contrast: {
      normal: '4.5:1 minimum';
      large: '3:1 minimum';
      graphics: '3:1 minimum';
    };
    
    colorBlind: {
      modes: ['protanopia', 'deuteranopia', 'tritanopia'];
      indicators: 'Patterns in addition to colors';
      testing: 'Automated color contrast checks';
    };
    
    zoom: {
      support: 'Up to 200% browser zoom';
      reflow: 'No horizontal scrolling';
      text: 'Scalable fonts';
    };
  };
  
  motor: {
    targetSize: '44x44px minimum touch targets';
    spacing: '8px between targets';
    timing: 'No time limits on interactions';
    gestures: 'Keyboard alternatives for all';
  };
}
```

**Implementation Example:**

```tsx
// Accessible shape component
const AccessibleShape: React.FC<ShapeProps> = ({ shape, selected }) => {
  const description = `${shape.type} named ${shape.name}, 
    ${shape.connections.length} connections, 
    ${selected ? 'selected' : 'not selected'}`;
  
  return (
    <Group
      role="button"
      tabIndex={0}
      aria-label={shape.name}
      aria-description={description}
      aria-selected={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSelect(shape.id);
        }
      }}
    >
      {/* Shape rendering */}
    </Group>
  );
};
```

#### Day 5: Documentation and Help

**Task IC-020: Help System and Documentation**

```typescript
interface HelpSystemSpecification {
  inline: {
    tooltips: 'Hover help for all tools';
    shortcuts: 'Keyboard overlay (? key)';
    hints: 'Contextual tips';
    tour: 'First-time user walkthrough';
  };
  
  documentation: {
    userGuide: 'Complete feature documentation';
    apiDocs: 'Developer documentation';
    shortcuts: 'Printable cheat sheet';
    videoTutorials: 'Screen recordings';
  };
  
  interactive: {
    playground: 'Try features safely';
    examples: 'Sample diagrams';
    templates: 'Starting points';
  };
}
```

---

### Week 8: Integration and Export

#### Day 1-3: Code Analysis Integration

**Task IC-021: AST Parser Integration**

```typescript
interface CodeAnalysisSpecification {
  parsers: {
    typescript: {
      library: '@typescript-compiler/api';
      features: [
        'Class extraction',
        'Interface extraction',
        'Method signatures',
        'Property types',
        'Import/export analysis',
        'Inheritance chains',
      ];
    };
    
    javascript: {
      library: '@babel/parser';
      features: [
        'ES6 classes',
        'Function analysis',
        'Module dependencies',
      ];
    };
  };
  
  analysis: {
    structure: {
      classes: 'Extract class definitions';
      methods: 'Parse method signatures';
      properties: 'Identify properties and types';
      relationships: 'Detect inheritance and imports';
    };
    
    metrics: {
      complexity: 'Cyclomatic complexity';
      coupling: 'Afferent/efferent coupling';
      cohesion: 'Class cohesion metrics';
      size: 'Lines of code, methods count';
    };
  };
  
  visualization: {
    mapping: {
      'class': 'ClassShape';
      'interface': 'InterfaceShape';
      'method': 'MethodShape';
      'extends': 'InheritanceConnection';
      'implements': 'ImplementationConnection';
      'imports': 'DependencyConnection';
    };
    
    layout: {
      strategy: 'Hierarchical by default';
      grouping: 'By module/package';
      filtering: 'Show/hide by type or metric';
    };
  };
}
```

#### Day 4-5: Export Functionality

**Task IC-022: Export System**

```typescript
interface ExportSpecification {
  formats: {
    png: {
      quality: 'High resolution (2x)';
      background: 'Transparent or white';
      size: 'Fit content or specified';
    };
    
    svg: {
      scalable: true;
      editable: 'Preserve shape data';
      optimization: 'SVGO for file size';
    };
    
    pdf: {
      library: 'jsPDF or pdfmake';
      layout: 'A4/Letter with pagination';
      vector: 'Preserve as vectors';
    };
    
    json: {
      structure: 'Complete diagram data';
      version: 'Schema versioning';
      compression: 'Optional gzip';
    };
    
    code: {
      plantuml: 'PlantUML syntax';
      mermaid: 'Mermaid diagram syntax';
      graphviz: 'DOT notation';
    };
  };
  
  options: {
    selection: 'Export all or selected';
    quality: 'Low/medium/high';
    metadata: 'Include or exclude';
    watermark: 'Optional branding';
  };
}
```

---

## Testing Requirements

### Unit Test Coverage

```yaml
Coverage Targets:
  Overall: '>= 80%'
  Core Systems: '>= 90%'
  Components: '>= 75%'
  Utilities: '>= 95%'
  
Test Categories:
  - Component rendering
  - State management
  - Event handlers
  - API calls
  - Utility functions
  - Performance metrics
```

### E2E Test Scenarios

```typescript
// Critical user journeys to test
const e2eScenarios = [
  'Create diagram from scratch',
  'Navigate with keyboard only',
  'Import and modify existing diagram',
  'Export diagram in multiple formats',
  'Collaborate with real-time updates',
  'Handle 100+ shapes performance',
  'Recover from errors gracefully',
  'Work offline and sync when online',
];
```

### Playwright MCP Test Scripts

```typescript
// Example comprehensive E2E test
async function testCompleteDiagramCreation() {
  // Setup
  await playwright_browser_navigate({ url: 'http://localhost:5173' });
  await playwright_browser_wait_for({ time: 2 });
  
  // Create class diagram
  await playwright_browser_press_key({ key: 'c' });
  await playwright_browser_type({
    element: 'Shape label',
    ref: '[contenteditable]',
    text: 'User'
  });
  
  // Add properties
  await playwright_browser_press_key({ key: 'Tab' });
  await playwright_browser_type({
    element: 'Properties field',
    ref: '[data-field="properties"]',
    text: 'id: number\nname: string\nemail: string'
  });
  
  // Create connected class
  await playwright_browser_press_key({ key: 'Enter' });
  await playwright_browser_type({
    element: 'Shape label',
    ref: '[contenteditable]',
    text: 'Order'
  });
  
  // Create connection
  await playwright_browser_press_key({ key: 'Control+Enter' });
  await playwright_browser_press_key({ key: 'ArrowLeft' });
  await playwright_browser_press_key({ key: 'Enter' });
  
  // Apply layout
  await playwright_browser_press_key({ key: 'Alt+L' });
  await playwright_browser_click({
    element: 'Hierarchical layout option',
    ref: '[data-layout="hierarchical"]'
  });
  
  // Export
  await playwright_browser_press_key({ key: 'Control+E' });
  await playwright_browser_click({
    element: 'PNG export option',
    ref: '[data-export="png"]'
  });
  
  // Verify
  const snapshot = await playwright_browser_snapshot();
  assert(snapshot.includes('User'));
  assert(snapshot.includes('Order'));
  assert(snapshot.includes('connection'));
}
```

---

## Performance Benchmarks

### Target Metrics

```typescript
interface PerformanceTargets {
  rendering: {
    fps: {
      idle: 60;
      panning: 60;
      zooming: 30;
      creating: 30;
    };
    
    frameTime: {
      p50: '<8ms';
      p95: '<16ms';
      p99: '<33ms';
    };
  };
  
  interaction: {
    keyboardLatency: '<50ms';
    shapeCreation: '<100ms';
    connectionCreation: '<150ms';
    layoutCalculation: '<500ms for 100 nodes';
  };
  
  memory: {
    initial: '<50MB';
    per100Shapes: '<10MB';
    maximum: '<500MB';
  };
  
  network: {
    bundleSize: '<500KB gzipped';
    lazyLoadChunks: '<100KB each';
    apiLatency: '<200ms';
  };
}
```

### Performance Test Suite

```typescript
// Performance testing with Playwright
async function runPerformanceTests() {
  const metrics = await playwright_browser_evaluate({
    function: `() => {
      // Create 100 shapes programmatically
      for (let i = 0; i < 100; i++) {
        window.diagramAPI.createShape({
          type: 'class',
          position: { x: i * 150, y: Math.floor(i / 10) * 150 }
        });
      }
      
      // Measure frame rate during pan
      const startTime = performance.now();
      let frameCount = 0;
      
      const measureFPS = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(measureFPS);
        }
      };
      
      measureFPS();
      
      // Pan viewport
      window.diagramAPI.panViewport(500, 500);
      
      // Return metrics after 1 second
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            fps: frameCount,
            memory: performance.memory?.usedJSHeapSize,
            renderTime: performance.measure('render')
          });
        }, 1000);
      });
    }`
  });
  
  // Assert performance targets
  assert(metrics.fps >= 30, `FPS ${metrics.fps} below target`);
  assert(metrics.memory < 100000000, `Memory usage too high`);
}
```

---

## Integration Points

### API Endpoints (Future)

```typescript
interface APIIntegration {
  endpoints: {
    diagrams: {
      'GET /api/diagrams': 'List user diagrams';
      'GET /api/diagrams/:id': 'Get diagram data';
      'POST /api/diagrams': 'Create new diagram';
      'PUT /api/diagrams/:id': 'Update diagram';
      'DELETE /api/diagrams/:id': 'Delete diagram';
    };
    
    collaboration: {
      'WS /api/diagrams/:id/sync': 'Real-time sync';
      'GET /api/diagrams/:id/collaborators': 'List collaborators';
      'POST /api/diagrams/:id/invite': 'Invite collaborator';
    };
    
    export: {
      'POST /api/export/png': 'Server-side PNG generation';
      'POST /api/export/pdf': 'Server-side PDF generation';
    };
  };
}
```

### Third-Party Integrations

```yaml
Integrations:
  IDE:
    - VS Code extension
    - JetBrains plugin
    - Sublime Text package
    
  Version Control:
    - GitHub integration
    - GitLab integration
    - Bitbucket support
    
  Project Management:
    - Jira sync
    - Trello cards
    - Notion embeds
    
  Documentation:
    - Confluence export
    - Markdown generation
    - Static site generators
```

---

## Deployment Strategy

### Environments

```yaml
Development:
  URL: http://localhost:5173
  Branch: feature/*
  Database: Local SQLite
  Auth: Mock auth
  
Staging:
  URL: https://staging.infinite-canvas.app
  Branch: develop
  Database: PostgreSQL (Supabase)
  Auth: Auth0 staging
  
Production:
  URL: https://infinite-canvas.app
  Branch: main
  Database: PostgreSQL (Supabase)
  Auth: Auth0 production
  CDN: Cloudflare
```

### Monitoring

```typescript
interface MonitoringSetup {
  errors: {
    service: 'Sentry';
    config: {
      dsn: process.env.SENTRY_DSN;
      environment: process.env.NODE_ENV;
      tracesSampleRate: 0.1;
    };
  };
  
  analytics: {
    service: 'PostHog';
    events: [
      'diagram_created',
      'shape_added',
      'export_completed',
      'collaboration_started',
    ];
  };
  
  performance: {
    service: 'Web Vitals';
    metrics: ['LCP', 'FID', 'CLS', 'TTFB'];
  };
  
  uptime: {
    service: 'UptimeRobot';
    checks: ['HTTP', 'WebSocket', 'API'];
  };
}
```

---

This detailed plan provides comprehensive specifications for every aspect of the infinite canvas application. Each task is broken down with clear acceptance criteria, test requirements, and implementation guidelines that an AI agent can follow systematically.