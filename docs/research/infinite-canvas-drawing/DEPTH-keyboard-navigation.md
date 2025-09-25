# Deep Dive: Keyboard Navigation Patterns and Camera Control

**Last updated:** 2025-09-25

## Problem Fit and Decision Criteria

For keyboard-only infinite canvas diagramming, navigation system must provide:

- **Spatial navigation** between diagram elements
- **Smooth camera control** with auto-focus features  
- **Intuitive shortcuts** for rapid diagram creation
- **Mode switching** between selection, creation, and connection
- **Accessibility compliance** for screen readers and keyboard-only users

## Core Navigation Patterns

### Pattern 1: Spatial Navigation System

**Concept**: Navigate between elements based on spatial relationships rather than creation order.

```typescript
// Find nearest element in specified direction
function findNearest(current: Element, direction: Direction): Element | null {
  const candidates = elements.filter(el => isInDirection(current, el, direction));
  return candidates.reduce((closest, candidate) => {
    const distance = calculateDistance(current, candidate);
    return !closest || distance < calculateDistance(current, closest) 
      ? candidate : closest;
  }, null);
}

// Direction-based filtering with overlap tolerance
function isInDirection(from: Element, to: Element, direction: Direction): boolean {
  const threshold = 30; // Pixel overlap tolerance
  
  switch (direction) {
    case 'left':
      return to.x + to.width < from.x + threshold &&
             hasVerticalOverlap(from, to, threshold);
    case 'right':
      return to.x > from.x + from.width - threshold &&
             hasVerticalOverlap(from, to, threshold);
    // Similar for up/down
  }
}
```

**Benefits**:
- Intuitive for users familiar with arrow key navigation
- Predictable behavior based on visual layout
- Works well with irregular diagram layouts

**Challenges**:
- Complex algorithm for overlapping elements
- Edge cases when no elements exist in direction
- Performance with large numbers of elements

### Pattern 2: Camera Auto-Focus System

**Concept**: Automatically move camera to keep selected elements in view with smooth transitions.

```typescript
class AutoFocusCamera {
  focusOnElement(element: Element, padding = 50, duration = 600) {
    const targetBounds = {
      x: element.x - padding,
      y: element.y - padding,
      width: element.width + padding * 2,
      height: element.height + padding * 2
    };
    
    const targetZoom = this.calculateOptimalZoom(targetBounds);
    const targetPosition = this.calculateCenterPosition(targetBounds, targetZoom);
    
    this.animateToViewport({
      x: targetPosition.x,
      y: targetPosition.y,
      zoom: targetZoom
    }, duration);
  }
  
  // Smart focus that considers element relationships
  focusOnGroup(elementIds: string[]) {
    const bounds = this.calculateGroupBounds(elementIds);
    const connectedElements = this.findConnectedElements(elementIds);
    
    // Include connected elements in view if they fit reasonably
    if (connectedElements.length > 0) {
      const expandedBounds = this.calculateGroupBounds([
        ...elementIds, 
        ...connectedElements
      ]);
      
      // Only expand view if it doesn't reduce zoom too much
      if (expandedBounds.area / bounds.area < 4) {
        bounds = expandedBounds;
      }
    }
    
    this.focusOnBounds(bounds);
  }
}
```

### Pattern 3: Mode-Based Shortcut System

**Concept**: Different keyboard shortcuts active based on current interaction mode.

```typescript
enum NavigationMode {
  SELECT = 'select',
  CREATE = 'create', 
  CONNECT = 'connect',
  EDIT = 'edit'
}

class ModeBasedNavigation {
  private shortcuts = new Map<string, Map<string, () => void>>();
  
  constructor() {
    this.setupModeShortcuts();
  }
  
  private setupModeShortcuts() {
    // SELECT mode shortcuts
    this.shortcuts.set(NavigationMode.SELECT, new Map([
      ['ArrowLeft', () => this.navigateLeft()],
      ['ArrowRight', () => this.navigateRight()],
      ['Enter', () => this.startEditing()],
      ['c', () => this.setMode(NavigationMode.CREATE)],
      ['r', () => this.setMode(NavigationMode.CONNECT)],
      ['Delete', () => this.deleteSelected()],
      ['f', () => this.focusOnSelected()],
    ]));
    
    // CREATE mode shortcuts  
    this.shortcuts.set(NavigationMode.CREATE, new Map([
      ['c', () => this.createClass()],
      ['m', () => this.createMethod()],
      ['i', () => this.createInterface()],
      ['Enter', () => this.createConnected()],
      ['Escape', () => this.setMode(NavigationMode.SELECT)],
    ]));
    
    // CONNECT mode shortcuts
    this.shortcuts.set(NavigationMode.CONNECT, new Map([
      ['ArrowLeft', () => this.selectConnectionTarget('left')],
      ['ArrowRight', () => this.selectConnectionTarget('right')],
      ['Enter', () => this.confirmConnection()],
      ['Escape', () => this.cancelConnection()],
    ]));
  }
}
```

## Advanced Navigation Features

### Smart Grid Navigation

For structured diagrams, implement grid-based navigation that snaps to logical positions:

```typescript
class GridNavigation {
  private gridSize = 50; // Logical grid size
  
  findGridPosition(x: number, y: number): Point {
    return {
      x: Math.round(x / this.gridSize) * this.gridSize,
      y: Math.round(y / this.gridSize) * this.gridSize
    };
  }
  
  // Navigate to next grid position in direction
  navigateGrid(direction: Direction) {
    const current = this.getSelectedElement();
    if (!current) return;
    
    const currentGrid = this.worldToGrid(current.position);
    const targetGrid = this.offsetGrid(currentGrid, direction);
    const targetWorld = this.gridToWorld(targetGrid);
    
    // Find element at or near target grid position
    const target = this.findElementNearPosition(targetWorld, this.gridSize);
    if (target) {
      this.selectElement(target.id);
    } else {
      // Move camera to empty grid position for potential creation
      this.moveCamera(targetWorld);
    }
  }
}
```

### Contextual Camera Behavior

Adjust camera behavior based on diagram type and user activity:

```typescript
class ContextualCamera {
  private context: DiagramContext;
  
  // Adjust zoom behavior based on diagram density
  getOptimalZoom(elementCount: number, diagramBounds: Bounds): number {
    const density = elementCount / (diagramBounds.width * diagramBounds.height);
    
    if (density > 0.001) {
      // High density: zoom out to show more context
      return Math.max(0.5, this.currentZoom * 0.8);
    } else if (density < 0.0001) {
      // Low density: zoom in for detail
      return Math.min(2.0, this.currentZoom * 1.2);
    }
    
    return this.currentZoom;
  }
  
  // Focus behavior that considers element type
  focusOnElement(element: Element) {
    const padding = this.getPaddingForType(element.type);
    const zoomLevel = this.getZoomForType(element.type);
    
    // Classes need more space to show methods
    if (element.type === 'class') {
      this.focusWithConnections(element, padding, zoomLevel);
    } else {
      this.focusStandard(element, padding, zoomLevel);
    }
  }
}
```

## Performance Optimization

### Efficient Spatial Queries

For large diagrams, optimize spatial navigation with spatial data structures:

```typescript
class SpatialIndex {
  private quadTree: QuadTree;
  
  findElementsInDirection(
    origin: Point, 
    direction: Direction, 
    maxDistance = 500
  ): Element[] {
    // Define search region based on direction
    const searchRegion = this.getDirectionalRegion(origin, direction, maxDistance);
    
    // Query spatial index instead of checking all elements
    return this.quadTree.query(searchRegion)
      .filter(element => this.isInDirection(origin, element, direction))
      .sort((a, b) => this.distance(origin, a) - this.distance(origin, b));
  }
  
  updateElementPosition(element: Element) {
    this.quadTree.remove(element);
    this.quadTree.insert(element);
  }
}
```

### Viewport Culling for Navigation

Only consider visible elements for navigation when diagram is very large:

```typescript
class OptimizedNavigation {
  findNearestVisible(
    current: Element, 
    direction: Direction
  ): Element | null {
    const viewportBounds = this.camera.getViewportBounds();
    
    // Expand viewport in navigation direction
    const searchBounds = this.expandBounds(viewportBounds, direction, 200);
    
    const visibleElements = this.spatialIndex.query(searchBounds);
    return this.findNearest(current, direction, visibleElements);
  }
}
```

## Accessibility Considerations

### Screen Reader Integration

Provide textual navigation context for screen readers:

```typescript
class AccessibleNavigation {
  announceNavigation(from: Element, to: Element, direction: Direction) {
    const message = `Navigated ${direction} from ${from.label} to ${to.label}`;
    this.announceToScreenReader(message);
  }
  
  announcePosition(element: Element) {
    const connections = element.connections.length;
    const message = `Selected ${element.type} "${element.label}" with ${connections} connections`;
    this.announceToScreenReader(message);
  }
  
  private announceToScreenReader(message: string) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
}
```

### Focus Management

Maintain proper focus states for keyboard navigation:

```typescript
class FocusManager {
  private focusRing: Element[] = [];
  
  updateFocusRing(elements: Element[]) {
    // Order elements for logical tab navigation
    this.focusRing = this.sortForNavigation(elements);
  }
  
  private sortForNavigation(elements: Element[]): Element[] {
    // Sort by position: top-to-bottom, left-to-right
    return elements.sort((a, b) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 50) return yDiff;
      return a.x - b.x;
    });
  }
  
  navigateTabOrder(direction: 1 | -1): Element | null {
    const current = this.getSelected();
    const currentIndex = this.focusRing.indexOf(current);
    
    const nextIndex = currentIndex === -1 
      ? 0 
      : (currentIndex + direction + this.focusRing.length) % this.focusRing.length;
    
    return this.focusRing[nextIndex];
  }
}
```

## Integration Example

Complete integration showing how navigation patterns work together:

```typescript
class InfiniteCanvasNavigation {
  private spatial: SpatialNavigation;
  private camera: AutoFocusCamera;
  private modes: ModeBasedNavigation;
  private accessibility: AccessibleNavigation;
  
  constructor(canvas: HTMLCanvasElement) {
    this.spatial = new SpatialNavigation();
    this.camera = new AutoFocusCamera(canvas);
    this.modes = new ModeBasedNavigation();
    this.accessibility = new AccessibleNavigation();
    
    this.bindEvents();
  }
  
  private bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (this.isTextInputActive()) return;
      
      const handled = this.modes.handleKey(e);
      if (handled) {
        e.preventDefault();
        
        // Auto-focus on selection changes
        if (this.modes.currentMode === NavigationMode.SELECT) {
          const selected = this.getSelected();
          if (selected) {
            this.camera.focusOnElement(selected);
            this.accessibility.announcePosition(selected);
          }
        }
      }
    });
  }
  
  // High-level navigation commands
  navigateToRelated(element: Element, relationship: 'parent' | 'child' | 'sibling') {
    const related = this.findRelatedElements(element, relationship);
    if (related.length === 0) return;
    
    if (related.length === 1) {
      this.selectElement(related[0]);
      this.camera.focusOnElement(related[0]);
    } else {
      // Show selection UI for multiple related elements
      this.showRelatedElementsMenu(related);
    }
  }
  
  createDiagramFromCode(codeStructure: CodeStructure) {
    // Auto-layout elements based on code relationships
    const layout = this.calculateLayout(codeStructure);
    
    // Create elements with keyboard-friendly positioning
    layout.forEach(item => {
      this.createElement(item.type, item.position);
    });
    
    // Focus on root element
    const root = layout.find(item => item.isRoot);
    if (root) {
      this.selectElement(root.id);
      this.camera.focusOnElement(root.element);
    }
  }
}
```

## Recommendation Summary

### Essential Features
1. **Spatial navigation** with arrow keys and vim-style hjkl
2. **Auto-focus camera** that follows selection
3. **Mode-based shortcuts** for different interaction types
4. **Tab navigation** as fallback for spatial navigation
5. **Accessibility announcements** for screen readers

### Performance Optimizations
- Spatial indexing for large diagrams (>100 elements)
- Viewport culling for navigation queries
- Efficient camera animation with requestAnimationFrame

### User Experience Enhancements
- Smart zoom levels based on element type
- Contextual padding for different diagram elements
- Visual focus indicators with smooth transitions
- Keyboard shortcut help overlay

**Recommended Implementation Order**:
1. Basic arrow key spatial navigation
2. Auto-focus camera system
3. Element creation shortcuts
4. Mode switching and specialized shortcuts
5. Accessibility and screen reader support