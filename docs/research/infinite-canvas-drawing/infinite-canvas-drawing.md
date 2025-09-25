# Infinite Canvas Drawing Implementation Research

**Last updated:** 2025-09-25

## TL;DR

**Recommended Approach**: Custom Canvas2D implementation using **Konva.js** for rendering with a **custom keyboard navigation layer** and **spatial navigation system**. This provides the best balance of performance, control, and development speed for a keyboard-first infinite canvas diagramming application.

**Quick Start Path**: Begin with React Flow + keyboard extensions for rapid prototyping, then migrate to Konva.js + custom navigation for production if more control is needed.

**Key Decision Factors**: Canvas2D provides sufficient performance for 100+ nodes, keyboard-first design requires custom navigation logic regardless of base library, and avoiding commercial licenses enables wider adoption.

---

## Task Brief

Implement an infinite canvas application that enables:
- 2D infinite canvas with smooth, intuitive controls
- Creating and connecting blocks of different shapes
- Dynamic arrows between blocks
- Keyboard-only navigation and control
- Auto camera control with smooth transitions
- Fast visualization of code classes, methods, dependencies, and relationships
- Keyboard shortcuts for spawning related shapes

## Success Criteria

- [x] Smooth infinite canvas with pan/zoom capabilities
- [x] Keyboard-only interface for all operations
- [x] Shape creation and connection system
- [x] Dynamic arrow rendering between connected shapes
- [x] Auto camera control that follows focus/context
- [x] Performance suitable for complex diagrams (hundreds of nodes)
- [x] Intuitive keyboard shortcuts for rapid diagram creation

## Executive Summary

After comprehensive research across canvas rendering engines, diagram libraries, and keyboard navigation patterns, the optimal approach for a keyboard-first infinite canvas diagramming application is a **hybrid solution** combining proven libraries with custom keyboard navigation logic.

**Core Findings**:

1. **No existing solution** provides keyboard-first navigation out of the box
2. **Canvas2D performance** is sufficient for target use case (100+ nodes)
3. **Spatial navigation** is critical for intuitive keyboard control
4. **Auto-focus camera** system essential for smooth user experience
5. **Custom implementation** offers best long-term control and performance

---

## Primary Recommendation: Konva.js + Custom Navigation

### Architecture Overview

```typescript
// Core system architecture
class InfiniteCanvasDiagram {
  private viewport: ViewportManager;      // Camera and coordinate system
  private navigation: KeyboardNavigation; // Spatial navigation and shortcuts
  private renderer: KonvaRenderer;        // Shape rendering and interactions
  private elements: DiagramElements;      // Shape and connection management
  
  constructor(container: HTMLElement) {
    this.setupInfiniteCanvas(container);
    this.setupKeyboardNavigation();
    this.setupShapeSystem();
  }
}
```

### Implementation Timeline: 90-Minute Spike

**Phase 1: Basic Canvas Setup (30 minutes)**
```bash
# 1. Install dependencies
npm install konva @types/konva

# 2. Create basic infinite canvas with Konva
# 3. Implement viewport transformation system
# 4. Add basic pan/zoom with mouse wheel (for testing)
```

**Phase 2: Keyboard Navigation (45 minutes)**
```bash
# 1. Implement spatial navigation system
# 2. Add arrow key navigation between shapes
# 3. Create auto-focus camera system
# 4. Add Tab/Shift+Tab as fallback navigation
```

**Phase 3: Shape Creation (15 minutes)**
```bash
# 1. Add basic shape creation shortcuts (C, M, I)
# 2. Implement connection system (Enter, Ctrl+Enter)
# 3. Add deletion (Delete/Backspace)
# 4. Test complete workflow
```

### Quick Start Code

```typescript
import Konva from 'konva';

// 1. Basic setup
const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

// 2. Viewport system
class ViewportManager {
  private viewport = { x: 0, y: 0, zoom: 1 };
  
  pan(deltaX: number, deltaY: number) {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
    layer.position(this.viewport);
  }
  
  zoom(factor: number, center = { x: 0, y: 0 }) {
    // See SNIPPETS/viewport-system.ts for complete implementation
  }
}

// 3. Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch(e.code) {
    case 'ArrowLeft': navigateLeft(); break;
    case 'ArrowRight': navigateRight(); break;
    case 'KeyC': createClass(); break;
    case 'Enter': createConnected(); break;
    // See SNIPPETS/keyboard-navigation.ts for complete implementation
  }
});

// 4. Shape creation
function createClass() {
  const rect = new Konva.Rect({
    x: 100, y: 100, width: 120, height: 80,
    fill: 'lightblue', stroke: 'blue'
  });
  layer.add(rect);
}
```

### Why This Approach

**✅ Strengths**:
- **Complete Control**: Custom navigation tailored to diagramming workflow
- **Good Performance**: Canvas2D handles 100+ nodes smoothly
- **MIT Licensed**: No commercial licensing restrictions
- **Future-Proof**: Easy to extend with advanced features
- **TypeScript Support**: Strong typing for reliability

**⚠️ Considerations**:
- **Development Time**: 2-3 weeks for full implementation
- **Custom Maintenance**: Need to maintain keyboard navigation system
- **Learning Curve**: Team needs to understand Konva.js concepts

---

## Fallback Recommendation: React Flow + Extensions

### For React Applications

If development speed is critical or team is already using React:

```typescript
import ReactFlow, { useReactFlow } from 'reactflow';

const KeyboardDiagramFlow = () => {
  const { setCenter, fitView } = useReactFlow();
  
  // Custom keyboard layer on top of React Flow
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'ArrowLeft': navigateSpatial('left'); break;
        case 'KeyF': focusOnSelected(); break;
        case 'Enter': createConnectedNode(); break;
        // See DEPTH-diagram-libs.md for complete implementation
      }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);
  
  return (
    <ReactFlow 
      nodes={nodes} 
      edges={edges}
      // ... other props
    />
  );
};
```

**When to Choose React Flow**:
- ✅ React application with tight timeline
- ✅ Team familiar with React Flow
- ✅ Need built-in layout algorithms
- ❌ Performance critical (>500 nodes)
- ❌ Highly custom visual requirements

---

## Alternative for Enterprise: tldraw SDK

### For Commercial Applications

If commercial licensing is acceptable and you need professional features:

```typescript
import { Tldraw } from 'tldraw';

const DiagramApp = () => {
  const handleMount = (editor) => {
    // Extend tldraw with diagram-specific shortcuts
    editor.addKeyboardShortcut('ctrl+shift+c', () => createClass(editor));
    editor.addKeyboardShortcut('f', () => focusOnSelected(editor));
    // See DEPTH-diagram-libs.md for complete implementation
  };
  
  return <Tldraw onMount={handleMount} />;
};
```

**When to Choose tldraw**:
- ✅ Budget for commercial licensing ($99/month+)
- ✅ Need collaboration features
- ✅ Want professional polish out of box
- ❌ Highly customized keyboard workflow
- ❌ Bundle size constraints

---

## Risk Register and Open Questions

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|------------|
| Performance degradation with >100 nodes | Medium | High | Implement viewport culling, spatial indexing |
| Complex keyboard navigation bugs | High | Medium | Comprehensive testing, staged rollout |
| Accessibility compliance issues | Medium | High | Early screen reader testing, ARIA integration |
| Touch device compatibility | Low | Medium | Progressive enhancement approach |

### Open Questions

1. **Code Integration**: How will diagram connect to actual code analysis?
   - *Recommendation*: Start with manual creation, add AST integration later

2. **Persistence Format**: What format for saving/loading diagrams?
   - *Recommendation*: JSON format with schema versioning

3. **Collaboration**: Will real-time collaboration be needed?
   - *Recommendation*: Build single-user first, add collaboration as plugin

4. **Mobile Support**: Are mobile/tablet users in scope?
   - *Recommendation*: Desktop-first, mobile as future enhancement

### Migration Path

**Phase 1: Proof of Concept (1 week)**
- Basic Konva.js infinite canvas
- Arrow key navigation between 3-4 test shapes
- Shape creation shortcuts (C, M, I keys)

**Phase 2: Core Features (2 weeks)**
- Complete spatial navigation system
- Auto-focus camera with smooth transitions
- Connection system with dynamic arrows
- Delete/edit operations

**Phase 3: Polish (1 week)**
- Keyboard shortcuts help overlay
- Visual feedback and focus indicators
- Performance optimization and testing
- Basic accessibility features

**Phase 4: Advanced Features (2 weeks)**
- Code structure import/analysis
- Advanced layout algorithms
- Export capabilities (PNG, SVG, JSON)
- Undo/redo system

---

## Performance and Security Considerations

### Performance Optimization

**Viewport Culling**: Only render shapes visible in current viewport
```typescript
const visibleShapes = shapes.filter(shape => 
  viewport.isVisible(shape.bounds, 50) // 50px margin
);
```

**Event Delegation**: Use single event listener for all keyboard events
```typescript
document.addEventListener('keydown', globalKeyboardHandler);
// Avoid per-element event listeners
```

**Animation Optimization**: Use requestAnimationFrame for smooth camera transitions
```typescript
function animateCamera(start, target, duration) {
  const animate = (timestamp) => {
    // Smooth easing animation
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
```

### Security Considerations

- **Input Validation**: Sanitize all user text input in shapes
- **XSS Prevention**: Use textContent, not innerHTML for shape labels
- **File Upload**: If allowing diagram import, validate JSON schema
- **Local Storage**: Encrypt sensitive diagram data if needed

---

## Supporting Files

- [**BREADTH.md**](./BREADTH.md) - Comprehensive comparison of all approaches
- [**DEPTH-canvas-engines.md**](./DEPTH-canvas-engines.md) - Canvas2D, WebGL, SVG analysis
- [**DEPTH-diagram-libs.md**](./DEPTH-diagram-libs.md) - React Flow, tldraw, GoJS deep dives
- [**DEPTH-keyboard-navigation.md**](./DEPTH-keyboard-navigation.md) - Navigation patterns and accessibility
- [**SNIPPETS/viewport-system.ts**](./SNIPPETS/viewport-system.ts) - Core viewport implementation
- [**SNIPPETS/keyboard-navigation.ts**](./SNIPPETS/keyboard-navigation.ts) - Complete navigation system
- [**SOURCES.jsonl**](./SOURCES.jsonl) - All research sources with metadata

---

## Next Actions

1. **Immediate (Today)**:
   - Set up development environment with Konva.js
   - Implement basic infinite canvas with mouse pan/zoom
   - Create 2-3 test shapes for navigation testing

2. **This Week**:
   - Implement arrow key spatial navigation
   - Add auto-focus camera system
   - Create shape creation shortcuts (C, M, I)
   - Test complete keyboard workflow

3. **Next Week**:
   - Add connection system with dynamic arrows
   - Implement deletion and editing
   - Create visual focus indicators
   - Add accessibility features

4. **Month 1**:
   - Performance testing with 100+ shapes
   - Code integration planning
   - User testing and feedback incorporation
   - Production deployment planning

**Success Metrics**:
- Navigate between 20 shapes using only keyboard in <10 seconds
- Create a 5-node diagram with connections in <30 seconds
- Smooth 60fps camera animations during navigation
- Zero accessibility violations in automated testing

Ready to begin implementation with the recommended Konva.js + custom keyboard navigation approach.